import {
    Controller,
    Post,
    Get,
    Put,
    Body,
    Param,
    Delete,
    UseGuards,
    ParseUUIDPipe,
} from '@nestjs/common';
import { RestaurantService } from './restaurant.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User } from '../auth/decorators/user.decorator';
import { SetOpeningHoursDto } from './dto/set-opening-hours.dto';
  
  @Controller('restaurants')
  @UseGuards(JwtGuard, RolesGuard)
  export class RestaurantController {
    constructor(private readonly restaurantService: RestaurantService) {}
  
    @Post()
    @Roles(UserRole.CLIENT)
    create(@Body() dto: CreateRestaurantDto, @User('id') userId: string) {
      return this.restaurantService.createRestaurant(userId, dto);
    }

    @Put(':id/opening-hours')
    updateOpeningHours(
      @Param('id', ParseUUIDPipe) id: string,
      @User('id') userId: string,
      @Body() hours: SetOpeningHoursDto[],
    ) {
      return this.restaurantService.setOpeningHours(
        id,
        hours
      );
    }

    @Get(':id')
    getOne(@Param('id', ParseUUIDPipe) id: string) {
      return this.restaurantService.getRestaurantWithUsers(id);
    }
  
    @Get('user/:userId')
    getByUser(@Param('userId', ParseUUIDPipe) userId: string) {
      return this.restaurantService.getUserRestaurants(userId);
    }
  
    @Post(':id/users/:userId')
    addUser(
      @Param('id', ParseUUIDPipe) restaurantId: string,
      @Param('userId', ParseUUIDPipe) userId: string,
    ) {
      return this.restaurantService.addUserToRestaurant(
        restaurantId,
        userId,
      );
    }
  
    @Delete(':id/users/:userId')
    removeUser(
      @Param('id', ParseUUIDPipe) restaurantId: string,
      @Param('userId', ParseUUIDPipe) userId: string,
    ) {
      return this.restaurantService.removeUserFromRestaurant(
        restaurantId,
        userId,
      );
    }
  }
  