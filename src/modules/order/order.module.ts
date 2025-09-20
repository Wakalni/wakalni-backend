import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { Order } from './entities/order.entity'
import { OrderItem } from './entities/order-item.entity'
import { Restaurant } from '../restaurant/entities/restaurant.entity'
import { User } from '../user/entities/user.entity'

@Module({
    imports: [TypeOrmModule.forFeature([Order, OrderItem, Restaurant, User])],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrderModule {}
