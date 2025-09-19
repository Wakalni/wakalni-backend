import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { User } from './modules/user/entities/user.entity'
import { RestaurantModule } from './modules/restaurant/restaurant.module';
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { Restaurant } from './modules/restaurant/entities/restaurant.entity'
import { OpeningHours } from './modules/restaurant/entities/opening-hours.entity'

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
                entities: [User, Restaurant, OpeningHours],
                synchronize: configService.get('NODE_ENV') !== 'production',
                logging: configService.get('NODE_ENV') !== 'production',
            }
            return dbconfig as TypeOrmModuleOptions
        },
      }),
      UserModule,
      AuthModule,
      RestaurantModule,
    ],
})
export class AppModule {}
