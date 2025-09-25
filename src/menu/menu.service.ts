import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Menu } from './entities/menu.entity'
import { MenuItem } from './entities/menu-item.entity'
import { Recipe } from './entities/recipe.entity'
import { CreateMenuDto } from './dto/create-menu.dto'
import { UpdateMenuDto } from './dto/update-menu.dto'
import { CreateMenuItemDto } from './dto/create-menu-item.dto'
import { UpdateMenuItemDto } from './dto/update-menu-item.dto'
import { CreateRecipeDto } from './dto/create-recipe.dto'
import { UpdateRecipeDto } from './dto/update-recipe.dto'

@Injectable()
export class MenuService {
    constructor(
        @InjectRepository(Menu)
        private menuRepository: Repository<Menu>,
        @InjectRepository(MenuItem)
        private menuItemRepository: Repository<MenuItem>,
        @InjectRepository(Recipe)
        private recipeRepository: Repository<Recipe>,
    ) {}

    async createMenu(createMenuDto: CreateMenuDto): Promise<Menu> {
        const existingMenu = await this.menuRepository.findOne({
            where: { url_code: createMenuDto.url_code },
        })

        if (existingMenu) {
            throw new ConflictException('Menu with this URL code already exists')
        }

        const menu = this.menuRepository.create(createMenuDto)
        return this.menuRepository.save(menu)
    }

    async findAllMenus(restaurantId?: string): Promise<Menu[]> {
        const where = restaurantId ? { restaurant_id: restaurantId } : {}
        return this.menuRepository.find({
            where,
            relations: ['restaurant', 'items'],
            order: { created_at: 'DESC' },
        })
    }

    async findMenuById(id: string): Promise<Menu> {
        const menu = await this.menuRepository.findOne({
            where: { id },
            relations: ['restaurant', 'items'],
        })

        if (!menu) {
            throw new NotFoundException(`Menu with ID ${id} not found`)
        }

        return menu
    }

    async findMenuByUrlCode(urlCode: string): Promise<Menu> {
        const menu = await this.menuRepository.findOne({
            where: { url_code: urlCode, is_active: true },
            relations: ['restaurant', 'items'],
        })

        if (!menu) {
            throw new NotFoundException(`Menu with URL code ${urlCode} not found`)
        }

        return menu
    }

    async updateMenu(id: string, updateMenuDto: UpdateMenuDto): Promise<Menu> {
        const menu = await this.findMenuById(id)
        Object.assign(menu, updateMenuDto)
        return this.menuRepository.save(menu)
    }

    async deleteMenu(id: string): Promise<void> {
        const menu = await this.findMenuById(id)
        await this.menuRepository.remove(menu)
    }

    async findRecipeById(id: string): Promise<Recipe> {
        const recipe = await this.recipeRepository.findOne({
            where: { id },
            relations: ['menu_item'],
        })

        if (!recipe) {
            throw new NotFoundException(`Recipe with ID ${id} not found`)
        }

        return recipe
    }

    async findRecipeByMenuItem(menuItemId: string): Promise<Recipe> {
        const recipe = await this.recipeRepository.findOne({
            where: { menu_item_id: menuItemId },
            relations: ['menu_item'],
        })

        if (!recipe) {
            throw new NotFoundException(`Recipe for menu item ${menuItemId} not found`)
        }

        return recipe
    }

    async updateRecipe(id: string, updateRecipeDto: UpdateRecipeDto): Promise<Recipe> {
        const recipe = await this.findRecipeById(id)
        Object.assign(recipe, updateRecipeDto)

        if (updateRecipeDto.main_ingredients || updateRecipeDto.sub_ingredients) {
            recipe.total_cost_cents = this.calculateTotalCost(recipe)
        }

        return this.recipeRepository.save(recipe)
    }

    async createRecipe(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
        const menuItem = await this.menuItemRepository.findOne({
            where: { id: createRecipeDto.menu_item_id },
        })

        if (!menuItem) {
            throw new NotFoundException('Menu item not found')
        }

        const existingRecipe = await this.recipeRepository.findOne({
            where: { menu_item_id: createRecipeDto.menu_item_id },
        })

        if (existingRecipe) {
            throw new ConflictException('Recipe already exists for this menu item')
        }

        const recipe = this.recipeRepository.create(createRecipeDto)

        recipe.total_cost_cents = this.calculateTotalCost(recipe)

        const savedRecipe = await this.recipeRepository.save(recipe)

        menuItem.recipe = savedRecipe
        await this.menuItemRepository.save(menuItem)

        return savedRecipe
    }

