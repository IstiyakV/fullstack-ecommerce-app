import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtStrategy } from './jwt.strategy';

import { Product } from '../../database/entities/product.entity';
import { Order } from '../../database/entities/order.entity';
import { OrderTimeline } from '../../database/entities/order-timeline.entity';
import { Customer } from '../../database/entities/customer.entity';
import { Category } from '../../database/entities/category.entity';
import { Brand } from '../../database/entities/brand.entity';
import { Slider } from '../../database/entities/slider.entity';
import { BannerSlider } from '../../database/entities/banner-slider.entity';
import { Voucher } from '../../database/entities/voucher.entity';
import { Review } from '../../database/entities/review.entity';
import { City } from '../../database/entities/city.entity';
import { ShippingZone } from '../../database/entities/shipping-zone.entity';
import { AppConfig } from '../../database/entities/app-config.entity';
import { PaymentGateway } from '../../database/entities/payment-gateway.entity';
import { Notification } from '../../database/entities/notification.entity';
import { Address } from '../../database/entities/address.entity';
import { ProductImage } from '../../database/entities/product-image.entity';
import { VariantType } from '../../database/entities/variant-type.entity';
import { VariantOption } from '../../database/entities/variant-option.entity';
import { ProductSku } from '../../database/entities/product-sku.entity';

@Module({
  imports: [
    ConfigModule,
    PassportModule.register({ defaultStrategy: 'admin-jwt' }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('ADMIN_JWT_SECRET', 'shopperz-admin-secret-2026'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
    MulterModule.register({ dest: './public' }),
    TypeOrmModule.forFeature([
      Product, Order, OrderTimeline, Customer,
      Category, Brand, Slider, BannerSlider,
      Voucher, Review, City, ShippingZone,
      AppConfig, PaymentGateway, Notification, Address,
      ProductImage, VariantType, VariantOption, ProductSku,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService, JwtStrategy],
})
export class AdminModule {}
