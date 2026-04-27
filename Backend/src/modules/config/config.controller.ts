import { Controller, Post, Body } from '@nestjs/common';
import { ConfigService } from './config.service';

@Controller('api/v1/config')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Post('cities')
  getCities() {
    return this.configService.getCities();
  }

  @Post('shipping-zones')
  getShippingZones() {
    return this.configService.getShippingZones();
  }

  @Post('shipping-zone-for-city')
  getShippingZoneForCity(@Body() body: any) {
    return this.configService.getShippingZoneForCity(body.city_id);
  }

  @Post('app-config')
  getAppConfig() {
    return this.configService.getAppConfig();
  }

  @Post('payment-gateways')
  getPaymentGateways() {
    return this.configService.getPaymentGateways();
  }
}
