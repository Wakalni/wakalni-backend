import {
    IsUUID,
    IsNotEmpty,
    IsOptional,
    IsNumber,
    IsEnum,
    IsString,
  } from 'class-validator';
  import { StockAdjustmentType } from '../entities/stock-adjustement.entity';
  
  export class AdjustStockDto {
    @IsUUID()
    @IsOptional()
    user_id?: string;
  
    @IsEnum(StockAdjustmentType)
    @IsNotEmpty()
    adjustment_type: StockAdjustmentType;
  
    @IsNumber()
    @IsNotEmpty()
    quantity_change: number;
  
    @IsString()
    @IsOptional()
    reason?: string;
  
    @IsString()
    @IsOptional()
    reference?: string;
  }