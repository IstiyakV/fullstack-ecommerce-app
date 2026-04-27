import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CustomerAuthGuard } from '../../common/guards/customer-auth.guard';

@Controller('api/v1/customer')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post('product-details')
  getProductDetails(@Body() body: any) {
    return this.productService.getProductDetails(body.product_id);
  }

  @Post('filtered-product')
  filterProducts(@Body() body: any) {
    return this.productService.filterProducts(body);
  }

  @Post('filtered-whole-sale-product')
  filterWsProducts(@Body() body: any) {
    return this.productService.filterWsProducts(body);
  }

  @Post('whole-sale-product-details')
  getWsProductDetails(@Body() body: any) {
    return this.productService.getWsProductDetails(body);
  }

  @Post('save-address')
  @UseGuards(CustomerAuthGuard)
  saveAddress(@Body() body: any) {
    return this.productService.saveAddress(body);
  }

  @Post('get-address')
  @UseGuards(CustomerAuthGuard)
  getAddress(@Body() body: any) {
    return this.productService.getAddress(body);
  }

  @Post('delete-address')
  @UseGuards(CustomerAuthGuard)
  deleteAddress(@Body() body: any) {
    return this.productService.deleteAddress(body);
  }

  @Post('vouchers')
  getVouchers(@Body() body: any) {
    return this.productService.getVouchers(body);
  }

  @Post('coupon')
  applyPromo(@Body() body: any) {
    return this.productService.applyPromo(body);
  }

  @Post('write-review')
  @UseGuards(CustomerAuthGuard)
  writeReview(@Body() body: any) {
    return this.productService.writeReview(body);
  }

  @Post('feedback')
  @UseGuards(CustomerAuthGuard)
  sendFeedback(@Body() body: any) {
    return this.productService.sendFeedback(body);
  }

  @Post('follow-store')
  @UseGuards(CustomerAuthGuard)
  followStore(@Body() body: any) {
    return this.productService.followStore(body);
  }

  @Post('get-notifications')
  @UseGuards(CustomerAuthGuard)
  getNotifications(@Body() body: any) {
    return this.productService.getNotifications(body);
  }
}
