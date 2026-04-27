import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { join } from 'path';

import { HomeModule } from './modules/home/home.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProductModule } from './modules/product/product.module';
import { CategoryModule } from './modules/category/category.module';
import { OrderModule } from './modules/order/order.module';
import { ShopperzConfigModule } from './modules/config/config.module';
import { AdminModule } from './modules/admin/admin.module';

import { Slider } from './database/entities/slider.entity';
import { BannerSlider } from './database/entities/banner-slider.entity';
import { Category } from './database/entities/category.entity';
import { Brand } from './database/entities/brand.entity';
import { Product } from './database/entities/product.entity';
import { Customer } from './database/entities/customer.entity';
import { Order } from './database/entities/order.entity';
import { Address } from './database/entities/address.entity';
import { Notification } from './database/entities/notification.entity';
import { Voucher } from './database/entities/voucher.entity';
import { City } from './database/entities/city.entity';
import { ShippingZone } from './database/entities/shipping-zone.entity';
import { AppConfig } from './database/entities/app-config.entity';
import { PaymentGateway } from './database/entities/payment-gateway.entity';
import { Review } from './database/entities/review.entity';
import { OrderTimeline } from './database/entities/order-timeline.entity';
import { ProductImage } from './database/entities/product-image.entity';
import { VariantType } from './database/entities/variant-type.entity';
import { VariantOption } from './database/entities/variant-option.entity';
import { ProductSku } from './database/entities/product-sku.entity';

import { SeedModule } from './database/seed/seed.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '..', '..', '.env'),  // Root .env (priority)
        join(__dirname, '..', '.env'),         // Local fallback
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DATABASE_HOST', 'db'),
        port: config.get<number>('DATABASE_PORT', 5432),
        username: config.get<string>('DATABASE_USER', 'postgres'),
        password: config.get<string>('DATABASE_PASSWORD', 'password'),
        database: config.get<string>('DATABASE_NAME', 'ecommerce'),
        entities: [
          Slider, BannerSlider, Category, Brand,
          Product, Customer, Order, Address,
          Notification, Voucher,
          City, ShippingZone, AppConfig, PaymentGateway,
          Review, OrderTimeline,
          ProductImage, VariantType, VariantOption, ProductSku,
        ],
        synchronize: true, // Auto-creates/updates tables — great for local dev
        logging: false,
      }),
    }),
    SeedModule,
    HomeModule,
    AuthModule,
    ProductModule,
    CategoryModule,
    OrderModule,
    ShopperzConfigModule,
    AdminModule,
  ],
})
export class AppModule {}
