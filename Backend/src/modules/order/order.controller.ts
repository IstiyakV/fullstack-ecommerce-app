import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CustomerAuthGuard } from '../../common/guards/customer-auth.guard';

@Controller('api/v1/customer')
@UseGuards(CustomerAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('order-save')
  placeOrder(@Body() body: any) {
    return this.orderService.placeOrder(body);
  }

  @Post('get-orders')
  getOrderHistory(@Body() body: any) {
    return this.orderService.getOrderHistory(body);
  }

  @Post('order-details')
  getOrderDetails(@Body() body: any) {
    return this.orderService.getOrderDetails(body);
  }

  @Post('create-payment-intent')
  createPaymentIntent(@Body() body: any) {
    return this.orderService.createPaymentIntent(body);
  }

  @Post('cancel-order')
  cancelOrder(@Body() body: any) {
    return this.orderService.cancelOrder(body);
  }
}
