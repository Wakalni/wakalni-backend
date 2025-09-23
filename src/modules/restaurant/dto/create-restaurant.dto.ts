import { IsString, IsNotEmpty, IsOptional } from 'class-validator'

export class CreateRestaurantDto {
    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsNotEmpty()
    address: string

    @IsString()
    @IsNotEmpty()
    city: string

    @IsString()
    @IsOptional()
    logo_url?: string

    @IsString()
    @IsOptional()
    cover_image?: string
}
