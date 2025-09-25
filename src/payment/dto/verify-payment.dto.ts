import { IsString, IsNotEmpty, IsOptional, IsIn } from 'class-validator';

export class VerifyPaymentDto {
  @IsString()
  @IsNotEmpty()
  paymentId: string;

  @IsString()
  @IsOptional()
  @IsIn(['guidini'])
  provider?: string;
}