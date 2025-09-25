import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '../user/user.service'
import { LoginUserDto } from '../user/dto/login-user.dto'
import { CreateUserDto } from '../user/dto/create-user.dto'
import { ConfigService } from '@nestjs/config'
import { UserRole } from '../user/enums/user-role.enum'
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
        private config: ConfigService,
    ) {}

    async register(createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto)
        const { password, ...result } = user
        return result
    }

    async login(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto
        const user = await this.usersService.findByEmail(email)
        if (!user) throw new UnauthorizedException('Invalid credentials')
        const passwordMatched = await bcrypt.compare(password, user.password)
        if (!passwordMatched) throw new UnauthorizedException('Invalid credentials')
        const access_token = await this.genAccessToken(user.id, user.role)
        const refresh_token = await this.genRefreshToken(user.id, user.role)
        return {
            access_token,
            refresh_token,
            data: { ...user, password: undefined },
        }
    }

    async refresh(
        userId: string,
    ) {
        const user = await this.usersService.find(userId)
        if (!user) throw new UnauthorizedException('Invalid Request')
        // log warning here
        return this.genAccessToken(user.id, user.role)
    }

    async genAccessToken(userId: string, role: UserRole) {
        const payload = { sub: userId, role};
        return this.jwtService.signAsync(payload, {
            secret: this.config.get<string>('JWT_ACCESS_TOKEN_SECRET'),
            expiresIn: this.config.get<string>('JWT_ACCESS_TOKEN_EXPIRY'),
        });
    }

    async genRefreshToken(userId: string, role: UserRole) {
        const payload = { sub: userId, role};
        return this.jwtService.signAsync(payload, {
            secret: this.config.get<string>('JWT_REFRESH_TOKEN_SECRET'),
            expiresIn: this.config.get<string>('JWT_REFRESH_TOKEN_EXPIRY'),
        });
    }

    async validateAccessToken(payload: any) {
        const user = await this.usersService.find(payload.sub)
        return user? true : false
    }

    async validateRefreshToken(payload: any) {
        const user = await this.usersService.find(payload.sub)
        return user? true : false
    }
}
