import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../database/entities/category.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
  ) {}

  async getAllCategories() {
    const categories = await this.categoryRepo.find();
    // Wrap in CategoriesModel format expected by Android
    const data = categories.map(c => ({
      ...c,
      categories: [], // sub-categories (child), empty for now
    }));
    return {
      status_code: 200,
      custom_status_code: 200,
      message: 'Success',
      access_token: '',
      data,
    };
  }
}
