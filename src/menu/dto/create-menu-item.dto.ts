import {
    IsString,
    IsNotEmpty,
    IsOptional,
    IsUUID,
    IsNumber,
    IsBoolean,
    IsArray,
    Min,
} from 'class-validator'

export class CreateMenuItemDto {
    @IsUUID()
    @IsNotEmpty()
    menu_id: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsString()
    @IsOptional()
    description?: string

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    pics?: string[]

    @IsNumber()
    @Min(0)
    price: number

    @IsBoolean()
    @IsOptional()
    available?: boolean

    @IsString()
    @IsOptional()
    category?: string
}
