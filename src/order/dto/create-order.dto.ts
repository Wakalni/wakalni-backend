import {
    IsUUID,
    IsNotEmpty,
    IsOptional,
    IsEnum,
    IsArray,
    ValidateNested,
    IsNumber,
    Min,
    IsObject,
    IsString,
} from 'class-validator'
import { Type } from 'class-transformer'
import { PaymentMethod } from '../entities/order.entity'

class OrderItemDto {
    @IsUUID()
    @IsNotEmpty()
    menu_item_id: string

    @IsString()
    @IsNotEmpty()
    name: string

    @IsNumber()
    @Min(1)
    quantity: number

    @IsNumber()
    @Min(0)
    unit_price: number

    @IsString()
    @IsOptional()
    special_instructions?: string
}

class DeliveryAddressDto {
    @IsString()
    @IsNotEmpty()
    street: string

    @IsString()
    @IsNotEmpty()
    city: string

    @IsString()
    @IsNotEmpty()
    state: string

    @IsString()
    @IsNotEmpty()
    zip_code: string

    @IsString()
    @IsNotEmpty()
    country: string

    @IsString()
    @IsOptional()
    apartment?: string

    @IsString()
    @IsOptional()
    instructions?: string
}

export class CreateOrderDto {
    @IsUUID()
    @IsNotEmpty()
    restaurant_id: string

    @IsUUID()
    @IsOptional()
    user_id?: string

    @IsEnum(PaymentMethod)
    @IsNotEmpty()
    payment_method: PaymentMethod

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    @IsNotEmpty()
    items: OrderItemDto[]

    @IsObject()
    @ValidateNested()
    @Type(() => DeliveryAddressDto)
    @IsNotEmpty()
    delivery_address: DeliveryAddressDto
}
