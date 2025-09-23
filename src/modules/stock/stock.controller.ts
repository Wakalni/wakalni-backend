import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockItemDto } from './dto/create-stock.dto';
import { UpdateStockItemDto } from './dto/update-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { StockReportDto } from './dto/stock-report.dto';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { NotFoundException } from '@nestjs/common'

@Controller('stock')
@UseGuards(JwtGuard, RolesGuard)
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.ADMIN)
  create(@Body() createStockItemDto: CreateStockItemDto, @Request() req) {
    if (req.user.role === UserRole.ADMIN) {
      createStockItemDto.restaurant_id = req.user.restaurant_id;
    }
    return this.stockService.create(createStockItemDto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.ADMIN)
  findAll(@Query('restaurantId') restaurantId?: string, @Request() req?) {
    if (req.user.role === UserRole.ADMIN) {
      restaurantId = req.user.restaurant_id;
    }
    return this.stockService.findAll(restaurantId);
  }

  @Get('low-stock')
  @Roles(UserRole.ADMIN, UserRole.ADMIN)
  getLowStockItems(@Query('restaurantId') restaurantId?: string, @Request() req?) {
    if (req.user.role === UserRole.ADMIN) {
      restaurantId = req.user.restaurant_id;
    }
    return this.stockService.getLowStockItems(restaurantId);
  }

  @Get('report')
  @Roles(UserRole.ADMIN, UserRole.ADMIN)
  getStockReport(@Query() reportDto: StockReportDto, @Request() req) {
    if (req.user.role === UserRole.ADMIN) {
      reportDto.restaurant_id = req.user.restaurant_id;
    }
    return this.stockService.getStockReport(reportDto);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.ADMIN)
  findOne(@Param('id') id: string, @Request() req) {
    return this.stockService.findOne(id);
  }

  @Get('ingredient/:ingredientId/restaurant/:restaurantId')
  @Roles(UserRole.ADMIN, UserRole.ADMIN)
  findByIngredientAndRestaurant(
    @Param('ingredientId') ingredientId: string,
    @Param('restaurantId') restaurantId: string,
    @Request() req,
  ) {
    if (req.user.role === UserRole.ADMIN && restaurantId !== req.user.restaurant_id) {
      throw new NotFoundException('Stock item not found');
    }
    return this.stockService.findByIngredientAndRestaurant(ingredientId, restaurantId);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.ADMIN)
  update(@Param('id') id: string, @Body() updateStockItemDto: UpdateStockItemDto) {
    return this.stockService.update(id, updateStockItemDto);
  }

  @Patch(':id/adjust')
  @Roles(UserRole.ADMIN, UserRole.ADMIN)
  adjustStock(@Param('id') id: string, @Body() adjustStockDto: AdjustStockDto, @Request() req) {
    if (!adjustStockDto.user_id && req.user) {
      adjustStockDto.user_id = req.user.userId;
    }
    return this.stockService.adjustStock(id, adjustStockDto);
  }

  @Patch(':id/update-usage')
  @Roles(UserRole.ADMIN, UserRole.ADMIN)
  updateAverageUsage(@Param('id') id: string, @Query('days') days: number) {
    return this.stockService.updateAverageUsage(id, days);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  remove(@Param('id') id: string) {
    return this.stockService.remove(id);
  }
}