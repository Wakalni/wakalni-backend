import { IsUUID, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class StockReportDto {
  @IsUUID()
  @IsOptional()
  restaurant_id?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  start_date?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  end_date?: Date;

  @IsOptional()
  low_stock_only?: boolean;
}