import { IsEmail, IsOptional, IsString, Length, MinLength } from 'class-validator'

export class CreateUserDto {
    @IsEmail()
    email: string

    @IsString()
    @MinLength(8)
    password: string

    @IsString()
    @MinLength(2)
    name: string

    @IsString()
    @Length(10)
    phone: string | null
}
