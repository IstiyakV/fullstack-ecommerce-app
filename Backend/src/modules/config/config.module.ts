import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigController } from './config.controller';
import { ConfigService } from './config.service';
import { City } from '../../database/entities/city.entity';
import { ShippingZone } from '../../database/entities/shipping-zone.entity';
import { AppConfig } from '../../database/entities/app-config.entity';
import { PaymentGateway } from '../../database/entities/payment-gateway.entity';

@Module({
  imports: [TypeOrmModule.forFeature([City, ShippingZone, AppConfig, PaymentGateway])],
  controllers: [ConfigController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ShopperzConfigModule {}
