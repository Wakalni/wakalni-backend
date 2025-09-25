import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator'

export class UpdateUserPasswordDto {
    @IsString()
    @MinLength(8)
    newPassword: string

    @IsString()
    @MinLength(8)
    oldPassword: string
}

export class UpdateUserDto {
    @IsString()
    @MinLength(2)
    name: string

    @IsString()
    @MinLength(2)
    lastName: string
}

