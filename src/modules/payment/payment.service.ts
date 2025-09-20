import { Injectable, BadRequestException } from '@nestjs/common';
import { PaymentStrategy, PaymentResponse, PaymentVerificationResponse } from './interfaces/payment-strategy.interface';
import { GuidiniPayStrategy } from './strategies/guidini-pay.strategy';

@Injectable()
export class PaymentService {
  private strategies: Map<string, PaymentStrategy> = new Map();

  constructor(
    private guidiniPayStrategy: GuidiniPayStrategy,
  ) {
    this.strategies.set('guidini', guidiniPayStrategy);
  }

  async initiatePayment(
    amount: number,
    provider: string = 'guidini',
    currency: string = 'DZD',
    metadata?: any,
  ): Promise<PaymentResponse> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const strategy = this.strategies.get(provider);
    if (!strategy) {
      throw new BadRequestException(`Payment provider '${provider}' is not supported`);
    }

    return strategy.initiatePayment(amount, currency, metadata);
  }

  async verifyPayment(
    paymentId: string,
    provider: string = 'guidini',
  ): Promise<PaymentVerificationResponse> {
    const strategy = this.strategies.get(provider);
    if (!strategy) {
      throw new BadRequestException(`Payment provider '${provider}' is not supported`);
    }

    return strategy.verifyPayment(paymentId);
  }

  getAvailableProviders(): string[] {
    return Array.from(this.strategies.keys());
  }
}