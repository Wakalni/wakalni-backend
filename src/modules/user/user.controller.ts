import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common'
import { UserService } from './user.service'
import { UpdateUserDto, UpdateUserPasswordDto } from './dto/update-user.dto'
import { JwtGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { UserRole } from './enums/user-role.enum'

@Controller('users')
@UseGuards(JwtGuard, RolesGuard)
export class UserController {
    constructor(private readonly usersService: UserService) {}

    @Get()
    @Roles(UserRole.ADMIN)
    findAll() {
        return this.usersService.findAll()
    }

    @Get('me')
    @Roles(UserRole.ADMIN, UserRole.CLIENT)
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(id)
    }

    @Get('email/:email')
    @Roles(UserRole.ADMIN)
    findOneByEmail(@Param('email') id: string) {
        return this.usersService.findByEmail(id)
    }

    @Get('phone/:phone')
    @Roles(UserRole.ADMIN)
    findOneByPhone(@Param('phone') id: string) {
        return this.usersService.findByPhone(id)
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(id, updateUserDto)
    }

    @Patch(':id/password')
    @Roles(UserRole.ADMIN)
    updatePassword(@Param('id') id: string, @Body() updateUserPasswordDto: UpdateUserPasswordDto) {
        return this.usersService.updatePassword(id, updateUserPasswordDto)
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    remove(@Param('id') id: string) {
        return this.usersService.remove(id)
    }
}
