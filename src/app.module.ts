import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { User } from './modules/user/entities/user.entity'
import { RestaurantModule } from './modules/restaurant/restaurant.module'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { Restaurant } from './modules/restaurant/entities/restaurant.entity'
import { OpeningHours } from './modules/restaurant/entities/opening-hours.entity'
import { Ingredient } from './modules/ingredient/entities/ingredient.entity'
import { IngredientsModule } from './modules/ingredient/ingredient.module'
import { MenuModule } from './modules/menu/menu.module'
import { Menu } from './modules/menu/entities/menu.entity'
import { MenuItem } from './modules/menu/entities/menu-item.entity'
import { Recipe } from './modules/menu/entities/recipe.entity'
import { OrderModule } from './modules/order/order.module'
import { Order } from './modules/order/entities/order.entity'
import { OrderItem } from './modules/order/entities/order-item.entity'
import { StockAdjustment } from './modules/stock/entities/stock-adjustement.entity'
import { StockItem } from './modules/stock/entities/stock.entity'
import { PaymentModule } from './modules/payment/payment.module';
import { AppController } from './app.controller'
import { AppService } from './app.service'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const dbconfig = {
                    type: 'postgres',
                    host: configService.get('POSTGRES_HOST'),
                    port: 5432,
                    username: configService.get('POSTGRES_USER'),
                    password: configService.get('POSTGRES_PASSWORD'),
                    database: configService.get('POSTGRES_DB'),
                    entities: [User, Restaurant, OpeningHours, Ingredient, Menu, MenuItem, Recipe, Order, OrderItem, StockAdjustment, StockItem],
                    synchronize: configService.get('NODE_ENV') !== 'production',
                    logging: configService.get('NODE_ENV') !== 'production',
                }
                return dbconfig as TypeOrmModuleOptions
            },
        }),
        UserModule,
        AuthModule,
        RestaurantModule,
        IngredientsModule,
        MenuModule,
        OrderModule,
        PaymentModule
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {}
