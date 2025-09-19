import {
    Injectable,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, IsNull } from 'typeorm'
import { Ingredient } from './entities/ingredient.entity'
import { CreateIngredientDto } from './dto/create-ingredient.dto'
import { UpdateIngredientDto } from './dto/update-ingredient.dto'
import { UserRole } from '../user/enums/user-role.enum'

@Injectable()
export class IngredientsService {
    constructor(
        @InjectRepository(Ingredient)
        private ingredientsRepository: Repository<Ingredient>,
    ) {}

    async create(
        createIngredientDto: CreateIngredientDto,
        userId?: string,
        userRole?: UserRole,
    ): Promise<Ingredient> {
        const { name, restaurant_id } = createIngredientDto

        // Global ingredients must be created by SUPERADMIN
        const isGlobal = !restaurant_id
        if (isGlobal && userRole !== UserRole.SUPERADMIN) {
            throw new ForbiddenException('Only superadmins can create global ingredients')
        }

        const whereCondition = {
            name,
            restaurant_id: isGlobal ? IsNull() : restaurant_id,
        }

        const existingIngredient = await this.ingredientsRepository.findOne({
            where: whereCondition,
        })

        if (existingIngredient) {
            throw new ConflictException('Ingredient with this name already exists')
        }

        const ingredient = this.ingredientsRepository.create({
            ...createIngredientDto,
            restaurant_id: isGlobal ? null : restaurant_id,
        })

        return this.ingredientsRepository.save(ingredient)
    }

    async findAll(restaurantId?: string, includeGlobal = true): Promise<Ingredient[]> {
        const where: any[] = []

        if (restaurantId) {
            where.push({ restaurant_id: restaurantId })
        }

        if (includeGlobal) {
            where.push({ restaurant_id: IsNull() })
        }

        return this.ingredientsRepository.find({
            where: where.length > 1 ? where : where[0], // OR condition if includeGlobal
            order: { name: 'ASC' },
        })
    }

    async findOne(id: string): Promise<Ingredient> {
        const ingredient = await this.ingredientsRepository.findOne({
            where: { id },
        })

        if (!ingredient) {
            throw new NotFoundException(`Ingredient with ID ${id} not found`)
        }

        return ingredient
    }

    async update(
        id: string,
        updateIngredientDto: UpdateIngredientDto,
        userId?: string,
        userRole?: UserRole,
    ): Promise<Ingredient> {
        const ingredient = await this.findOne(id)

        if (userRole !== UserRole.SUPERADMIN) {
            throw new ForbiddenException('Only superadmins can update global ingredients')
        }

        Object.assign(ingredient, updateIngredientDto)
        return this.ingredientsRepository.save(ingredient)
    }

    async remove(id: string, userId?: string, userRole?: UserRole): Promise<void> {
        const ingredient = await this.findOne(id)

        if (userRole !== UserRole.SUPERADMIN) {
            throw new ForbiddenException('Only superadmins can delete global ingredients')
        }

        await this.ingredientsRepository.remove(ingredient)
    }

    async findByRestaurant(restaurantId: string): Promise<Ingredient[]> {
        return this.ingredientsRepository.find({
            where: [{ restaurant_id: restaurantId }],
            order: { name: 'ASC' },
        })
    }

    async calculateCost(ingredientId: string, quantity: number): Promise<number> {
        const ingredient = await this.findOne(ingredientId)
        const costWithLoss = ingredient.unit_cost * (1 + ingredient.loss_percent / 100)
        return costWithLoss * quantity
    }
}
