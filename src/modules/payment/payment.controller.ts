import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { VerifyPaymentDto } from './dto/verify-payment.dto';
import { JwtGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';

@Controller('payments')
@UseGuards(JwtGuard, RolesGuard)
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('initiate')
  @Roles(UserRole.CLIENT, UserRole.ADMIN, UserRole.ADMIN)
  async initiatePayment(@Body() initiatePaymentDto: InitiatePaymentDto) {
    const result = await this.paymentService.initiatePayment(
      initiatePaymentDto.amount,
      initiatePaymentDto.provider,
      initiatePaymentDto.currency,
      {
        language: initiatePaymentDto.language,
        ...initiatePaymentDto.metadata,
      }
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to initiate payment');
    }

    return {
      success: true,
      paymentId: result.paymentId,
      paymentUrl: result.paymentUrl,
      provider: initiatePaymentDto.provider,
    };
  }

  @Get('verify')
  @Roles(UserRole.ADMIN, UserRole.ADMIN, UserRole.CLIENT)
  async verifyPayment(@Query() verifyPaymentDto: VerifyPaymentDto) {
    const result = await this.paymentService.verifyPayment(
      verifyPaymentDto.paymentId,
      verifyPaymentDto.provider
    );

    return {
      success: result.success,
      status: result.status,
      amount: result.amount,
      currency: result.currency,
      paymentId: verifyPaymentDto.paymentId,
    };
  }

  @Get('providers')
  @Roles(UserRole.ADMIN, UserRole.ADMIN, UserRole.CLIENT)
  getAvailableProviders() {
    return {
      providers: this.paymentService.getAvailableProviders(),
    };
  }

  @Post('webhook/guidini')
  async handleGuidiniWebhook(@Body() webhookData: any) {
    console.log('GuidiniPay webhook received:', webhookData);
    return { received: true };
  }
}