    async menuItemHasRecipe(menuItemId: string): Promise<boolean> {
        const menuItem = await this.menuItemRepository.findOne({
            where: { id: menuItemId },
            relations: ['recipe'],
        })

        return !!menuItem?.recipe
    }

    async getRecipeForMenuItem(menuItemId: string): Promise<Recipe | null> {
        const menuItem = await this.menuItemRepository.findOne({
            where: { id: menuItemId },
            relations: ['recipe'],
        })

        return menuItem?.recipe || null
    }

    async updateMenuItem(id: string, updateMenuItemDto: UpdateMenuItemDto): Promise<MenuItem> {
        const menuItem = await this.findMenuItemById(id)
        Object.assign(menuItem, updateMenuItemDto)
        return this.menuItemRepository.save(menuItem)
    }

    async deleteMenuItem(id: string): Promise<void> {
        const menuItem = await this.findMenuItemById(id)
        await this.menuItemRepository.remove(menuItem)
    }

    async getMenuItemsByMenu(menuId: string): Promise<MenuItem[]> {
        return this.menuItemRepository.find({
            where: { menu_id: menuId },
            relations: ['recipe'],
            order: { category: 'ASC', name: 'ASC' },
        })
    }

    async getAvailableMenuItems(menuId: string): Promise<MenuItem[]> {
        return this.menuItemRepository.find({
            where: { menu_id: menuId, available: true },
            relations: ['recipe'],
            order: { category: 'ASC', name: 'ASC' },
        })
    }

    async updateRecipeForMenuItem(
        menuItemId: string,
        updateRecipeDto: UpdateRecipeDto,
    ): Promise<MenuItem> {
        const menuItem = await this.findMenuItemById(menuItemId)

        if (!menuItem.recipe) {
            throw new NotFoundException('Recipe not found for this menu item')
        }

        Object.assign(menuItem.recipe, updateRecipeDto)

        if (updateRecipeDto.main_ingredients || updateRecipeDto.sub_ingredients) {
            menuItem.recipe.total_cost_cents = this.calculateTotalCost(menuItem.recipe)
        }

        return this.menuItemRepository.save(menuItem)
    }

    async calculateRecipeCost(menuItemId: string): Promise<number> {
        const menuItem = await this.findMenuItemById(menuItemId)

        if (!menuItem.recipe) {
            throw new NotFoundException('Recipe not found for this menu item')
        }

        return menuItem.recipe.total_cost_cents
    }

    async calculateProfitMargin(menuItemId: string): Promise<{
        cost: number
        price: number
        margin: number
        margin_percent: number
    }> {
        const menuItem = await this.findMenuItemById(menuItemId)

        if (!menuItem.recipe) {
            throw new NotFoundException('Recipe not found for this menu item')
        }

        const cost = menuItem.recipe.total_cost_cents / 100
        const price = menuItem.price / 100
        const margin = price - cost
        const margin_percent = (margin / cost) * 100

        return {
            cost,
            price,
            margin,
            margin_percent,
        }
    }

    private calculateTotalCost(recipe: Recipe): number {
        let totalCost = 0

        if (recipe.main_ingredients) {
            totalCost += recipe.main_ingredients.reduce((sum, ingredient) => {
                return sum + ingredient.cost_per_unit * ingredient.quantity
            }, 0)
        }

        if (recipe.sub_ingredients) {
            totalCost += recipe.sub_ingredients.reduce((sum, ingredient) => {
                return sum + ingredient.cost_per_unit * ingredient.quantity
            }, 0)
        }

        return totalCost
    }

    async createMenuItem(createMenuItemDto: CreateMenuItemDto): Promise<MenuItem> {
        // Verify menu exists
        const menu = await this.menuRepository.findOne({
            where: { id: createMenuItemDto.menu_id },
        })

        if (!menu) {
            throw new NotFoundException('Menu not found')
        }

        const menuItem = this.menuItemRepository.create(createMenuItemDto)
        const savedMenuItem = await this.menuItemRepository.save(menuItem)

        const recipe = this.recipeRepository.create({
            menu_item_id: savedMenuItem.id,
            main_ingredients: [],
            sub_ingredients: [],
            steps: [],
            total_cost_cents: 0,
            margin_percent: 0,
        })

        const savedRecipe = await this.recipeRepository.save(recipe)

        savedMenuItem.recipe = savedRecipe
        return this.menuItemRepository.save(savedMenuItem)
    }

    async findMenuItemById(id: string): Promise<MenuItem> {
        const menuItem = await this.menuItemRepository.findOne({
            where: { id },
            relations: ['menu', 'recipe'],
        })

        if (!menuItem) {
            throw new NotFoundException(`Menu item with ID ${id} not found`)
        }

        return menuItem
    }
}
