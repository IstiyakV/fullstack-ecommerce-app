import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { Order } from '../../database/entities/order.entity';
import { PaymentGateway } from '../../database/entities/payment-gateway.entity';
import { OrderTimeline } from '../../database/entities/order-timeline.entity';
import { Customer } from '../../database/entities/customer.entity';
import { Address } from '../../database/entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, PaymentGateway, OrderTimeline, Customer, Address])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
