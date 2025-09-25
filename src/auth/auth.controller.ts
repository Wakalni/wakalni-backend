import { Controller, Get, Post, Body, UseGuards, HttpCode, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { CreateUserDto } from '../user/dto/create-user.dto'
import { ConfigService } from '@nestjs/config'
import { LoginUserDto } from '../user/dto/login-user.dto'
import { JwtRefreshGuard } from './guards/jwt-refresh.guard'
import { User } from './decorators/user.decorator'

@Controller('auth')
export class AuthController {
    private readonly sameSite: string
    private readonly secure: boolean
    private readonly access_token_expiry: number
    private readonly refresh_token_expiry: number

    constructor(
        private readonly authService: AuthService,
        private readonly configService: ConfigService,
    ) {
        this.sameSite = this.configService.get<string>('COOKIES_SAME_SITE')!
        this.secure = this.configService.get('COOKIES_SECURE')!
        this.access_token_expiry = this.configService.get('JWT_ACCESS_TOKEN_EXPIRY')! * 1000
        this.refresh_token_expiry = this.configService.get('JWT_REFRESH_TOKEN_EXPIRY')! * 1000
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
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
            secure: this.secure,
            sameSite: this.sameSite,
            maxAge: this.access_token_expiry
        });

        res.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            secure: this.secure,
            sameSite: this.sameSite,
            maxAge: this.refresh_token_expiry
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
        const access_token = await this.authService.refresh(user.id)
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: this.secure,
            sameSite: this.sameSite,
            maxAge: this.access_token_expiry
        });
      return
    }
}