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
    ForbiddenException,
} from '@nestjs/common'
import { RestaurantService } from './restaurant.service'
import { CreateRestaurantDto } from './dto/create-restaurant.dto'
import { UpdateRestaurantDto } from './dto/update-restaurant.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from '../user/enums/user-role.enum'

@Controller('restaurants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RestaurantsController {
    constructor(private readonly restaurantsService: RestaurantService) {}

    @Post()
    @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
    create(@Body() createRestaurantDto: CreateRestaurantDto, @Request() req) {
        // For non-superadmins, ensure they can only create restaurants for themselves
        if (req.user.role === UserRole.ADMIN) {
            createRestaurantDto.admin_id = req.user.userId
        }
        return this.restaurantsService.create(createRestaurantDto)
    }

    @Get()
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
    findAll() {
        return this.restaurantsService.findAll()
    }

    @Get('my-restaurant')
    @Roles(UserRole.ADMIN)
    findMyRestaurant(@Request() req) {
        return this.restaurantsService.findByAdminId(req.user.userId)
    }

    @Get(':id')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.CLIENT)
    findOne(@Param('id') id: string) {
        return this.restaurantsService.findOne(id)
    }

    @Patch(':id')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    async update(
        @Param('id') id: string,
        @Body() updateRestaurantDto: UpdateRestaurantDto,
        @Request() req,
    ) {
        // Check if user has permission to update this restaurant
        if (req.user.role === UserRole.ADMIN) {
            const restaurant = await this.restaurantsService.getRestaurantByAdmin(req.user.userId)
            if (!restaurant || restaurant.id !== id) {
                throw new ForbiddenException('You can only update your own restaurant')
            }
        }

        return this.restaurantsService.update(id, updateRestaurantDto)
    }

    @Delete(':id')
    @Roles(UserRole.SUPERADMIN, UserRole.ADMIN)
    async remove(@Param('id') id: string, @Request() req) {
        // Check if user has permission to delete this restaurant
        if (req.user.role === UserRole.ADMIN) {
            const restaurant = await this.restaurantsService.getRestaurantByAdmin(req.user.userId)
            if (!restaurant || restaurant.id !== id) {
                throw new ForbiddenException('You can only delete your own restaurant')
            }
        }

        return this.restaurantsService.remove(id)
    }
}
