import { IsString, IsNotEmpty, IsOptional, IsUUID, IsArray, ValidateNested } from 'class-validator'
import { Type } from 'class-transformer'

class OpeningHoursDto {
    @IsString()
    @IsNotEmpty()
    day_of_week: string

    @IsString()
    @IsNotEmpty()
    open_time: string

    @IsString()
    @IsNotEmpty()
    close_time: string

    @IsOptional()
    is_closed?: boolean
}

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
    @IsNotEmpty()
    country: string

    @IsString()
    @IsNotEmpty()
    timezone: string

    @IsString()
    @IsOptional()
    logo_url?: string

    @IsString()
    @IsOptional()
    cover_image?: string

    @IsUUID()
    @IsNotEmpty()
    admin_id: string

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OpeningHoursDto)
    @IsOptional()
    opening_hours?: OpeningHoursDto[]
}
