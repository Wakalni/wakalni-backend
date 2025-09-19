import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  async create(createMenuDto: CreateMenuDto): Promise<Menu> {
    const existingMenu = await this.menuRepository.findOne({
      where: { url_code: createMenuDto.url_code },
    });

    if (existingMenu) {
      throw new ConflictException('Menu with this URL code already exists');
    }

    const menu = this.menuRepository.create(createMenuDto);
    return this.menuRepository.save(menu);
  }

  async findAll(restaurantId?: string): Promise<Menu[]> {
    const where = restaurantId ? { restaurant_id: restaurantId } : {};
    return this.menuRepository.find({
      where,
      relations: ['restaurant', 'items'],
      order: { created_at: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id },
      relations: ['restaurant', 'items'],
    });

    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }

    return menu;
  }

  async findByUrlCode(urlCode: string): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { url_code: urlCode, is_active: true },
      relations: ['restaurant', 'items'],
    });

    if (!menu) {
      throw new NotFoundException(`Menu with URL code ${urlCode} not found`);
    }

    return menu;
  }

  async update(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.findOne(id);
    Object.assign(menu, updateMenuDto);
    return this.menuRepository.save(menu);
  }

  async remove(id: string): Promise<void> {
    const menu = await this.findOne(id);
    await this.menuRepository.remove(menu);
  }

  async createMenuItem(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
    const menu = await this.menuRepository.findOne({
      where: { id: createMenuItemDto.menu_id },
    });

    if (!menu) {
      throw new NotFoundException('Menu not found');
    }

    const menuItem = this.menuItemRepository.create(createMenuItemDto);
    return this.menuItemRepository.save(menuItem);
  }

  async findMenuItem(id: string): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['menu'],
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`);
    }

    return menuItem;
  }

  async updateMenuItem(id: string, updateMenuItemDto: UpdateMenuItemDto): Promise<MenuItem> {
    const menuItem = await this.findMenuItem(id);
    Object.assign(menuItem, updateMenuItemDto);
    return this.menuItemRepository.save(menuItem);
  }

  async removeMenuItem(id: string): Promise<void> {
    const menuItem = await this.findMenuItem(id);
    await this.menuItemRepository.remove(menuItem);
  }

  async getMenuItemsByMenu(menuId: string): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      where: { menu_id: menuId },
      order: { category: 'ASC', name: 'ASC' },
    });
  }

  async getAvailableMenuItems(menuId: string): Promise<MenuItem[]> {
    return this.menuItemRepository.find({
      where: { menu_id: menuId, available: true },
      order: { category: 'ASC', name: 'ASC' },
    });
  }
}