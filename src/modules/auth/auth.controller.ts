import { Controller, Get, Post, Body, UseGuards, HttpCode, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDto } from '../user/dto/create-user.dto'
import { ConfigService } from '@nestjs/config'
import { LoginUserDto } from '../user/dto/login-user.dto'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import { User } from './decorators/user.decorator'

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly config: ConfigService,
    ) {}

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        console.log(createUserDto)
        return this.authService.register(createUserDto)
    }

    @Post('login')
    async login(
        @Res({ passthrough: true }) res,
        @Body() LoginUserDto: LoginUserDto
    ) {
        const { data, access_token, refresh_token } = await this.authService.login(LoginUserDto);
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: true,
            // sameSite: this.config.get<string>('SAME_SITE'),
            sameSite: 'none',
            maxAge: this.config.get<number>('JWT_ACCESS_EXPIRY'),
        });

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: true,
            // sameSite: this.config.get<string>('SAME_SITE'),
            sameSite: 'none',
            maxAge: this.config.get<number>('JWT_REFRESH_EXPIRY'),
        });
        return data
    }

    @Get('refresh')
    @UseGuards(JwtRefreshGuard)
    @HttpCode(204)
    async refreshToken(
        @User() user,
        @Res({passthrough: true}) res,
    ) {
        console.log('entered')
        const access_token = await this.authService.refresh(user.id)
        console.log('access_token', access_token)
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: true,
            // sameSite: this.config.get<string>('SAME_SITE'),
            sameSite: 'none',
            maxAge: this.config.get<number>('JWT_REFRESH_EXPIRY'),
        });
        console.log('refreshed')
      return
    }

}
