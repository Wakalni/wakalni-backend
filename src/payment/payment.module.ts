import { Module, forwardRef } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { GuidiniPayStrategy } from './strategies/guidini-pay.strategy';
import { OrderModule } from '../order/order.module';

@Module({
  imports: [
    HttpModule,
    forwardRef(() => OrderModule),
  ],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    GuidiniPayStrategy,
  ],
  exports: [PaymentService],
})
export class PaymentModule {}