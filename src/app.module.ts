import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { User } from './modules/user/entities/user.entity'
import { TypeOrmModuleOptions } from '@nestjs/typeorm'
import { RestaurantModule } from './restaurant/restaurant.module';

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
                entities: [User],
                synchronize: configService.get('NODE_ENV') !== 'production',
                logging: configService.get('NODE_ENV') !== 'production',
            }
            console.log(dbconfig)
            return dbconfig as TypeOrmModuleOptions
        },
      }),
      UserModule,
      AuthModule,
      RestaurantModule,
    ],
})
export class AppModule {}
