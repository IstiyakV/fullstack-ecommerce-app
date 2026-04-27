import { Controller, Post, Body } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('api/v1/customer')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('all-categories')
  getAllCategories(@Body() body: any) {
    return this.categoryService.getAllCategories();
  }
}
