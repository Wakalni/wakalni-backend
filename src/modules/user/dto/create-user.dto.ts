import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { UserRole } from '../../user/enums/user-role.enum'

export class CreateUserDto {
    @IsEmail()
    @IsOptional()
    email?: string

    @IsString()
    @IsOptional()
    phone?: string

    @IsString()
    @MinLength(2)
    name: string

    @IsString()
    @MinLength(6)
    @IsOptional()
    password?: string

    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole
}
