import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UserService } from '../user/user.service'
import { LoginUserDto } from '../user/dto/login-user.dto'
import { CreateUserDto } from '../user/dto/create-user.dto'

@Injectable()
export class AuthService {
    constructor(
        private usersService: UserService,
        private jwtService: JwtService,
    ) {}

    async register(createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto)
        const { password_hash, ...result } = user
        return result
    }

    async login(loginUserDto: LoginUserDto) {
        const { email, phone, password } = loginUserDto
        const identifier = email || phone

        if (!identifier) {
            throw new UnauthorizedException('Email or phone is required')
        }

        const user = await this.usersService.validateUser(identifier, password)
        if (!user) {
            throw new UnauthorizedException('Invalid credentials')
        }

        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            restaurant_id: user.restaurant_id,
        }

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                restaurant_id: user.restaurant_id,
            },
        }
    }

    async validateToken(payload: any) {
        return this.usersService.findOne(payload.sub)
    }
}
