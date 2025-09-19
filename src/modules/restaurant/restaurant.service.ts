import {
    Injectable,
    NotFoundException,
    ConflictException,
    BadRequestException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Restaurant } from './entities/restaurant.entity'
import { OpeningHours } from './entities/opening-hours.entity'
import { CreateRestaurantDto } from './dto/create-restaurant.dto'
import { UpdateRestaurantDto } from './dto/update-restaurant.dto'
import { User } from '../user/entities/user.entity'
import { UserRole } from '../user/enums/user-role.enum'

@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private restaurantsRepository: Repository<Restaurant>,
        @InjectRepository(OpeningHours)
        private openingHoursRepository: Repository<OpeningHours>,
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    async create(createRestaurantDto: CreateRestaurantDto): Promise<Restaurant> {
        // Check if restaurant name already exists in the same city
        const existingRestaurant = await this.restaurantsRepository.findOne({
            where: {
                name: createRestaurantDto.name,
                city: createRestaurantDto.city,
            },
        })

        if (existingRestaurant) {
            throw new ConflictException('Restaurant with this name already exists in this city')
        }

        // Check if admin already has a restaurant
        const adminWithRestaurant = await this.restaurantsRepository.findOne({
            where: { admin_id: createRestaurantDto.admin_id },
        })

        if (adminWithRestaurant) {
            throw new ConflictException('This admin already owns a restaurant')
        }

        // Verify admin exists and has admin role
        const adminUser = await this.usersRepository.findOne({
            where: {
                id: createRestaurantDto.admin_id,
                role: UserRole.ADMIN,
            },
        })

        if (!adminUser) {
            throw new BadRequestException('Admin user not found or does not have admin role')
        }

        const restaurant = this.restaurantsRepository.create(createRestaurantDto)

        if (createRestaurantDto.opening_hours) {
            restaurant.opening_hours = createRestaurantDto.opening_hours.map((hoursDto) =>
                this.openingHoursRepository.create(hoursDto),
            )
        }

        const savedRestaurant = await this.restaurantsRepository.save(restaurant)

        // Update user with restaurant reference
        await this.usersRepository.update(createRestaurantDto.admin_id, {
            restaurant_id: savedRestaurant.id,
        })

        return savedRestaurant
    }

    async findAll(): Promise<Restaurant[]> {
        return this.restaurantsRepository.find({
            relations: ['opening_hours', 'admin'],
        })
    }

    async findOne(id: string): Promise<Restaurant> {
        const restaurant = await this.restaurantsRepository.findOne({
            where: { id },
            relations: ['opening_hours', 'admin'],
        })

        if (!restaurant) {
            throw new NotFoundException(`Restaurant with ID ${id} not found`)
        }

        return restaurant
    }

    async findByAdminId(adminId: string): Promise<Restaurant> {
        const restaurant = await this.restaurantsRepository.findOne({
            where: { admin_id: adminId },
            relations: ['opening_hours', 'admin'],
        })

        if (!restaurant) {
            throw new NotFoundException(`Restaurant for admin ${adminId} not found`)
        }

        return restaurant
    }

    async update(id: string, updateRestaurantDto: UpdateRestaurantDto): Promise<Restaurant> {
        const restaurant = await this.findOne(id)

        if (updateRestaurantDto.admin_id && updateRestaurantDto.admin_id !== restaurant.admin_id) {
            throw new BadRequestException('Cannot change restaurant admin')
        }

        if (updateRestaurantDto.opening_hours) {
            // Remove existing opening hours
            await this.openingHoursRepository.delete({ restaurant_id: id })

            // Create new opening hours
            restaurant.opening_hours = updateRestaurantDto.opening_hours.map((hoursDto) =>
                this.openingHoursRepository.create(hoursDto),
            )
        }

        Object.assign(restaurant, updateRestaurantDto)
        return this.restaurantsRepository.save(restaurant)
    }

    async remove(id: string): Promise<void> {
        const restaurant = await this.findOne(id)

        // Remove restaurant reference from user
        await this.usersRepository.update(restaurant.admin_id, {
            restaurant_id: null,
        })

        await this.restaurantsRepository.remove(restaurant)
    }

    async getRestaurantByAdmin(adminId: string) {
        return this.restaurantsRepository.findOne({
            where: { admin_id: adminId },
            relations: ['opening_hours'],
        })
    }
}
