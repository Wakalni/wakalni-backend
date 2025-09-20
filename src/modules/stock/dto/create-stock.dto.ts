import {
    IsUUID,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    Min,
    IsDate,
  } from 'class-validator';
  import { Type } from 'class-transformer';
  
  export class CreateStockItemDto {
    @IsUUID()
    @IsNotEmpty()
    ingredient_id: string;
  
    @IsUUID()
    @IsNotEmpty()
    restaurant_id: string;
  
    @IsNumber()
    @Min(0)
    quantity_in_base_unit: number;
  
    @IsNumber()
    @Min(0)
    low_threshold: number;
  
    @IsNumber()
    @Min(0)
    @IsOptional()
    average_daily_usage?: number;
  
    @IsDate()
    @IsOptional()
    @Type(() => Date)
    last_restocked_at?: Date;
  }