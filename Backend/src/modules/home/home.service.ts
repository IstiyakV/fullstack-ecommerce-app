import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Slider } from '../../database/entities/slider.entity';
import { BannerSlider } from '../../database/entities/banner-slider.entity';
import { Category } from '../../database/entities/category.entity';
import { Brand } from '../../database/entities/brand.entity';
import { Product } from '../../database/entities/product.entity';

@Injectable()
export class HomeService {
  constructor(
    @InjectRepository(Slider) private sliderRepo: Repository<Slider>,
    @InjectRepository(BannerSlider) private bannerRepo: Repository<BannerSlider>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
  ) {}

  async getHomeData() {
    const [sliders, banners, categories, brands, products] = await Promise.all([
      this.sliderRepo.find(),
      this.bannerRepo.find(),
      this.categoryRepo.find(),
      this.brandRepo.find(),
      this.productRepo.find(),
    ]);

    const retailProducts = products.filter(p => p.is_whole_sales === '0');
    const wsProducts     = products.filter(p => p.is_whole_sales === '1');

    // Build WholeSale category list from WholeSaleModel fields
    const wholeSaleCategories = wsProducts.map(p => ({
      whole_sale_category_id: p.product_id.toString(),
      category_name_en: p.category_name_en,
      category_name_bn: p.category_name_bn,
      category_image: p.category_image || p.featured_image,
      is_active: '1',
    }));

    // Build categories with sub-category wrapper for CategoriesModel format
    const categoriesWrapped = categories.map(c => ({
      ...c,
      categories: [], // sub-categories empty for now
    }));

    return {
      status_code: 200,
      custom_status_code: 200,
      message: 'Success',
      access_token: '',
      sliders,
      top_categories: categories,
      new_arrivals: retailProducts,
      hot_deals: [...retailProducts].reverse(), // reverse for variety
      full_slider: banners,
      whole_sale: wholeSaleCategories,
      gadgets: retailProducts.slice(0, 4),
      half_slider: banners,
      categories: categoriesWrapped,
      brands,
      popular_products: [...retailProducts].sort(() => 0.5 - Math.random()).slice(0, 5),
    };
  }
}
