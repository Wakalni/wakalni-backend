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
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';

@Controller('menus')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  create(@Body() createMenuDto: CreateMenuDto, @Request() req) {
    if (req.user.role === UserRole.ADMIN) {
      createMenuDto.restaurant_id = req.user.restaurant_id;
    }
    return this.menuService.create(createMenuDto);
  }

  @Get()
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
  findAll(@Query('restaurantId') restaurantId?: string) {
    return this.menuService.findAll(restaurantId);
  }

  @Get('url/:urlCode')
  findByUrlCode(@Param('urlCode') urlCode: string) {
    return this.menuService.findByUrlCode(urlCode);
  }

  @Get(':id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
  findOne(@Param('id') id: string) {
    return this.menuService.findOne(id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  update(
    @Param('id') id: string,
    @Body() updateMenuDto: UpdateMenuDto,
    @Request() req,
  ) {
    return this.menuService.update(id, updateMenuDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  remove(@Param('id') id: string, @Request() req) {
    return this.menuService.remove(id);
  }

  @Post('items')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  createMenuItem(@Body() createMenuItemDto: CreateMenuItemDto, @Request() req) {
    return this.menuService.createMenuItem(createMenuItemDto);
  }

  @Get('items/:id')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
  findMenuItem(@Param('id') id: string) {
    return this.menuService.findMenuItem(id);
  }

  @Patch('items/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  updateMenuItem(
    @Param('id') id: string,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
  ) {
    return this.menuService.updateMenuItem(id, updateMenuItemDto);
  }

  @Delete('items/:id')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  removeMenuItem(@Param('id') id: string) {
    return this.menuService.removeMenuItem(id);
  }

  @Get(':menuId/items')
  @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
  getMenuItemsByMenu(@Param('menuId') menuId: string) {
    return this.menuService.getMenuItemsByMenu(menuId);
  }

  @Get(':menuId/items/available')
  getAvailableMenuItems(@Param('menuId') menuId: string) {
    return this.menuService.getAvailableMenuItems(menuId);
  }
}