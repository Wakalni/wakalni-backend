import {
    IsNumber,
    IsNotEmpty,
    IsOptional,
    IsString,
    Min,
    IsIn,
  } from 'class-validator';
  
  export class InitiatePaymentDto {
    @IsNumber()
    @Min(1)
    @IsNotEmpty()
    amount: number;
  
    @IsString()
    @IsOptional()
    @IsIn(['guidini'])
    provider?: string;
  
    @IsString()
    @IsOptional()
    currency?: string;
  
    @IsString()
    @IsOptional()
    language?: string;
  
    @IsOptional()
    metadata?: any;
  }