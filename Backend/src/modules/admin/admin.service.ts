import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';

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

const OK = { success: true };

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Order) private orderRepo: Repository<Order>,
    @InjectRepository(OrderTimeline) private timelineRepo: Repository<OrderTimeline>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(Slider) private sliderRepo: Repository<Slider>,
    @InjectRepository(BannerSlider) private bannerRepo: Repository<BannerSlider>,
    @InjectRepository(Voucher) private voucherRepo: Repository<Voucher>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(City) private cityRepo: Repository<City>,
    @InjectRepository(ShippingZone) private zoneRepo: Repository<ShippingZone>,
    @InjectRepository(AppConfig) private configRepo: Repository<AppConfig>,
    @InjectRepository(PaymentGateway) private gatewayRepo: Repository<PaymentGateway>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(Address) private addressRepo: Repository<Address>,
    @InjectRepository(ProductImage) private imageRepo: Repository<ProductImage>,
    @InjectRepository(VariantType) private variantTypeRepo: Repository<VariantType>,
    @InjectRepository(VariantOption) private variantOptionRepo: Repository<VariantOption>,
    @InjectRepository(ProductSku) private skuRepo: Repository<ProductSku>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // ─── AUTH ──────────────────────────────────────────────────────────────────────

  async login(email: string, password: string) {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@shopperzmart.com');
    if (email !== adminEmail) {
      return { success: false, message: 'Invalid credentials.' };
    }

    // Check if password has been changed (bcrypt hash in app_config)
    const hashRow = await this.configRepo.findOne({ where: { config_key: 'admin_password_hash' } });
    let valid = false;
    let mustChangePassword = false;

    if (hashRow && hashRow.config_value) {
      // Password was changed — verify against bcrypt hash
      valid = await bcrypt.compare(password, hashRow.config_value);
    } else {
      // First-time login — check against .env password
      const envPassword = this.configService.get<string>('ADMIN_PASSWORD', 'admin123');
      valid = password === envPassword;
      if (valid) mustChangePassword = true;
    }

    if (!valid) {
      return { success: false, message: 'Invalid credentials.' };
    }

    const payload = { sub: 'admin', email: adminEmail, role: 'super_admin' };
    const accessToken = this.jwtService.sign(payload);

    return {
      success: true,
      access_token: accessToken,
      must_change_password: mustChangePassword,
      admin: { email: adminEmail, role: 'super_admin' },
    };
  }

  async changePassword(oldPassword: string, newPassword: string) {
    const adminEmail = this.configService.get<string>('ADMIN_EMAIL', 'admin@shopperzmart.com');

    // Verify old password
    const hashRow = await this.configRepo.findOne({ where: { config_key: 'admin_password_hash' } });
    let oldValid = false;

    if (hashRow && hashRow.config_value) {
      oldValid = await bcrypt.compare(oldPassword, hashRow.config_value);
    } else {
      const envPassword = this.configService.get<string>('ADMIN_PASSWORD', 'admin123');
      oldValid = oldPassword === envPassword;
    }

    if (!oldValid) {
      return { success: false, message: 'Current password is incorrect.' };
    }

    // Hash and store new password
    const hash = await bcrypt.hash(newPassword, 12);
    if (hashRow) {
      hashRow.config_value = hash;
      await this.configRepo.save(hashRow);
    } else {
      await this.configRepo.save({
        config_key: 'admin_password_hash',
        config_value: hash,
        description: 'Bcrypt hash of admin password',
      });
    }

    // Issue new token
    const payload = { sub: 'admin', email: adminEmail, role: 'super_admin' };
    const accessToken = this.jwtService.sign(payload);

    return { success: true, message: 'Password changed successfully.', access_token: accessToken };
  }

  // ─── DASHBOARD ─────────────────────────────────────────────────────────────────

  async getDashboard() {
    const totalProducts = await this.productRepo.count();
    const totalOrders = await this.orderRepo.count();
    const totalCustomers = await this.customerRepo.count();

    // Revenue
    const orders = await this.orderRepo.find();
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0);

    // Orders by status
    const statusCounts: Record<string, number> = {};
    orders.forEach(o => {
      statusCounts[o.order_status] = (statusCounts[o.order_status] || 0) + 1;
    });

    // Recent 10 orders
    const recentOrders = await this.orderRepo.find({ order: { created_at: 'DESC' }, take: 10 });

    // Top products (by order frequency)
    const productFreq: Record<string, { name: string; count: number; image: string }> = {};
    for (const o of orders) {
      try {
        const items = JSON.parse(o.product_details || '[]');
        for (const item of items) {
          const pid = item.productId || item.product_id || 'unknown';
          if (!productFreq[pid]) {
            productFreq[pid] = { name: item.productName || item.product_name || pid, count: 0, image: item.image || '' };
          }
          productFreq[pid].count += parseInt(item.quantity || item.qty || '1');
        }
      } catch (_) {}
    }
    const topProducts = Object.entries(productFreq)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([id, info]) => ({ product_id: id, ...info }));

    // Monthly revenue (last 6 months)
    const monthlyRevenue: { month: string; revenue: number; orders: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const label = d.toLocaleString('default', { month: 'short', year: 'numeric' });
      const monthOrders = orders.filter(o => {
        const od = new Date(o.created_at);
        return od.getMonth() === d.getMonth() && od.getFullYear() === d.getFullYear();
      });
      monthlyRevenue.push({
        month: label,
        revenue: monthOrders.reduce((s, o) => s + parseFloat(o.total_amount || '0'), 0),
        orders: monthOrders.length,
      });
    }

    return {
      ...OK,
      data: {
        total_products: totalProducts,
        total_orders: totalOrders,
        total_customers: totalCustomers,
        total_revenue: totalRevenue,
        orders_by_status: statusCounts,
        recent_orders: recentOrders,
        top_products: topProducts,
        monthly_revenue: monthlyRevenue,
      },
    };
  }

  // ─── ORDERS ────────────────────────────────────────────────────────────────────

  async getOrders(query: any) {
    const page = parseInt(query.page) || 1;
    const perPage = parseInt(query.per_page) || 20;
    const qb = this.orderRepo.createQueryBuilder('o');

    if (query.status) qb.andWhere('o.order_status = :s', { s: query.status });
    if (query.search) {
      qb.andWhere('(o.order_id::text LIKE :q OR o.customer_id LIKE :q)', { q: `%${query.search}%` });
    }

    qb.orderBy('o.created_at', 'DESC');
    const total = await qb.getCount();
    const orders = await qb.skip((page - 1) * perPage).take(perPage).getMany();

    // Enrich with customer names
    const enriched = await Promise.all(orders.map(async (o) => {
      const customer = await this.customerRepo.findOne({ where: { customer_id: o.customer_id } });
      return { ...o, customer_name: customer?.customer_name || 'Guest', customer_phone: customer?.customer_phone || '' };
    }));

    return { ...OK, data: enriched, total, page, per_page: perPage };
  }

  async getOrderDetail(id: string) {
    const order = await this.orderRepo.findOne({ where: { order_id: id } });
    if (!order) return { success: false, message: 'Order not found.' };

    let items: any[] = [];
    try { items = JSON.parse(order.product_details || '[]'); } catch (_) {}

    // Resolve address with fallback to address_id lookup
    const resolvedAddress = await this.resolveOrderAddress(order);

    const timeline = await this.timelineRepo.find({
      where: { order_id: order.order_id.toString() },
      order: { timestamp: 'ASC' },
    });

    const customer = await this.customerRepo.findOne({ where: { customer_id: order.customer_id } });

    return {
      ...OK,
      data: {
        ...order,
        customer_name: customer?.customer_name || 'Guest',
        customer_phone: customer?.customer_phone || '',
        items: items.map((item: any) => ({
          product_id: item.productId || item.product_id || '',
          product_name: item.productName || item.product_name || '',
          image: item.image || item.featured_image || '',
          selling_price: item.sellingPrice?.toString() || item.selling_price || '0',
          quantity: item.quantity?.toString() || item.qty || '1',
        })),
        shipping_address_parsed: resolvedAddress,
        timeline: timeline.map(t => ({
          timeline_id: t.timeline_id,
          status: t.status,
          note: t.note,
          timestamp: t.timestamp instanceof Date ? t.timestamp.toISOString() : t.timestamp,
        })),
      },
    };
  }

  /**
   * Resolves the shipping address for an order.
   * Priority: parsed JSON object → fallback lookup by address_id → empty.
   */
  private async resolveOrderAddress(order: any): Promise<any> {
    let address: any = {};
    try { address = JSON.parse(order.shipping_address || '{}'); } catch (_) {}

    // If parsed to a string (legacy format), wrap it
    if (typeof address === 'string') {
      address = { full_address: address };
    }

    // If has a proper recipient_name, it's a good address object
    if (address.recipient_name || address.recipientName) {
      return {
        recipient_name: address.recipient_name || address.recipientName || '',
        phone: address.phone || '',
        full_address: address.full_address || address.fullAddress || '',
        city_name: address.city_name || address.cityName || '',
        postal_code: address.postal_code || address.postalCode || '',
        label: address.label || '',
      };
    }

    // Fallback: look up the address by address_id from the Address table
    if (order.address_id) {
      try {
        const dbAddr = await this.addressRepo.findOne({ where: { address_id: order.address_id } });
        if (dbAddr) {
          return {
            recipient_name: dbAddr.recipient_name || '',
            phone: dbAddr.phone || '',
            full_address: dbAddr.full_address || '',
            city_name: dbAddr.city_name || '',
            postal_code: dbAddr.postal_code || '',
            label: dbAddr.label || '',
          };
        }
      } catch (_) {}
    }

    // Last resort: return whatever partial data we have
    return {
      recipient_name: address.recipient_name || '',
      phone: address.phone || '',
      full_address: address.full_address || '',
      city_name: address.city_name || '',
      postal_code: address.postal_code || '',
      label: address.label || '',
    };
  }

  async updateOrderStatus(id: string, status: string, note?: string) {
    const order = await this.orderRepo.findOne({ where: { order_id: id } });
    if (!order) return { success: false, message: 'Order not found.' };

    const validFlow = {
      placed:             ['confirmed', 'cancelled'],
      confirmed:          ['preparing', 'cancelled'],
      preparing:          ['packed', 'cancelled'],
      packed:             ['in_transit'],
      in_transit:         ['delivery_assigned'],
      delivery_assigned:  ['out_for_delivery'],
      out_for_delivery:   ['delivered', 'delivery_attempt_1'],
      delivery_attempt_1: ['out_for_delivery', 'delivery_attempt_2', 'delivery_failed'],
      delivery_attempt_2: ['out_for_delivery', 'delivery_attempt_3', 'delivery_failed'],
      delivery_attempt_3: ['delivery_failed'],
      delivered:          [],
      delivery_failed:    [],
      cancelled:          [],
    };
    const allowed = validFlow[order.order_status] || [];
    if (!allowed.includes(status)) {
      return { success: false, message: `Cannot change from '${order.order_status}' to '${status}'.` };
    }

    order.order_status = status;
    if (status === 'delivered') order.payment_status = 'paid';
    await this.orderRepo.save(order);

    const tl = this.timelineRepo.create({
      order_id: order.order_id.toString(),
      status,
      note: note || `Order status updated to ${status}.`,
    });
    await this.timelineRepo.save(tl);

    return { ...OK, message: `Order status updated to ${status}.` };
  }

  async addCustomTimelineEntry(id: string, status: string, note: string) {
    const order = await this.orderRepo.findOne({ where: { order_id: id } });
    if (!order) return { success: false, message: 'Order not found.' };

    const tl = this.timelineRepo.create({
      order_id: order.order_id.toString(),
      status: status || 'note',
      note: note || '',
    });
    await this.timelineRepo.save(tl);

    return { ...OK, message: 'Timeline entry added.' };
  }

  async updateOrderTracking(id: string, trackingNumber: string, estimatedDelivery?: string, trackingUrl?: string) {
    const order = await this.orderRepo.findOne({ where: { order_id: id } });
    if (!order) return { success: false, message: 'Order not found.' };

    order.tracking_number = trackingNumber;
    if (estimatedDelivery) order.estimated_delivery = estimatedDelivery;
    if (trackingUrl !== undefined) order.tracking_url = trackingUrl;
    await this.orderRepo.save(order);

    return { ...OK, message: 'Tracking info updated.' };
  }

  // ─── PRODUCTS ──────────────────────────────────────────────────────────────────

  async getProducts(query: any) {
    const page = parseInt(query.page) || 1;
    const perPage = parseInt(query.per_page) || 20;
    const qb = this.productRepo.createQueryBuilder('p');

    if (query.search) {
      qb.andWhere('LOWER(p.product_name) LIKE :q', { q: `%${query.search.toLowerCase()}%` });
    }
    if (query.category_id) qb.andWhere('p.category_id = :cid', { cid: query.category_id });
    if (query.stock_status) qb.andWhere('p.stock_status = :ss', { ss: query.stock_status });

    qb.orderBy('p.product_id', 'DESC');
    const total = await qb.getCount();
    const products = await qb.skip((page - 1) * perPage).take(perPage).getMany();

    return { ...OK, data: products, total, page, per_page: perPage };
  }

  async getProduct(id: string) {
    const product = await this.productRepo.findOne({ where: { product_id: id } });
    if (!product) return { success: false, message: 'Product not found.' };
    return { ...OK, data: product };
  }

  async createProduct(body: any) {
    const product = this.productRepo.create(body);
    const saved = await this.productRepo.save(product);
    return { ...OK, data: saved, message: 'Product created.' };
  }

  async updateProduct(id: string, body: any) {
    await this.productRepo.update(id, body);
    const updated = await this.productRepo.findOne({ where: { product_id: id } });
    return { ...OK, data: updated, message: 'Product updated.' };
  }

  async deleteProduct(id: string) {
    await this.productRepo.delete(id);
    return { ...OK, message: 'Product deleted.' };
  }

  // ─── CUSTOMERS ─────────────────────────────────────────────────────────────────

  async getCustomers(query: any) {
    const page = parseInt(query.page) || 1;
    const perPage = parseInt(query.per_page) || 20;
    const qb = this.customerRepo.createQueryBuilder('c');

    if (query.search) {
      const q = `%${query.search.toLowerCase()}%`;
      qb.andWhere('(LOWER(c.customer_name) LIKE :q OR c.customer_phone LIKE :q OR LOWER(c.customer_email) LIKE :q)', { q });
    }

    qb.orderBy('c.customer_id', 'DESC');
    const total = await qb.getCount();
    const customers = await qb.skip((page - 1) * perPage).take(perPage).getMany();

    // Strip passwords
    const safe = customers.map(c => ({ ...c, customer_password: undefined, access_token: undefined }));
    return { ...OK, data: safe, total, page, per_page: perPage };
  }

  async getCustomerDetail(id: string) {
    const customer = await this.customerRepo.findOne({ where: { customer_id: id } });
    if (!customer) return { success: false, message: 'Customer not found.' };

    const orders = await this.orderRepo.find({ where: { customer_id: id.toString() }, order: { created_at: 'DESC' } });
    const addresses = await this.addressRepo.find({ where: { customer_id: id.toString() } });

    return {
      ...OK,
      data: {
        ...customer,
        customer_password: undefined,
        access_token: undefined,
        orders,
        addresses,
      },
    };
  }

  async updateCustomerStatus(id: string, isActive: string) {
    await this.customerRepo.update(id, { is_active: isActive });
    return { ...OK, message: `Customer ${isActive === '1' ? 'activated' : 'deactivated'}.` };
  }

  // ─── CATEGORIES ────────────────────────────────────────────────────────────────

  async getCategories() {
    const data = await this.categoryRepo.find({ order: { parent_category_id: 'ASC' } });
    return { ...OK, data };
  }

  async createCategory(body: any) {
    const saved = await this.categoryRepo.save(this.categoryRepo.create(body));
    return { ...OK, data: saved, message: 'Category created.' };
  }

  async updateCategory(id: string, body: any) {
    await this.categoryRepo.update(id, body);
    return { ...OK, message: 'Category updated.' };
  }

  async deleteCategory(id: string) {
    await this.categoryRepo.delete(id);
    return { ...OK, message: 'Category deleted.' };
  }

  // ─── BRANDS ────────────────────────────────────────────────────────────────────

  async getBrands() {
    const data = await this.brandRepo.find({ order: { brand_id: 'ASC' } });
    return { ...OK, data };
  }

  async createBrand(body: any) {
    const saved = await this.brandRepo.save(this.brandRepo.create(body));
    return { ...OK, data: saved, message: 'Brand created.' };
  }

  async updateBrand(id: string, body: any) {
    await this.brandRepo.update(id, body);
    return { ...OK, message: 'Brand updated.' };
  }

  async deleteBrand(id: string) {
    await this.brandRepo.delete(id);
    return { ...OK, message: 'Brand deleted.' };
  }

  // ─── SLIDERS ───────────────────────────────────────────────────────────────────

  async getSliders() {
    return { ...OK, data: await this.sliderRepo.find() };
  }

  async createSlider(body: any) {
    const saved = await this.sliderRepo.save(this.sliderRepo.create(body));
    return { ...OK, data: saved, message: 'Slider created.' };
  }

  async updateSlider(id: string, body: any) {
    await this.sliderRepo.update(id, body);
    return { ...OK, message: 'Slider updated.' };
  }

  async deleteSlider(id: string) {
    await this.sliderRepo.delete(id);
    return { ...OK, message: 'Slider deleted.' };
  }

  // ─── BANNERS ───────────────────────────────────────────────────────────────────

  async getBanners() {
    return { ...OK, data: await this.bannerRepo.find() };
  }

  async createBanner(body: any) {
    const saved = await this.bannerRepo.save(this.bannerRepo.create(body));
    return { ...OK, data: saved, message: 'Banner created.' };
  }

  async updateBanner(id: string, body: any) {
    await this.bannerRepo.update(id, body);
    return { ...OK, message: 'Banner updated.' };
  }

  async deleteBanner(id: string) {
    await this.bannerRepo.delete(id);
    return { ...OK, message: 'Banner deleted.' };
  }

  // ─── VOUCHERS ──────────────────────────────────────────────────────────────────

  async getVouchers() {
    return { ...OK, data: await this.voucherRepo.find() };
  }

  async createVoucher(body: any) {
    const saved = await this.voucherRepo.save(this.voucherRepo.create(body));
    return { ...OK, data: saved, message: 'Voucher created.' };
  }

  async updateVoucher(id: string, body: any) {
    await this.voucherRepo.update(id, body);
    return { ...OK, message: 'Voucher updated.' };
  }

  async deleteVoucher(id: string) {
    await this.voucherRepo.delete(id);
    return { ...OK, message: 'Voucher deleted.' };
  }

  // ─── REVIEWS ───────────────────────────────────────────────────────────────────

  async getReviews(query: any) {
    const page = parseInt(query.page) || 1;
    const perPage = parseInt(query.per_page) || 20;
    const qb = this.reviewRepo.createQueryBuilder('r');

    if (query.product_id) qb.andWhere('r.product_id = :pid', { pid: query.product_id });
    if (query.rating) qb.andWhere('r.rating = :rat', { rat: parseInt(query.rating) });

    qb.orderBy('r.created_at', 'DESC');
    const total = await qb.getCount();
    const reviews = await qb.skip((page - 1) * perPage).take(perPage).getMany();

    return { ...OK, data: reviews, total, page, per_page: perPage };
  }

  async deleteReview(id: string) {
    await this.reviewRepo.delete(id);
    return { ...OK, message: 'Review deleted.' };
  }

  // ─── CITIES ────────────────────────────────────────────────────────────────────

  async getCities() {
    return { ...OK, data: await this.cityRepo.find({ order: { city_name: 'ASC' } }) };
  }

  async createCity(body: any) {
    const saved = await this.cityRepo.save(this.cityRepo.create(body));
    return { ...OK, data: saved, message: 'City created.' };
  }

  async updateCity(id: string, body: any) {
    await this.cityRepo.update(id, body);
    return { ...OK, message: 'City updated.' };
  }

  async deleteCity(id: string) {
    await this.cityRepo.delete(id);
    return { ...OK, message: 'City deleted.' };
  }

  // ─── SHIPPING ZONES ───────────────────────────────────────────────────────────

  async getShippingZones() {
    return { ...OK, data: await this.zoneRepo.find() };
  }

  async createShippingZone(body: any) {
    const saved = await this.zoneRepo.save(this.zoneRepo.create(body));
    return { ...OK, data: saved, message: 'Shipping zone created.' };
  }

  async updateShippingZone(id: string, body: any) {
    await this.zoneRepo.update(id, body);
    return { ...OK, message: 'Shipping zone updated.' };
  }

  async deleteShippingZone(id: string) {
    await this.zoneRepo.delete(id);
    return { ...OK, message: 'Shipping zone deleted.' };
  }

  // ─── NOTIFICATIONS ─────────────────────────────────────────────────────────────

  async getNotifications(query: any) {
    const page = parseInt(query.page) || 1;
    const perPage = parseInt(query.per_page) || 20;

    const [data, total] = await this.notifRepo.findAndCount({
      order: { created_at: 'DESC' },
      skip: (page - 1) * perPage,
      take: perPage,
    });

    return { ...OK, data, total, page, per_page: perPage };
  }

  async createNotification(body: any) {
    if (body.broadcast) {
      // Send to all customers
      const customers = await this.customerRepo.find();
      const notifs = customers.map(c => this.notifRepo.create({
        customer_id: c.customer_id.toString(),
        title: body.title,
        message: body.message,
      }));
      await this.notifRepo.save(notifs);
      return { ...OK, message: `Notification broadcast to ${customers.length} customers.` };
    }

    const saved = await this.notifRepo.save(this.notifRepo.create({
      customer_id: body.customer_id,
      title: body.title,
      message: body.message,
    }));
    return { ...OK, data: saved, message: 'Notification sent.' };
  }

  async deleteNotification(id: string) {
    await this.notifRepo.delete(id);
    return { ...OK, message: 'Notification deleted.' };
  }

  // ─── APP CONFIG ────────────────────────────────────────────────────────────────

  async getAppConfig() {
    const configs = await this.configRepo.find();
    // Filter out admin_password_hash from response
    return { ...OK, data: configs.filter(c => c.config_key !== 'admin_password_hash') };
  }

  async updateAppConfig(id: string, body: any) {
    await this.configRepo.update(id, { config_value: body.config_value });
    return { ...OK, message: 'Config updated.' };
  }

  // ─── PAYMENT GATEWAYS ─────────────────────────────────────────────────────────

  async getPaymentGateways() {
    return { ...OK, data: await this.gatewayRepo.find({ order: { sort_order: 'ASC' } }) };
  }

  async updatePaymentGateway(id: string, body: any) {
    await this.gatewayRepo.update(id, body);
    return { ...OK, message: 'Payment gateway updated.' };
  }

  // ─── FILE UPLOAD ───────────────────────────────────────────────────────────────

  async handleUpload(file: any, folder?: string) {
    if (!file) return { success: false, message: 'No file provided.' };
    const folderPath = folder ? `/images/${folder}` : '/images';
    const url = `/uploads${folderPath}/${file.filename}`;
    return { ...OK, url, filename: file.filename };
  }

  // ─── VARIANT TYPES ──────────────────────────────────────────────────────────────

  async getVariantTypes(productId: string) {
    const types = await this.variantTypeRepo.find({
      where: { product_id: productId.toString() },
      order: { sort_order: 'ASC' },
    });
    return { ...OK, data: types };
  }

  async createVariantType(productId: string, body: any) {
    const saved = await this.variantTypeRepo.save(this.variantTypeRepo.create({
      product_id: productId.toString(),
      type_name: body.type_name,
      sort_order: body.sort_order || '0',
    }));
    return { ...OK, data: saved, message: 'Variant type created.' };
  }

  async updateVariantType(typeId: string, body: any) {
    await this.variantTypeRepo.update(typeId, {
      type_name: body.type_name,
      sort_order: body.sort_order,
    });
    return { ...OK, message: 'Variant type updated.' };
  }

  async deleteVariantType(typeId: string) {
    // Delete all options under this type first
    const vt = await this.variantTypeRepo.findOne({ where: { type_id: typeId } });
    if (vt) {
      await this.variantOptionRepo.delete({ type_id: typeId.toString() });
    }
    await this.variantTypeRepo.delete(typeId);
    return { ...OK, message: 'Variant type and its options deleted.' };
  }

  // ─── VARIANT OPTIONS ────────────────────────────────────────────────────────────

  async getVariantOptions(productId: string) {
    const options = await this.variantOptionRepo.find({
      where: { product_id: productId.toString() },
      order: { type_id: 'ASC', sort_order: 'ASC' },
    });
    return { ...OK, data: options };
  }

  async createVariantOption(productId: string, body: any) {
    // Auto-thumbnail: if no image provided, use product's featured image
    let optionImage = body.option_image;

    const saved = await this.variantOptionRepo.save(this.variantOptionRepo.create({
      type_id: body.type_id,
      product_id: productId.toString(),
      option_value: body.option_value,
      option_image: optionImage,
      color_code: body.color_code || undefined,
      sort_order: body.sort_order || '0',
      is_active: body.is_active || '1',
      gallery_images: body.gallery_images ? JSON.stringify(body.gallery_images) : undefined,
    }));
    return { ...OK, data: saved, message: 'Variant option created.' };
  }

  async updateVariantOption(optionId: string, body: any) {
    const updateData = { ...body };
    if (updateData.gallery_images && Array.isArray(updateData.gallery_images)) {
      updateData.gallery_images = JSON.stringify(updateData.gallery_images);
    }
    await this.variantOptionRepo.update(optionId, updateData);
    return { ...OK, message: 'Variant option updated.' };
  }

  async deleteVariantOption(optionId: string) {
    await this.variantOptionRepo.delete(optionId);
    return { ...OK, message: 'Variant option deleted.' };
  }

  async setDefaultOption(optionId: string) {
    const option = await this.variantOptionRepo.findOne({ where: { option_id: optionId } });
    if (!option) return { success: false, message: 'Option not found.' };
    // Clear other defaults for this type+product
    await this.variantOptionRepo.update(
      { type_id: option.type_id, product_id: option.product_id },
      { is_default: '0' },
    );
    // Set this one
    await this.variantOptionRepo.update(optionId, { is_default: '1' });
    return { ...OK, message: `"${option.option_value}" set as default.` };
  }

  async updateOptionSortOrder(body: { options: { option_id: string; sort_order: string }[] }) {
    for (const item of body.options) {
      await this.variantOptionRepo.update(item.option_id, { sort_order: item.sort_order });
    }
    return { ...OK, message: 'Sort order updated.' };
  }

  // ─── PRODUCT SKUS ──────────────────────────────────────────────────────────────

  async getProductSkus(productId: string) {
    const skus = await this.skuRepo.find({
      where: { product_id: productId.toString() },
      order: { sku_code: 'ASC' },
    });
    return { ...OK, data: skus };
  }

  async createProductSku(productId: string, body: any) {
    const saved = await this.skuRepo.save(this.skuRepo.create({
      product_id: productId.toString(),
      sku_code: body.sku_code,
      regular_price: body.regular_price,
      price: body.price,
      stock: body.stock || '0',
      is_active: body.is_active || '1',
      combination: body.combination,
    }));
    await this.syncProductPrices(productId);
    return { ...OK, data: saved, message: 'SKU created.' };
  }

  async updateProductSku(skuId: string, body: any) {
    await this.skuRepo.update(skuId, body);
    const sku = await this.skuRepo.findOne({ where: { sku_id: skuId } });
    if (sku) await this.syncProductPrices(sku.product_id);
    return { ...OK, message: 'SKU updated.' };
  }

  async deleteProductSku(skuId: string) {
    const sku = await this.skuRepo.findOne({ where: { sku_id: skuId } });
    await this.skuRepo.delete(skuId);
    if (sku) await this.syncProductPrices(sku.product_id);
    return { ...OK, message: 'SKU deleted.' };
  }

  async autoGenerateSkus(productId: string) {
    const product = await this.productRepo.findOne({ where: { product_id: productId } });
    if (!product) return { success: false, message: 'Product not found.' };

    // Get all types and options for this product
    const types = await this.variantTypeRepo.find({
      where: { product_id: productId.toString() },
      order: { sort_order: 'ASC' },
    });

    if (types.length === 0) return { success: false, message: 'No variant types defined.' };

    const typeOptions: { typeName: string; options: { value: string }[] }[] = [];
    for (const t of types) {
      const opts = await this.variantOptionRepo.find({
        where: { type_id: t.type_id.toString(), is_active: '1' },
        order: { sort_order: 'ASC' },
      });
      typeOptions.push({
        typeName: t.type_name,
        options: opts.map(o => ({ value: o.option_value })),
      });
    }

    // Compute cartesian product
    const combos = this.cartesianProduct(typeOptions);

    // Generate SKU codes and save
    const baseSku = product.sku_code || `SM-P${productId}`;
    let created = 0;
    for (const combo of combos) {
      // Build SKU suffix from abbreviations
      const suffix = Object.values(combo)
        .map((v: string) => v.replace(/\s+/g, '').substring(0, 3).toUpperCase())
        .join('-');
      const skuCode = `${baseSku}-${suffix}`;

      // Skip if SKU already exists
      const existing = await this.skuRepo.findOne({ where: { sku_code: skuCode } });
      if (existing) continue;

      const newSku = this.skuRepo.create({
        product_id: productId.toString(),
        sku_code: skuCode,
        regular_price: product.regular_price,
        price: product.selling_price,
        stock: '0',
        is_active: '1',
        combination: JSON.stringify(combo),
      });
      await this.skuRepo.save(newSku);
      created++;
    }

    await this.syncProductPrices(productId);
    return { ...OK, message: `Generated ${created} new SKU combinations.`, total_combos: combos.length };
  }

  async deleteAllVariants(productId: string) {
    // Delete SKUs
    await this.skuRepo.delete({ product_id: productId.toString() });
    // Delete Options
    await this.variantOptionRepo.delete({ product_id: productId.toString() });
    // Delete Types
    await this.variantTypeRepo.delete({ product_id: productId.toString() });

    await this.syncProductPrices(productId);
    return { ...OK, message: 'All variants deleted successfully.' };
  }

  private cartesianProduct(typeOptions: { typeName: string; options: { value: string }[] }[]): Record<string, string>[] {
    if (typeOptions.length === 0) return [{}];
    const [first, ...rest] = typeOptions;
    const restCombos = this.cartesianProduct(rest);
    const result: Record<string, string>[] = [];
    for (const opt of first.options) {
      for (const restCombo of restCombos) {
        result.push({ [first.typeName]: opt.value, ...restCombo });
      }
    }
    return result;
  }

  async syncProductPrices(productId: string) {
    const product = await this.productRepo.findOne({ where: { product_id: productId.toString() } });
    if (!product) return;

    const skus = await this.skuRepo.find({ where: { product_id: productId.toString(), is_active: '1' } });
    if (skus.length > 0) {
      let minPrice = Infinity;
      let maxDiscount = 0;
      for (const sku of skus) {
        const p = parseFloat(sku.price || '0');
        const r = parseFloat(sku.regular_price || '0');
        if (p < minPrice) minPrice = p;
        if (r > p && r > 0) {
          const disc = Math.round(((r - p) / r) * 100);
          if (disc > maxDiscount) maxDiscount = disc;
        }
      }
      if (minPrice !== Infinity) {
        await this.productRepo.update(productId.toString(), {
          selling_price: minPrice.toString(),
          discount_rate: maxDiscount.toString(),
        });
      }
    } else {
      const p = parseFloat(product.selling_price || '0');
      const r = parseFloat(product.regular_price || '0');
      let disc = 0;
      if (r > p && r > 0) {
        disc = Math.round(((r - p) / r) * 100);
      }
      await this.productRepo.update(productId.toString(), {
        discount_rate: disc.toString(),
      });
    }
  }
}
