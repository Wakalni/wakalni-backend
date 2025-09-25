import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { PassportModule } from '@nestjs/passport'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { UserModule } from '../user/user.module'
import { JwtAccessStrategy, JwtRefreshStrategy} from './strategies/jwt.strategy'
import { ConfigModule, ConfigService } from '@nestjs/config'


@Module({
    imports: [
      ConfigModule,
      UserModule,
      PassportModule,
      JwtModule.registerAsync({
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: async (config: ConfigService) => ({
          secret: config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
          signOptions: {
            algorithm: config.get('JWT_ALGO'),
          },
        }),
      }),

    ],
    providers: [AuthService, JwtAccessStrategy, JwtRefreshStrategy],
    controllers: [AuthController],
  })
  export class AuthModule {}