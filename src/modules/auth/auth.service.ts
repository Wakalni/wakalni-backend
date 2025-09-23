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
        const { password, ...result } = user
        return result
    }

    async login(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto
        const user = await this.usersService.findOneByCredentials(email, password)
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
        }

        return {
            access_token: this.jwtService.sign(payload),
            data: { ...user, password: undefined },
        }
    }

    async validateToken(payload: any) {
        return this.usersService.findOne(payload.sub)
    }
}
