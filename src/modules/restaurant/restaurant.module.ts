import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { RestaurantService } from './restaurant.service'
import { RestaurantsController } from './restaurant.controller'
import { Restaurant } from './entities/restaurant.entity'
import { OpeningHours } from './entities/opening-hours.entity'
import { UserModule } from '../user/user.module'
import { User } from '../user/entities/user.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Restaurant, OpeningHours, User]), UserModule],
    controllers: [RestaurantsController],
    providers: [RestaurantService],
    exports: [RestaurantService],
})
export class RestaurantModule {}
