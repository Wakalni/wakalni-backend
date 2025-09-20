import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { PaymentStrategy, PaymentResponse, PaymentVerificationResponse, PaymentStatus } from '../interfaces/payment-strategy.interface';

@Injectable()
export class GuidiniPayStrategy implements PaymentStrategy {
  private readonly baseUrl?: string;
  private readonly appKey?: string;
  private readonly appSecret?: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>('GUIDINI_API_URL')
    this.appKey = this.configService.get<string>('GUIDINI_APP_KEY');
    this.appSecret = this.configService.get<string>('GUIDINI_SECRET');
    
    if (!this.appKey || !this.appSecret) {
      throw new Error('GuidiniPay credentials are not configured');
    }
  }

  async initiatePayment(amount: number, currency: string = 'DZD', metadata?: any): Promise<PaymentResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payment/initiate`,
        {
          amount: Math.round(amount).toString(),
          language: metadata?.language || 'fr',
          ...(metadata || {}),
        },
        {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'x-app-key': this.appKey,
            'x-app-secret': this.appSecret,
          },
          timeout: 30000,
        }
      );

      const { data } = response.data;

      return {
        success: true,
        paymentId: data.id,
        paymentUrl: data.attributes.form_url,
        rawResponse: response.data,
      };
    } catch (error) {
      return this.handleError(error, 'initiatePayment');
    }
  }

  async verifyPayment(paymentId: string): Promise<PaymentVerificationResponse> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payment/verify/${paymentId}`,
        {
          headers: {
            'Accept': 'application/json',
            'x-app-key': this.appKey,
            'x-app-secret': this.appSecret,
          },
        }
      );

      const paymentData = response.data;
      const status = this.mapStatus(paymentData.status);

      return {
        success: status === PaymentStatus.SUCCESS,
        status,
        amount: paymentData.amount,
        currency: paymentData.currency || 'DZD',
        rawResponse: paymentData,
      };
    } catch (error) {
      return {
        success: false,
        status: PaymentStatus.FAILED,
        error: error.response?.data?.message || error.message,
        rawResponse: error.response?.data,
      };
    }
  }

  private mapStatus(status: string): PaymentStatus {
    const statusMap: { [key: string]: PaymentStatus } = {
      'processing': PaymentStatus.PROCESSING,
      'completed': PaymentStatus.SUCCESS,
      'success': PaymentStatus.SUCCESS,
      'failed': PaymentStatus.FAILED,
      'cancelled': PaymentStatus.CANCELLED,
      'pending': PaymentStatus.PENDING,
    };

    return statusMap[status.toLowerCase()] || PaymentStatus.PENDING;
  }

  private handleError(error: any, context: string): PaymentResponse {
    console.error(`GuidiniPay ${context} error:`, error.response?.data || error.message);

    return {
      success: false,
      error: error.response?.data?.message || error.message,
      rawResponse: error.response?.data,
    };
  }
}