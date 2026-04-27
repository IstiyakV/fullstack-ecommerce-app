import {
  Controller, Get, Post, Put, Patch, Delete,
  Body, Param, Query, Req, UseGuards, UseInterceptors, UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { mkdirSync } from 'fs';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('api/v1/admin')
export class AdminController {
  constructor(private readonly svc: AdminService) {}

  // ─── AUTH (no guard) ─────────────────────────────────────────────────────────

  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.svc.login(body.email, body.password);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(@Body() body: { old_password: string; new_password: string }) {
    return this.svc.changePassword(body.old_password, body.new_password);
  }

  // ─── DASHBOARD ───────────────────────────────────────────────────────────────

  @Get('dashboard')
  @UseGuards(JwtAuthGuard)
  getDashboard() {
    return this.svc.getDashboard();
  }

  // ─── ORDERS ──────────────────────────────────────────────────────────────────

  @Get('orders')
  @UseGuards(JwtAuthGuard)
  getOrders(@Query() query: any) {
    return this.svc.getOrders(query);
  }

  @Get('orders/:id')
  @UseGuards(JwtAuthGuard)
  getOrderDetail(@Param('id') id: string) {
    return this.svc.getOrderDetail(id);
  }

  @Patch('orders/:id/status')
  @UseGuards(JwtAuthGuard)
  updateOrderStatus(@Param('id') id: string, @Body() body: { status: string; note?: string }) {
    return this.svc.updateOrderStatus(id, body.status, body.note);
  }

  @Patch('orders/:id/tracking')
  @UseGuards(JwtAuthGuard)
  updateOrderTracking(@Param('id') id: string, @Body() body: { tracking_number: string; estimated_delivery?: string; tracking_url?: string }) {
    return this.svc.updateOrderTracking(id, body.tracking_number, body.estimated_delivery, body.tracking_url);
  }

  @Post('orders/:id/timeline')
  @UseGuards(JwtAuthGuard)
  addTimelineEntry(@Param('id') id: string, @Body() body: { status: string; note: string }) {
    return this.svc.addCustomTimelineEntry(id, body.status, body.note);
  }

  // ─── PRODUCTS ────────────────────────────────────────────────────────────────

  @Get('products')
  @UseGuards(JwtAuthGuard)
  getProducts(@Query() query: any) {
    return this.svc.getProducts(query);
  }

  @Get('products/:id')
  @UseGuards(JwtAuthGuard)
  getProduct(@Param('id') id: string) {
    return this.svc.getProduct(id);
  }

  @Post('products')
  @UseGuards(JwtAuthGuard)
  createProduct(@Body() body: any) {
    return this.svc.createProduct(body);
  }

  @Put('products/:id')
  @UseGuards(JwtAuthGuard)
  updateProduct(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateProduct(id, body);
  }

  @Delete('products/:id')
  @UseGuards(JwtAuthGuard)
  deleteProduct(@Param('id') id: string) {
    return this.svc.deleteProduct(id);
  }

  // ─── CUSTOMERS ───────────────────────────────────────────────────────────────

  @Get('customers')
  @UseGuards(JwtAuthGuard)
  getCustomers(@Query() query: any) {
    return this.svc.getCustomers(query);
  }

  @Get('customers/:id')
  @UseGuards(JwtAuthGuard)
  getCustomerDetail(@Param('id') id: string) {
    return this.svc.getCustomerDetail(id);
  }

  @Patch('customers/:id/status')
  @UseGuards(JwtAuthGuard)
  updateCustomerStatus(@Param('id') id: string, @Body() body: { is_active: string }) {
    return this.svc.updateCustomerStatus(id, body.is_active);
  }

  // ─── CATEGORIES ──────────────────────────────────────────────────────────────

  @Get('categories')
  @UseGuards(JwtAuthGuard)
  getCategories() {
    return this.svc.getCategories();
  }

  @Post('categories')
  @UseGuards(JwtAuthGuard)
  createCategory(@Body() body: any) {
    return this.svc.createCategory(body);
  }

  @Put('categories/:id')
  @UseGuards(JwtAuthGuard)
  updateCategory(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateCategory(id, body);
  }

  @Delete('categories/:id')
  @UseGuards(JwtAuthGuard)
  deleteCategory(@Param('id') id: string) {
    return this.svc.deleteCategory(id);
  }

  // ─── BRANDS ──────────────────────────────────────────────────────────────────

  @Get('brands')
  @UseGuards(JwtAuthGuard)
  getBrands() {
    return this.svc.getBrands();
  }

  @Post('brands')
  @UseGuards(JwtAuthGuard)
  createBrand(@Body() body: any) {
    return this.svc.createBrand(body);
  }

  @Put('brands/:id')
  @UseGuards(JwtAuthGuard)
  updateBrand(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateBrand(id, body);
  }

  @Delete('brands/:id')
  @UseGuards(JwtAuthGuard)
  deleteBrand(@Param('id') id: string) {
    return this.svc.deleteBrand(id);
  }

  // ─── SLIDERS ─────────────────────────────────────────────────────────────────

  @Get('sliders')
  @UseGuards(JwtAuthGuard)
  getSliders() {
    return this.svc.getSliders();
  }

  @Post('sliders')
  @UseGuards(JwtAuthGuard)
  createSlider(@Body() body: any) {
    return this.svc.createSlider(body);
  }

  @Put('sliders/:id')
  @UseGuards(JwtAuthGuard)
  updateSlider(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateSlider(id, body);
  }

  @Delete('sliders/:id')
  @UseGuards(JwtAuthGuard)
  deleteSlider(@Param('id') id: string) {
    return this.svc.deleteSlider(id);
  }

  // ─── BANNERS ─────────────────────────────────────────────────────────────────

  @Get('banners')
  @UseGuards(JwtAuthGuard)
  getBanners() {
    return this.svc.getBanners();
  }

  @Post('banners')
  @UseGuards(JwtAuthGuard)
  createBanner(@Body() body: any) {
    return this.svc.createBanner(body);
  }

  @Put('banners/:id')
  @UseGuards(JwtAuthGuard)
  updateBanner(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateBanner(id, body);
  }

  @Delete('banners/:id')
  @UseGuards(JwtAuthGuard)
  deleteBanner(@Param('id') id: string) {
    return this.svc.deleteBanner(id);
  }

  // ─── VOUCHERS ────────────────────────────────────────────────────────────────

  @Get('vouchers')
  @UseGuards(JwtAuthGuard)
  getVouchers() {
    return this.svc.getVouchers();
  }

  @Post('vouchers')
  @UseGuards(JwtAuthGuard)
  createVoucher(@Body() body: any) {
    return this.svc.createVoucher(body);
  }

  @Put('vouchers/:id')
  @UseGuards(JwtAuthGuard)
  updateVoucher(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateVoucher(id, body);
  }

  @Delete('vouchers/:id')
  @UseGuards(JwtAuthGuard)
  deleteVoucher(@Param('id') id: string) {
    return this.svc.deleteVoucher(id);
  }

  // ─── REVIEWS ─────────────────────────────────────────────────────────────────

  @Get('reviews')
  @UseGuards(JwtAuthGuard)
  getReviews(@Query() query: any) {
    return this.svc.getReviews(query);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  deleteReview(@Param('id') id: string) {
    return this.svc.deleteReview(id);
  }

  // ─── CITIES ──────────────────────────────────────────────────────────────────

  @Get('cities')
  @UseGuards(JwtAuthGuard)
  getCities() {
    return this.svc.getCities();
  }

  @Post('cities')
  @UseGuards(JwtAuthGuard)
  createCity(@Body() body: any) {
    return this.svc.createCity(body);
  }

  @Put('cities/:id')
  @UseGuards(JwtAuthGuard)
  updateCity(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateCity(id, body);
  }

  @Delete('cities/:id')
  @UseGuards(JwtAuthGuard)
  deleteCity(@Param('id') id: string) {
    return this.svc.deleteCity(id);
  }

  // ─── SHIPPING ZONES ─────────────────────────────────────────────────────────

  @Get('shipping-zones')
  @UseGuards(JwtAuthGuard)
  getShippingZones() {
    return this.svc.getShippingZones();
  }

  @Post('shipping-zones')
  @UseGuards(JwtAuthGuard)
  createShippingZone(@Body() body: any) {
    return this.svc.createShippingZone(body);
  }

  @Put('shipping-zones/:id')
  @UseGuards(JwtAuthGuard)
  updateShippingZone(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateShippingZone(id, body);
  }

  @Delete('shipping-zones/:id')
  @UseGuards(JwtAuthGuard)
  deleteShippingZone(@Param('id') id: string) {
    return this.svc.deleteShippingZone(id);
  }

  // ─── NOTIFICATIONS ───────────────────────────────────────────────────────────

  @Get('notifications')
  @UseGuards(JwtAuthGuard)
  getNotifications(@Query() query: any) {
    return this.svc.getNotifications(query);
  }

  @Post('notifications')
  @UseGuards(JwtAuthGuard)
  createNotification(@Body() body: any) {
    return this.svc.createNotification(body);
  }

  @Delete('notifications/:id')
  @UseGuards(JwtAuthGuard)
  deleteNotification(@Param('id') id: string) {
    return this.svc.deleteNotification(id);
  }

  // ─── APP CONFIG ──────────────────────────────────────────────────────────────

  @Get('app-config')
  @UseGuards(JwtAuthGuard)
  getAppConfig() {
    return this.svc.getAppConfig();
  }

  @Put('app-config/:id')
  @UseGuards(JwtAuthGuard)
  updateAppConfig(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateAppConfig(id, body);
  }

  // ─── PAYMENT GATEWAYS ───────────────────────────────────────────────────────

  @Get('payment-gateways')
  @UseGuards(JwtAuthGuard)
  getPaymentGateways() {
    return this.svc.getPaymentGateways();
  }

  @Put('payment-gateways/:id')
  @UseGuards(JwtAuthGuard)
  updatePaymentGateway(@Param('id') id: string, @Body() body: any) {
    return this.svc.updatePaymentGateway(id, body);
  }

  // ─── FILE UPLOAD ─────────────────────────────────────────────────────────────

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: (req, _file, cb) => {
        // Use ?folder=sliders → ./public/images/sliders
        const folder = (req.query as any).folder || '';
        const dest = folder
          ? join('./public/images', folder)
          : './public/images';
        mkdirSync(dest, { recursive: true });
        cb(null, dest);
      },
      filename: (_req, file, cb) => {
        const unique = Date.now() + '-' + Math.round(Math.random() * 1e6);
        cb(null, `${unique}${extname(file.originalname)}`);
      },
    }),
  }))
  uploadFile(@UploadedFile() file: any, @Query('folder') folder?: string) {
    return this.svc.handleUpload(file, folder);
  }

  // ─── VARIANT TYPES ──────────────────────────────────────────────────────────────

  @Get('products/:id/variant-types')
  @UseGuards(JwtAuthGuard)
  getVariantTypes(@Param('id') id: string) {
    return this.svc.getVariantTypes(id);
  }

  @Post('products/:id/variant-types')
  @UseGuards(JwtAuthGuard)
  createVariantType(@Param('id') id: string, @Body() body: any) {
    return this.svc.createVariantType(id, body);
  }

  @Put('variant-types/:id')
  @UseGuards(JwtAuthGuard)
  updateVariantType(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateVariantType(id, body);
  }

  @Delete('variant-types/:id')
  @UseGuards(JwtAuthGuard)
  deleteVariantType(@Param('id') id: string) {
    return this.svc.deleteVariantType(id);
  }

  // ─── VARIANT OPTIONS ────────────────────────────────────────────────────────────

  @Get('products/:id/variant-options')
  @UseGuards(JwtAuthGuard)
  getVariantOptions(@Param('id') id: string) {
    return this.svc.getVariantOptions(id);
  }

  @Post('products/:id/variant-options')
  @UseGuards(JwtAuthGuard)
  createVariantOption(@Param('id') id: string, @Body() body: any) {
    return this.svc.createVariantOption(id, body);
  }

  @Put('variant-options/:id')
  @UseGuards(JwtAuthGuard)
  updateVariantOption(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateVariantOption(id, body);
  }

  @Delete('variant-options/:id')
  @UseGuards(JwtAuthGuard)
  deleteVariantOption(@Param('id') id: string) {
    return this.svc.deleteVariantOption(id);
  }

  @Patch('variant-options/:id/set-default')
  @UseGuards(JwtAuthGuard)
  setDefaultOption(@Param('id') id: string) {
    return this.svc.setDefaultOption(id);
  }

  @Put('variant-options/sort-order')
  @UseGuards(JwtAuthGuard)
  updateOptionSortOrder(@Body() body: any) {
    return this.svc.updateOptionSortOrder(body);
  }

  // ─── PRODUCT SKUS ──────────────────────────────────────────────────────────────

  @Get('products/:id/skus')
  @UseGuards(JwtAuthGuard)
  getProductSkus(@Param('id') id: string) {
    return this.svc.getProductSkus(id);
  }

  @Post('products/:id/skus')
  @UseGuards(JwtAuthGuard)
  createProductSku(@Param('id') id: string, @Body() body: any) {
    return this.svc.createProductSku(id, body);
  }

  @Put('skus/:id')
  @UseGuards(JwtAuthGuard)
  updateProductSku(@Param('id') id: string, @Body() body: any) {
    return this.svc.updateProductSku(id, body);
  }

  @Delete('skus/:id')
  @UseGuards(JwtAuthGuard)
  deleteProductSku(@Param('id') id: string) {
    return this.svc.deleteProductSku(id);
  }

  @Post('products/:id/auto-generate-skus')
  @UseGuards(JwtAuthGuard)
  autoGenerateSkus(@Param('id') id: string) {
    return this.svc.autoGenerateSkus(id);
  }

  @Delete('products/:id/variants')
  @UseGuards(JwtAuthGuard)
  deleteAllVariants(@Param('id') id: string) {
    return this.svc.deleteAllVariants(id);
  }
}
