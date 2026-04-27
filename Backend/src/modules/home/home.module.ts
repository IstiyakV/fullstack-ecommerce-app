import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { Slider } from '../../database/entities/slider.entity';
import { BannerSlider } from '../../database/entities/banner-slider.entity';
import { Category } from '../../database/entities/category.entity';
import { Brand } from '../../database/entities/brand.entity';
import { Product } from '../../database/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Slider, BannerSlider, Category, Brand, Product])],
  controllers: [HomeController],
  providers: [HomeService],
})
export class HomeModule {}
