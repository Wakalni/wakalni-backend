// src/modules/stock/stock.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { StockItem } from './entities/stock.entity';
import { StockAdjustment } from './entities/stock-adjustement.entity';
import { CreateStockItemDto } from './dto/create-stock.dto';
import { UpdateStockItemDto } from './dto/update-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { StockReportDto } from './dto/stock-report.dto';
import { StockAdjustmentType } from './entities/stock-adjustement.entity';
import { Ingredient } from '../ingredient/entities/ingredient.entity';
import { Restaurant } from '../restaurant/entities/restaurant.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(StockItem)
    private stockItemRepository: Repository<StockItem>,
    @InjectRepository(StockAdjustment)
    private stockAdjustmentRepository: Repository<StockAdjustment>,
    @InjectRepository(Ingredient)
    private ingredientRepository: Repository<Ingredient>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) {}

  async create(createStockItemDto: CreateStockItemDto): Promise<StockItem> {
    const ingredient = await this.ingredientRepository.findOne({
      where: { id: createStockItemDto.ingredient_id },
    });

    if (!ingredient) {
      throw new NotFoundException('Ingredient not found');
    }

    const restaurant = await this.restaurantRepository.findOne({
      where: { id: createStockItemDto.restaurant_id },
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const existingStockItem = await this.stockItemRepository.findOne({
      where: {
        ingredient_id: createStockItemDto.ingredient_id,
        restaurant_id: createStockItemDto.restaurant_id,
      },
    });

    if (existingStockItem) {
      throw new ConflictException('Stock item already exists for this ingredient and restaurant');
    }

    const stockItem = this.stockItemRepository.create(createStockItemDto);
    return this.stockItemRepository.save(stockItem);
  }

  async findAll(restaurantId?: string): Promise<StockItem[]> {
    const where = restaurantId ? { restaurant_id: restaurantId } : {};
    return this.stockItemRepository.find({
      where,
      relations: ['ingredient', 'restaurant'],
      order: { ingredient: { name: 'ASC' } },
    });
  }

  async findOne(id: string): Promise<StockItem> {
    const stockItem = await this.stockItemRepository.findOne({
      where: { id },
      relations: ['ingredient', 'restaurant', 'adjustments'],
    });

    if (!stockItem) {
      throw new NotFoundException(`Stock item with ID ${id} not found`);
    }

    return stockItem;
  }

  async findByIngredientAndRestaurant(ingredientId: string, restaurantId: string): Promise<StockItem> {
    const stockItem = await this.stockItemRepository.findOne({
      where: { ingredient_id: ingredientId, restaurant_id: restaurantId },
      relations: ['ingredient', 'restaurant'],
    });

    if (!stockItem) {
      throw new NotFoundException('Stock item not found for this ingredient and restaurant');
    }

    return stockItem;
  }

  async update(id: string, updateStockItemDto: UpdateStockItemDto): Promise<StockItem> {
    const stockItem = await this.findOne(id);
    Object.assign(stockItem, updateStockItemDto);
    return this.stockItemRepository.save(stockItem);
  }

  async remove(id: string): Promise<void> {
    const stockItem = await this.findOne(id);
    await this.stockItemRepository.remove(stockItem);
  }

  async adjustStock(id: string, adjustStockDto: AdjustStockDto): Promise<StockItem> {
    const stockItem = await this.findOne(id);
    
    const newQuantity = stockItem.quantity_in_base_unit + adjustStockDto.quantity_change;

    if (newQuantity < 0) {
      throw new BadRequestException('Insufficient stock for this adjustment');
    }

    stockItem.quantity_in_base_unit = newQuantity;

    if (adjustStockDto.adjustment_type === StockAdjustmentType.RESTOCK) {
      stockItem.last_restocked_at = new Date();
    }

    const adjustment = this.stockAdjustmentRepository.create({
      stock_item_id: id,
      user_id: adjustStockDto.user_id,
      adjustment_type: adjustStockDto.adjustment_type,
      quantity_change: adjustStockDto.quantity_change,
      new_quantity: newQuantity,
      reason: adjustStockDto.reason,
      reference: adjustStockDto.reference,
    });

    await this.stockAdjustmentRepository.save(adjustment);
    return this.stockItemRepository.save(stockItem);
  }

  async getLowStockItems(restaurantId?: string): Promise<StockItem[]> {
    const where: any = {};
    if (restaurantId) where.restaurant_id = restaurantId;

    return this.stockItemRepository.find({
      where: {
        ...where,
        quantity_in_base_unit: LessThanOrEqual('low_threshold'),
      },
      relations: ['ingredient', 'restaurant'],
      order: { quantity_in_base_unit: 'ASC' },
    });
  }

  async getStockReport(reportDto: StockReportDto): Promise<any> {
    const where: any = {};
    
    if (reportDto.restaurant_id) {
      where.restaurant_id = reportDto.restaurant_id;
    }

    if (reportDto.low_stock_only) {
      where.quantity_in_base_unit = LessThanOrEqual('low_threshold');
    }

    const stockItems = await this.stockItemRepository.find({
      where,
      relations: ['ingredient', 'restaurant'],
      order: { ingredient: { name: 'ASC' } },
    });

    let adjustments: StockAdjustment[] = [];
    if (reportDto.start_date && reportDto.end_date) {
      adjustments = await this.stockAdjustmentRepository.find({
        where: {
          created_at: Between(reportDto.start_date, reportDto.end_date),
        },
        relations: ['stock_item', 'user'],
        order: { created_at: 'DESC' },
      });
    }

    return {
      stock_items: stockItems,
      adjustments,
      summary: {
        total_items: stockItems.length,
        low_stock_items: stockItems.filter(item => item.is_low).length,
        total_quantity: stockItems.reduce((sum, item) => sum + item.quantity_in_base_unit, 0),
        total_value: stockItems.reduce((sum, item) => {
          const ingredient = item.ingredient as any;
          return sum + (item.quantity_in_base_unit * (ingredient.unit_cost_cents || 0) / 100);
        }, 0),
      },
    };
  }

  async updateAverageUsage(id: string, days: number = 30): Promise<StockItem> {
    const stockItem = await this.findOne(id);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const usageAdjustments = await this.stockAdjustmentRepository.find({
      where: {
        stock_item_id: id,
        adjustment_type: StockAdjustmentType.USAGE,
        created_at: MoreThanOrEqual(startDate),
      },
    });

    const totalUsage = usageAdjustments.reduce((sum, adj) => sum + Math.abs(adj.quantity_change), 0);
    stockItem.average_daily_usage = totalUsage / days;

    return this.stockItemRepository.save(stockItem);
  }
}