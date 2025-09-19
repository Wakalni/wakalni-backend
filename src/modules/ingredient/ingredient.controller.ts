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
    ForbiddenException,
} from '@nestjs/common'
import { IngredientsService } from './ingredient.service'
import { CreateIngredientDto } from './dto/create-ingredient.dto'
import { UpdateIngredientDto } from './dto/update-ingredient.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../user/enums/user-role.enum'

@Controller('ingredients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class IngredientsController {
    constructor(private readonly ingredientsService: IngredientsService) {}

    @Post()
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    create(@Body() createIngredientDto: CreateIngredientDto, @Request() req) {
        // For admins, ensure they can only create ingredients for their own restaurant
        if (req.user.role === UserRole.ADMIN) {
            createIngredientDto.restaurant_id = req.user.restaurant_id
        }

        return this.ingredientsService.create(createIngredientDto, req.user.userId, req.user.role)
    }

    @Get()
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
    findAll(
        @Query('restaurantId') restaurantId?: string,
        @Query('includeGlobal') includeGlobal?: string,
    ) {
        const includeGlobalBool = includeGlobal !== 'false'
        return this.ingredientsService.findAll(restaurantId, includeGlobalBool)
    }

    @Get('restaurant/:restaurantId')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
    findByRestaurant(@Param('restaurantId') restaurantId: string) {
        return this.ingredientsService.findByRestaurant(restaurantId)
    }

    @Get(':id')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
    findOne(@Param('id') id: string) {
        return this.ingredientsService.findOne(id)
    }

    @Patch(':id')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    update(
        @Param('id') id: string,
        @Body() updateIngredientDto: UpdateIngredientDto,
        @Request() req,
    ) {
        return this.ingredientsService.update(
            id,
            updateIngredientDto,
            req.user.userId,
            req.user.role,
        )
    }

    @Delete(':id')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    remove(@Param('id') id: string, @Request() req) {
        return this.ingredientsService.remove(id, req.user.userId, req.user.role)
    }

    @Get(':id/calculate-cost/:quantity')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
    calculateCost(@Param('id') id: string, @Param('quantity') quantity: number) {
        return this.ingredientsService.calculateCost(id, quantity)
    }
}
