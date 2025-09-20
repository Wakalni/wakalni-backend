// src/modules/menu/menu.controller.ts
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
} from '@nestjs/common'
import { MenuService } from './menu.service'
import { CreateMenuDto } from './dto/create-menu.dto'
import { UpdateMenuDto } from './dto/update-menu.dto'
import { CreateMenuItemDto } from './dto/create-menu-item.dto'
import { UpdateMenuItemDto } from './dto/update-menu-item.dto'
import { CreateRecipeDto } from './dto/create-recipe.dto'
import { UpdateRecipeDto } from './dto/update-recipe.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../user/enums/user-role.enum'

@Controller('menus')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuController {
    constructor(private readonly menuService: MenuService) {}

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    createMenu(@Body() createMenuDto: CreateMenuDto, @Request() req) {
        // For admins, ensure they can only create menus for their own restaurant
        if (req.user.role === UserRole.ADMIN) {
            createMenuDto.restaurant_id = req.user.restaurant_id
        }
        return this.menuService.createMenu(createMenuDto)
    }

    @Get()
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
    findAllMenus(@Query('restaurantId') restaurantId?: string) {
        return this.menuService.findAllMenus(restaurantId)
    }

    @Get('url/:urlCode')
    findMenuByUrlCode(@Param('urlCode') urlCode: string) {
        return this.menuService.findMenuByUrlCode(urlCode)
    }

    @Get(':id')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
    findMenuById(@Param('id') id: string) {
        return this.menuService.findMenuById(id)
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    updateMenu(@Param('id') id: string, @Body() updateMenuDto: UpdateMenuDto) {
        return this.menuService.updateMenu(id, updateMenuDto)
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    deleteMenu(@Param('id') id: string) {
        return this.menuService.deleteMenu(id)
    }

    @Post('items')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    createMenuItem(@Body() createMenuItemDto: CreateMenuItemDto) {
        return this.menuService.createMenuItem(createMenuItemDto)
    }

    @Get('items/:id')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
    findMenuItemById(@Param('id') id: string) {
        return this.menuService.findMenuItemById(id)
    }

    @Patch('items/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    updateMenuItem(@Param('id') id: string, @Body() updateMenuItemDto: UpdateMenuItemDto) {
        return this.menuService.updateMenuItem(id, updateMenuItemDto)
    }

    @Delete('items/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    deleteMenuItem(@Param('id') id: string) {
        return this.menuService.deleteMenuItem(id)
    }

    @Get(':menuId/items')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
    getMenuItemsByMenu(@Param('menuId') menuId: string) {
        return this.menuService.getMenuItemsByMenu(menuId)
    }

    @Get(':menuId/items/available')
    getAvailableMenuItems(@Param('menuId') menuId: string) {
        return this.menuService.getAvailableMenuItems(menuId)
    }

    @Post('recipes')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    createRecipe(@Body() createRecipeDto: CreateRecipeDto) {
        return this.menuService.createRecipe(createRecipeDto)
    }

    @Get('recipes/:id')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    findRecipeById(@Param('id') id: string) {
        return this.menuService.findRecipeById(id)
    }

    @Get('recipes/menu-item/:menuItemId')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    findRecipeByMenuItem(@Param('menuItemId') menuItemId: string) {
        return this.menuService.findRecipeByMenuItem(menuItemId)
    }

    @Patch('recipes/:id')
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    updateRecipe(@Param('id') id: string, @Body() updateRecipeDto: UpdateRecipeDto) {
        return this.menuService.updateRecipe(id, updateRecipeDto)
    }

    @Get('recipes/:menuItemId/cost')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    calculateRecipeCost(@Param('menuItemId') menuItemId: string) {
        return this.menuService.calculateRecipeCost(menuItemId)
    }

    @Get('recipes/:menuItemId/profit-margin')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    calculateProfitMargin(@Param('menuItemId') menuItemId: string) {
        return this.menuService.calculateProfitMargin(menuItemId)
    }
}
