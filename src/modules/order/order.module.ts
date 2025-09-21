import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { OrderService } from './order.service'
import { OrderController } from './order.controller'
import { Order } from './entities/order.entity'
import { OrderItem } from './entities/order-item.entity'
import { Restaurant } from '../restaurant/entities/restaurant.entity'
import { User } from '../user/entities/user.entity'
import { PaymentModule } from '../payment/payment.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([Restaurant, User, Order, OrderItem]),
        PaymentModule,

    ],
    controllers: [OrderController],
    providers: [OrderService],
    exports: [OrderService],
})
export class OrderModule {}
