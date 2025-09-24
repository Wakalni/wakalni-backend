import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { RestaurantModule } from './modules/restaurant/restaurant.module'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { IngredientsModule } from './modules/ingredient/ingredient.module'
import { MenuModule } from './modules/menu/menu.module'
import { OrderModule } from './modules/order/order.module'
import { PaymentModule } from './modules/payment/payment.module';
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { ConfigModule, ConfigService } from '@nestjs/config'
import Joi from 'joi'

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: `.env`,
            validationSchema: Joi.object({
                NODE_ENV: Joi.string().valid('dev', 'prod', 'test').required(),
                APP_NAME: Joi.string().required(),
                API_VERSION: Joi.number().required(),
                PORT: Joi.number().required(),
        
                DB_HOST: Joi.string().required(),
                DB_PORT: Joi.number().required(),
                DB_USER: Joi.string().required(),
                DB_PASSWORD: Joi.string().required(),
                DB_NAME: Joi.string().required(),
        
                ORM_SYNC: Joi.boolean().required(),
                ORM_LOGGING: Joi.boolean().required(),
                ORM_MIN_POOL: Joi.number().required(),
                ORM_MAX_POOL: Joi.number().required(),
                ORM_TIMEOUT_POOL: Joi.number().required(),
        
                LOGS_DIRNAME: Joi.string().required(),
                RENTENTION_DAYS: Joi.number().required(),
        
                JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
                JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
                JWT_ACCESS_TOKEN_EXPIRY: Joi.number().required(),
                JWT_REFRESH_TOKEN_EXPIRY: Joi.number().required(),
                JWT_ALGO: Joi.string()
                    .valid(
                    'HS256', 'HS384', 'HS512',
                    'RS256', 'RS384', 'RS512',
                    'ES256', 'ES384', 'ES512',
                    'PS256', 'PS384', 'PS512',
                    'none',
                    )
                    .required(),
        
                COOKIES_SECURE: Joi.boolean().required(),
                COOKIES_SAME_SITE: Joi.string().valid('lax', 'strict', 'none').required(),
        
                CACHE_HOST: Joi.string().required(),
                CACHE_PORT: Joi.number().required(),
                CACHE_USERNAME: Joi.string().required(),
                CACHE_PASSWORD: Joi.string().required(),
                CACHE_DB: Joi.number().required(),
                CACHE_TLS: Joi.boolean().truthy('true').falsy('false').optional(),
                CACHE_CONN_TIMEOUT: Joi.number().required(),
        
                GUIDINI_API_URL: Joi.string().uri().required(),
                GUIDINI_APP_KEY: Joi.string().required(),
                GUIDINI_SECRET: Joi.string().required(),
            }),
        }),
        TypeOrmModule.forRootAsync({
            imports: [],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                console.log(configService)
                const dbconfig: TypeOrmModuleOptions = {
                    type: 'postgres',
                    host: configService.get<string>('DB_HOST'),
                    port: configService.get<number>('DB_PORT'),
                    username: configService.get<string>('DB_USER'),
                    password: configService.get<string>('DB_PASSWORD'), 
                    database: configService.get<string>('DB_NAME'),  
                    entities: [__dirname + '/**/*.entity.js'],
                    synchronize: configService.get<boolean>('ORM_SYNC'),
                    logging: configService.get<boolean>('ORM_LOGGING'),
                    extra: {
                        max: configService.get<number>('ORM_MAX_POOL'),
                        min: configService.get<number>('ORM_MIN_POOL'),
                        idleTimeoutMillis: configService.get<number>('ORM_TIMEOUT_POOL'),
                    },
                }
                return dbconfig
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
