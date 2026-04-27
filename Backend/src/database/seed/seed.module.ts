import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Slider } from '../entities/slider.entity';
import { BannerSlider } from '../entities/banner-slider.entity';
import { Category } from '../entities/category.entity';
import { Brand } from '../entities/brand.entity';
import { Product } from '../entities/product.entity';
import { Customer } from '../entities/customer.entity';
import { Notification } from '../entities/notification.entity';
import { Voucher } from '../entities/voucher.entity';
import { City } from '../entities/city.entity';
import { ShippingZone } from '../entities/shipping-zone.entity';
import { AppConfig } from '../entities/app-config.entity';
import { PaymentGateway } from '../entities/payment-gateway.entity';
import { Review } from '../entities/review.entity';
import { ProductImage } from '../entities/product-image.entity';
import { VariantType } from '../entities/variant-type.entity';
import { VariantOption } from '../entities/variant-option.entity';
import { ProductSku } from '../entities/product-sku.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Slider, BannerSlider, Category, Brand,
      Product, Customer, Notification, Voucher,
      City, ShippingZone, AppConfig, PaymentGateway,
      Review, ProductImage, VariantType, VariantOption, ProductSku,
    ]),
  ],
  providers: [SeedService],
  exports: [SeedService],
})
export class SeedModule {}
