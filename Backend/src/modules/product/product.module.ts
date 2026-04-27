import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { Product } from '../../database/entities/product.entity';
import { Address } from '../../database/entities/address.entity';
import { Voucher } from '../../database/entities/voucher.entity';
import { Notification } from '../../database/entities/notification.entity';
import { Review } from '../../database/entities/review.entity';
import { ProductImage } from '../../database/entities/product-image.entity';
import { VariantType } from '../../database/entities/variant-type.entity';
import { VariantOption } from '../../database/entities/variant-option.entity';
import { ProductSku } from '../../database/entities/product-sku.entity';

import { Customer } from '../../database/entities/customer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Address, Voucher, Notification, Review, ProductImage, VariantType, VariantOption, ProductSku, Customer])],
  controllers: [ProductController],
  providers: [ProductService],
})
export class ProductModule {}
