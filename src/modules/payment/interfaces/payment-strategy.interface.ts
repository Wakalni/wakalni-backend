export interface PaymentStrategy {
    initiatePayment(amount: number, currency?: string, metadata?: any): Promise<PaymentResponse>;
    verifyPayment(paymentId: string): Promise<PaymentVerificationResponse>;
  }
  
  export interface PaymentResponse {
    success: boolean;
    paymentId?: string;
    paymentUrl?: string;
    error?: string;
    rawResponse?: any;
  }
  
  export interface PaymentVerificationResponse {
    success: boolean;
    status: PaymentStatus;
    amount?: number;
    currency?: string;
    error?: string;
    rawResponse?: any;
  }
  
  export enum PaymentStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SUCCESS = 'success',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
  }