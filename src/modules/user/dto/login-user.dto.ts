import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class LoginUserDto {
    @IsEmail()
    @IsOptional()
    email?: string

    @IsString()
    @IsOptional()
    phone?: string

    @IsString()
    @MinLength(6)
    password: string
}
