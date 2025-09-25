import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RestaurantService } from './restaurant.service'
import { RestaurantController } from './restaurant.controller'
import { Restaurant } from './entities/restaurant.entity'
import { OpeningHours } from './entities/opening-hours.entity'
import { UserModule } from '../user/user.module'
import { User } from '../user/entities/user.entity'
import { RestaurantOwnership } from './entities/restaurant-ownership.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant, OpeningHours, RestaurantOwnership, User]), UserModule],
    controllers: [RestaurantController],
    providers: [RestaurantService],
    exports: [RestaurantService],
})
export class RestaurantModule {}
