import {
    Injectable,
    NotFoundException,
    ConflictException,
  } from '@nestjs/common';
  import { InjectRepository } from '@nestjs/typeorm';
  import { Repository } from 'typeorm';
  
  import { Restaurant } from './entities/restaurant.entity';
  import {
    RestaurantOwnership,
    OwnershipRole,
  } from './entities/restaurant-ownership.entity';
  import { User } from '../user/entities/user.entity';
  import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { OpeningHours } from './entities/opening-hours.entity';
import { SetOpeningHoursDto } from './dto/set-opening-hours.dto'; 

  @Injectable()
  export class RestaurantService {
    constructor(
      @InjectRepository(Restaurant)
      private readonly restaurantRepo: Repository<Restaurant>,
  
      @InjectRepository(RestaurantOwnership)
      private readonly ownershipRepo: Repository<RestaurantOwnership>,
  
      @InjectRepository(User)
      private readonly userRepo: Repository<User>,

      @InjectRepository(OpeningHours)
      private readonly openingHoursRepo: Repository<OpeningHours>
    ) {}
  
    async createRestaurant(
      adminId: string,
      dto: CreateRestaurantDto,
    ): Promise<Restaurant> {
      const user = await this.userRepo.findOneBy({ id: adminId });
      if (!user) {
        throw new NotFoundException(`Admin user ${adminId} not found`);
      }
  
      const restaurant = this.restaurantRepo.create({
        name: dto.name,
        address: dto.address,
        city: dto.city,
        logo_url: dto.logo_url,
        cover_image: dto.cover_image,
      });
  
      await this.restaurantRepo.save(restaurant);
  
      const ownership = this.ownershipRepo.create({
        user,
        restaurant,
        role: OwnershipRole.OWNER,
      });
      await this.ownershipRepo.save(ownership);
  
      return restaurant;
    }

    async setOpeningHours(
      restaurantId: string,
      hours: SetOpeningHoursDto[],
    ) {
      await this.openingHoursRepo.delete({ restaurant_id: restaurantId });
      const newHours = hours.map((h) =>
        this.openingHoursRepo.create({
          ...h,
          restaurant_id: restaurantId,
        }),
      );
      return this.openingHoursRepo.save(newHours);
    }
  
    async getRestaurantWithUsers(id: string): Promise<Restaurant> {
      const restaurant = await this.restaurantRepo.findOne({
        where: { id },
        relations: ['ownerships', 'ownerships.user', 'opening_hours'],
      });
  
      if (!restaurant) {
        throw new NotFoundException(`Restaurant not found`);
      }
  
      return restaurant;
    }
  
    async addUserToRestaurant(
      restaurantId: string,
      userId: string,
      role: OwnershipRole = OwnershipRole.EMPLOYEE,
    ): Promise<RestaurantOwnership> {
      const restaurant = await this.restaurantRepo.findOneBy({ id: restaurantId });
      if (!restaurant) {
        throw new NotFoundException(`Restaurant ${restaurantId} not found`);
      }
  
      const user = await this.userRepo.findOneBy({ id: userId });
      if (!user) {
        throw new NotFoundException(`User ${userId} not found`);
      }
  
      const existing = await this.ownershipRepo.findOne({
        where: { restaurant: { id: restaurantId }, user: { id: userId } },
      });
  
      if (existing) {
        throw new ConflictException(
          `User ${userId} is already part of restaurant ${restaurantId}`,
        );
      }
  
      const ownership = this.ownershipRepo.create({
        restaurant,
        user,
        role,
      });
      return this.ownershipRepo.save(ownership);
    }
  
    async removeUserFromRestaurant(
      restaurantId: string,
      userId: string,
    ): Promise<void> {
      const ownership = await this.ownershipRepo.findOne({
        where: { restaurant: { id: restaurantId }, user: { id: userId } },
      });
  
      if (!ownership) {
        throw new NotFoundException(
          `User ${userId} is not linked to restaurant ${restaurantId}`,
        );
      }
  
      await this.ownershipRepo.remove(ownership);
    }
  
    async getUserRestaurants(userId: string): Promise<Restaurant[]> {
      const ownerships = await this.ownershipRepo.find({
        where: { user: { id: userId } },
        relations: ['restaurant'],
      });
  
      return ownerships.map((o) => o.restaurant);
    }
  }
  