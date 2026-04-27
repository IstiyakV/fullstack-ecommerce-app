import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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

// Use relative paths so images resolve correctly from any host (browser, emulator, Docker)
const IMG_BASE = '/uploads';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly log = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Slider) private sliderRepo: Repository<Slider>,
    @InjectRepository(BannerSlider) private bannerRepo: Repository<BannerSlider>,
    @InjectRepository(Category) private categoryRepo: Repository<Category>,
    @InjectRepository(Brand) private brandRepo: Repository<Brand>,
    @InjectRepository(Product) private productRepo: Repository<Product>,
    @InjectRepository(Customer) private customerRepo: Repository<Customer>,
    @InjectRepository(Notification) private notifRepo: Repository<Notification>,
    @InjectRepository(Voucher) private voucherRepo: Repository<Voucher>,
    @InjectRepository(City) private cityRepo: Repository<City>,
    @InjectRepository(ShippingZone) private zoneRepo: Repository<ShippingZone>,
    @InjectRepository(AppConfig) private configRepo: Repository<AppConfig>,
    @InjectRepository(PaymentGateway) private gatewayRepo: Repository<PaymentGateway>,
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
    @InjectRepository(ProductImage) private imageRepo: Repository<ProductImage>,
    @InjectRepository(VariantType) private variantTypeRepo: Repository<VariantType>,
    @InjectRepository(VariantOption) private variantOptionRepo: Repository<VariantOption>,
    @InjectRepository(ProductSku) private skuRepo: Repository<ProductSku>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedShippingZones();
    await this.seedCities();
    await this.seedAppConfig();
    await this.seedPaymentGateways();
    await this.seedSliders();
    await this.seedBanners();
    await this.seedCategories();
    await this.seedBrands();
    await this.seedProducts();
    await this.seedProductImages();
    await this.seedVariants();
    await this.seedCustomers();
    await this.seedNotifications();
    await this.seedVouchers();
    await this.seedReviews();
    this.log.log('✅ Database seeding complete.');
  }

  // ── Dynamic Infrastructure Seeding ────────────────────────────────────

  private async seedShippingZones() {
    if (await this.zoneRepo.count() > 0) return;
    await this.zoneRepo.save(this.zoneRepo.create([
      {
        zone_name: 'Inside Dhaka',
        has_standard: '1', standard_fee: '60', standard_min_days: '3', standard_max_days: '5',
        has_express: '1', express_fee: '120', express_min_days: '1', express_max_days: '2',
        is_active: '1',
      },
      {
        zone_name: 'Outside Dhaka',
        has_standard: '1', standard_fee: '120', standard_min_days: '5', standard_max_days: '7',
        has_express: '0', express_fee: '200', express_min_days: '3', express_max_days: '4',
        is_active: '1',
      },
    ]));
    this.log.log('Seeded: Shipping Zones (Inside Dhaka, Outside Dhaka)');
  }

  private async seedCities() {
    if (await this.cityRepo.count() > 0) return;

    // Zone 1 = Inside Dhaka, Zone 2 = Outside Dhaka
    const insideDhaka = [
      { city_name: 'Dhaka', division: 'Dhaka', shipping_zone_id: '1' },
      { city_name: 'Gazipur', division: 'Dhaka', shipping_zone_id: '1' },
      { city_name: 'Narayanganj', division: 'Dhaka', shipping_zone_id: '1' },
      { city_name: 'Tongi', division: 'Dhaka', shipping_zone_id: '1' },
      { city_name: 'Savar', division: 'Dhaka', shipping_zone_id: '1' },
    ];

    const outsideDhaka = [
      // Dhaka Division (outside metro)
      { city_name: 'Manikganj', division: 'Dhaka', shipping_zone_id: '2' },
      { city_name: 'Munshiganj', division: 'Dhaka', shipping_zone_id: '2' },
      { city_name: 'Narsingdi', division: 'Dhaka', shipping_zone_id: '2' },
      { city_name: 'Tangail', division: 'Dhaka', shipping_zone_id: '2' },
      { city_name: 'Kishoreganj', division: 'Dhaka', shipping_zone_id: '2' },
      { city_name: 'Madaripur', division: 'Dhaka', shipping_zone_id: '2' },
      { city_name: 'Gopalganj', division: 'Dhaka', shipping_zone_id: '2' },
      { city_name: 'Faridpur', division: 'Dhaka', shipping_zone_id: '2' },
      { city_name: 'Rajbari', division: 'Dhaka', shipping_zone_id: '2' },
      { city_name: 'Shariatpur', division: 'Dhaka', shipping_zone_id: '2' },
      // Chattogram Division
      { city_name: 'Chattogram', division: 'Chattogram', shipping_zone_id: '2' },
      { city_name: "Cox's Bazar", division: 'Chattogram', shipping_zone_id: '2' },
      { city_name: 'Comilla', division: 'Chattogram', shipping_zone_id: '2' },
      { city_name: 'Brahmanbaria', division: 'Chattogram', shipping_zone_id: '2' },
      { city_name: 'Chandpur', division: 'Chattogram', shipping_zone_id: '2' },
      { city_name: 'Noakhali', division: 'Chattogram', shipping_zone_id: '2' },
      { city_name: 'Feni', division: 'Chattogram', shipping_zone_id: '2' },
      { city_name: 'Lakshmipur', division: 'Chattogram', shipping_zone_id: '2' },
      { city_name: 'Rangamati', division: 'Chattogram', shipping_zone_id: '2' },
      { city_name: 'Bandarban', division: 'Chattogram', shipping_zone_id: '2' },
      { city_name: 'Khagrachhari', division: 'Chattogram', shipping_zone_id: '2' },
      // Rajshahi Division
      { city_name: 'Rajshahi', division: 'Rajshahi', shipping_zone_id: '2' },
      { city_name: 'Bogura', division: 'Rajshahi', shipping_zone_id: '2' },
      { city_name: 'Pabna', division: 'Rajshahi', shipping_zone_id: '2' },
      { city_name: 'Sirajganj', division: 'Rajshahi', shipping_zone_id: '2' },
      { city_name: 'Natore', division: 'Rajshahi', shipping_zone_id: '2' },
      { city_name: 'Naogaon', division: 'Rajshahi', shipping_zone_id: '2' },
      { city_name: 'Chapainawabganj', division: 'Rajshahi', shipping_zone_id: '2' },
      { city_name: 'Joypurhat', division: 'Rajshahi', shipping_zone_id: '2' },
      // Khulna Division
      { city_name: 'Khulna', division: 'Khulna', shipping_zone_id: '2' },
      { city_name: 'Jessore', division: 'Khulna', shipping_zone_id: '2' },
      { city_name: 'Satkhira', division: 'Khulna', shipping_zone_id: '2' },
      { city_name: 'Kushtia', division: 'Khulna', shipping_zone_id: '2' },
      { city_name: 'Bagerhat', division: 'Khulna', shipping_zone_id: '2' },
      { city_name: 'Jhenaidah', division: 'Khulna', shipping_zone_id: '2' },
      { city_name: 'Magura', division: 'Khulna', shipping_zone_id: '2' },
      { city_name: 'Narail', division: 'Khulna', shipping_zone_id: '2' },
      { city_name: 'Meherpur', division: 'Khulna', shipping_zone_id: '2' },
      { city_name: 'Chuadanga', division: 'Khulna', shipping_zone_id: '2' },
      // Sylhet Division
      { city_name: 'Sylhet', division: 'Sylhet', shipping_zone_id: '2' },
      { city_name: 'Moulvibazar', division: 'Sylhet', shipping_zone_id: '2' },
      { city_name: 'Habiganj', division: 'Sylhet', shipping_zone_id: '2' },
      { city_name: 'Sunamganj', division: 'Sylhet', shipping_zone_id: '2' },
      // Barishal Division
      { city_name: 'Barishal', division: 'Barishal', shipping_zone_id: '2' },
      { city_name: 'Patuakhali', division: 'Barishal', shipping_zone_id: '2' },
      { city_name: 'Bhola', division: 'Barishal', shipping_zone_id: '2' },
      { city_name: 'Pirojpur', division: 'Barishal', shipping_zone_id: '2' },
      { city_name: 'Barguna', division: 'Barishal', shipping_zone_id: '2' },
      { city_name: 'Jhalokati', division: 'Barishal', shipping_zone_id: '2' },
      // Rangpur Division
      { city_name: 'Rangpur', division: 'Rangpur', shipping_zone_id: '2' },
      { city_name: 'Dinajpur', division: 'Rangpur', shipping_zone_id: '2' },
      { city_name: 'Kurigram', division: 'Rangpur', shipping_zone_id: '2' },
      { city_name: 'Gaibandha', division: 'Rangpur', shipping_zone_id: '2' },
      { city_name: 'Nilphamari', division: 'Rangpur', shipping_zone_id: '2' },
      { city_name: 'Thakurgaon', division: 'Rangpur', shipping_zone_id: '2' },
      { city_name: 'Panchagarh', division: 'Rangpur', shipping_zone_id: '2' },
      { city_name: 'Lalmonirhat', division: 'Rangpur', shipping_zone_id: '2' },
      // Mymensingh Division
      { city_name: 'Mymensingh', division: 'Mymensingh', shipping_zone_id: '2' },
      { city_name: 'Netrokona', division: 'Mymensingh', shipping_zone_id: '2' },
      { city_name: 'Jamalpur', division: 'Mymensingh', shipping_zone_id: '2' },
      { city_name: 'Sherpur', division: 'Mymensingh', shipping_zone_id: '2' },
    ];

    await this.cityRepo.save(this.cityRepo.create([...insideDhaka, ...outsideDhaka].map(c => ({ ...c, is_active: '1' }))));
    this.log.log(`Seeded: ${insideDhaka.length + outsideDhaka.length} Cities of Bangladesh`);
  }

  private async seedAppConfig() {
    if (await this.configRepo.count() > 0) return;
    await this.configRepo.save(this.configRepo.create([
      { config_key: 'currency_code', config_value: 'BDT', description: 'ISO currency code' },
      { config_key: 'currency_symbol', config_value: '৳', description: 'Currency display symbol' },
      { config_key: 'currency_position', config_value: 'before', description: 'Symbol position: before or after the amount' },
      { config_key: 'min_order_amount', config_value: '100', description: 'Minimum order total in currency' },
      { config_key: 'app_name', config_value: 'Shopperz Mart', description: 'Application display name' },
      { config_key: 'support_phone', config_value: '+8801700000000', description: 'Customer support phone' },
      { config_key: 'support_email', config_value: 'support@shopperzmart.com', description: 'Customer support email' },
    ]));
    this.log.log('Seeded: App Config (BDT, ৳, Shopperz Mart)');
  }

  private async seedPaymentGateways() {
    if (await this.gatewayRepo.count() > 0) return;
    await this.gatewayRepo.save(this.gatewayRepo.create([
      {
        gateway_name: 'stripe', display_name: 'Credit/Debit Card',
        icon_url: '', is_active: '1', sort_order: '1', payment_type: 'online',
        config_json: JSON.stringify({ publishable_key: '', secret_key: '' }),
      },
      {
        gateway_name: 'cod', display_name: 'Cash on Delivery',
        icon_url: '', is_active: '1', sort_order: '2', payment_type: 'offline',
        config_json: JSON.stringify({}),
      },
      {
        gateway_name: 'bkash', display_name: 'bKash',
        icon_url: '', is_active: '0', sort_order: '3', payment_type: 'online',
        config_json: JSON.stringify({ app_key: '', app_secret: '' }),
      },
      {
        gateway_name: 'sslcommerz', display_name: 'SSLCommerz',
        icon_url: '', is_active: '0', sort_order: '4', payment_type: 'online',
        config_json: JSON.stringify({ store_id: '', store_password: '' }),
      },
    ]));
    this.log.log('Seeded: Payment Gateways (Stripe, COD active | bKash, SSLCommerz ready)');
  }

  // ── Original Seeding Methods ──────────────────────────────────────────

  private async seedSliders() {
    if (await this.sliderRepo.count() > 0) return;
    await this.sliderRepo.save(this.sliderRepo.create([
      { slider_image: `${IMG_BASE}/images/banners/banner_summer_sale.png`, slider_title: 'Summer Sale', slider_url: '' },
      { slider_image: `${IMG_BASE}/images/banners/banner_new_arrivals.png`, slider_title: 'New Arrivals', slider_url: '' },
      { slider_image: `${IMG_BASE}/images/banners/banner_electronics.png`, slider_title: 'Electronics Deals', slider_url: '' },
    ]));
    this.log.log('Seeded: Sliders');
  }

  private async seedBanners() {
    if (await this.bannerRepo.count() > 0) return;
    await this.bannerRepo.save(this.bannerRepo.create([
      {
        section_id: '1', slider_image: `${IMG_BASE}/images/banners/banner_summer_sale.png`,
        slider_mobile_image: `${IMG_BASE}/images/banners/banner_summer_sale.png`,
        slider_title: 'Summer Sale', slider_sub_title: 'Up to 70% off', publish_status: '1',
      },
      {
        section_id: '2', slider_image: `${IMG_BASE}/images/banners/banner_electronics.png`,
        slider_mobile_image: `${IMG_BASE}/images/banners/banner_electronics.png`,
        slider_title: 'Electronics', slider_sub_title: 'Best deals on gadgets', publish_status: '1',
      },
    ]));
    this.log.log('Seeded: Banners');
  }

  private async seedCategories() {
    if (await this.categoryRepo.count() > 0) return;
    await this.categoryRepo.save(this.categoryRepo.create([
      { parent_category_name_en: 'Electronics', parent_category_name_bn: 'ইলেকট্রনিক্স', featured_image: `${IMG_BASE}/images/categories/electronics.png`, is_active: '1' },
      { parent_category_name_en: 'Fashion', parent_category_name_bn: 'ফ্যাশন', featured_image: `${IMG_BASE}/images/categories/fashion.png`, is_active: '1' },
      { parent_category_name_en: 'Grocery', parent_category_name_bn: 'মুদি', featured_image: `${IMG_BASE}/images/categories/grocery.png`, is_active: '1' },
      { parent_category_name_en: 'Sports', parent_category_name_bn: 'ক্রীড়া', featured_image: `${IMG_BASE}/images/categories/sports.png`, is_active: '1' },
    ]));
    this.log.log('Seeded: Categories');
  }

  private async seedBrands() {
    if (await this.brandRepo.count() > 0) return;
    await this.brandRepo.save(this.brandRepo.create([
      { brand_image: `${IMG_BASE}/images/categories/electronics.png`, category_name_en: 'Samsung', category_name_bn: 'স্যামসাং', is_active: '1' },
      { brand_image: `${IMG_BASE}/images/categories/electronics.png`, category_name_en: 'Apple', category_name_bn: 'অ্যাপল', is_active: '1' },
      { brand_image: `${IMG_BASE}/images/categories/fashion.png`, category_name_en: 'Nike', category_name_bn: 'নাইকি', is_active: '1' },
    ]));
    this.log.log('Seeded: Brands');
  }

  private async seedProducts() {
    if (await this.productRepo.count() > 0) return;
    const products = [
      {
        product_name: 'Galaxy S24 Ultra', product_slug: 'galaxy-s24-ultra',
        product_details: '<h3>Samsung Galaxy S24 Ultra</h3><p>The Galaxy S24 Ultra features a stunning 6.8" Dynamic AMOLED 2X display with 200MP camera system, built-in S Pen, and Galaxy AI features. The titanium frame provides premium durability with IP68 water resistance.</p><ul><li>6.8" QHD+ Dynamic AMOLED 2X, 120Hz</li><li>200MP + 12MP + 10MP + 50MP quad camera</li><li>Snapdragon 8 Gen 3 processor</li><li>5000mAh battery with 45W fast charging</li><li>Built-in S Pen with AI features</li></ul>',
        product_specification: '<table><tr><td>Display</td><td>6.8" QHD+ Dynamic AMOLED 2X, 120Hz</td></tr><tr><td>Processor</td><td>Snapdragon 8 Gen 3</td></tr><tr><td>Camera</td><td>200MP + 12MP + 10MP + 50MP</td></tr><tr><td>Battery</td><td>5000mAh, 45W Fast Charging</td></tr><tr><td>OS</td><td>Android 14, One UI 6.1</td></tr><tr><td>Weight</td><td>232g</td></tr></table>',
        selling_price: '1299', regular_price: '1499', discount_rate: '13',
        featured_image: `${IMG_BASE}/images/products/smartphone.png`,
        image: `${IMG_BASE}/images/products/smartphone.png`,
        stock: '50', product_type: 'retail', parent_category_id: '1',
        category_id: '1', category_name_en: 'Electronics', delivery_charge: '50',
        shop_name: 'TechZone BD', shop_id: '1', is_whole_sales: '0',
        product_rating: '4.8', shop_rating: '4.6',
        sku_code: 'SM-GS24U-001',
        brand_name: 'Samsung',
        highlights: JSON.stringify(['200MP Camera with AI Enhancement', 'Titanium Build, IP68 Rated', 'Built-in S Pen with Air Gestures', 'Galaxy AI for Live Translate & Circle to Search', '6.8" QHD+ 120Hz Display']),
        warranty_info: '1 Year Official Samsung Warranty',
        return_policy: '7 Days Easy Return',
        total_sold: '156',
      },
      {
        product_name: 'ProBook Slim 14"', product_slug: 'probook-slim-14',
        product_details: '<h3>ProBook Slim 14" Laptop</h3><p>Ultra-thin 14-inch laptop with Intel Core i7, 16GB RAM, 512GB SSD. Perfect for professionals on the go.</p><ul><li>14" Full HD IPS Display</li><li>Intel Core i7-13700H</li><li>16GB DDR5 RAM</li><li>512GB NVMe SSD</li><li>All-day battery life (10+ hours)</li></ul>',
        product_specification: '<table><tr><td>Display</td><td>14" Full HD IPS, 60Hz</td></tr><tr><td>Processor</td><td>Intel Core i7-13700H</td></tr><tr><td>RAM</td><td>16GB DDR5</td></tr><tr><td>Storage</td><td>512GB NVMe SSD</td></tr><tr><td>Battery</td><td>56Wh, 10+ hours</td></tr><tr><td>Weight</td><td>1.4kg</td></tr></table>',
        selling_price: '899', regular_price: '1100', discount_rate: '18',
        featured_image: `${IMG_BASE}/images/products/laptop.png`,
        image: `${IMG_BASE}/images/products/laptop.png`,
        stock: '30', product_type: 'retail', parent_category_id: '1',
        category_id: '1', category_name_en: 'Electronics', delivery_charge: '100',
        shop_name: 'TechZone BD', shop_id: '1', is_whole_sales: '0',
        product_rating: '4.7', shop_rating: '4.6',
        sku_code: 'SM-PRBK14-001',
        brand_name: 'ProBook',
        highlights: JSON.stringify(['Intel Core i7-13700H Processor', '16GB DDR5 RAM, Upgradable', '512GB NVMe SSD', '14" Full HD IPS Display', 'Under 1.4kg Ultra-Lightweight']),
        warranty_info: '2 Year Official Warranty',
        return_policy: '14 Days Easy Return',
        total_sold: '89',
      },
      {
        product_name: 'SoundMax Pro Headphones', product_slug: 'soundmax-pro',
        product_details: '<h3>SoundMax Pro Wireless Headphones</h3><p>Premium wireless headphones with ANC, 30-hour battery and Hi-Res Audio certification.</p>',
        product_specification: '<table><tr><td>Driver</td><td>40mm Dynamic</td></tr><tr><td>ANC</td><td>Hybrid Active Noise Cancellation</td></tr><tr><td>Battery</td><td>30 hours (ANC on)</td></tr><tr><td>Bluetooth</td><td>5.3</td></tr><tr><td>Weight</td><td>250g</td></tr></table>',
        selling_price: '149', regular_price: '199', discount_rate: '25',
        featured_image: `${IMG_BASE}/images/products/headphones.png`,
        image: `${IMG_BASE}/images/products/headphones.png`,
        stock: '100', product_type: 'retail', parent_category_id: '1',
        category_id: '1', category_name_en: 'Electronics', delivery_charge: '30',
        shop_name: 'AudioHub', shop_id: '2', is_whole_sales: '0',
        product_rating: '4.5', shop_rating: '4.3',
        sku_code: 'SM-SNDMX-001',
        brand_name: 'SoundMax',
        highlights: JSON.stringify(['Hybrid Active Noise Cancellation', '30-Hour Battery Life', 'Hi-Res Audio Certified', 'Bluetooth 5.3 Multipoint', 'Foldable Premium Build']),
        warranty_info: '1 Year Manufacturer Warranty',
        return_policy: '7 Days Easy Return',
        total_sold: '234',
      },
      {
        product_name: 'Urban Classic T-Shirt', product_slug: 'urban-classic-tshirt',
        product_details: '<h3>Urban Classic Premium T-Shirt</h3><p>100% premium cotton casual t-shirt. Breathable, comfortable, and available in multiple colours and sizes.</p>',
        product_specification: '<table><tr><td>Material</td><td>100% Premium Cotton</td></tr><tr><td>Fit</td><td>Regular Fit</td></tr><tr><td>Wash</td><td>Machine Washable</td></tr><tr><td>Origin</td><td>Bangladesh</td></tr></table>',
        selling_price: '25', regular_price: '35', discount_rate: '28',
        featured_image: `${IMG_BASE}/images/products/tshirt.png`,
        image: `${IMG_BASE}/images/products/tshirt.png`,
        stock: '200', product_type: 'retail', parent_category_id: '2',
        category_id: '2', category_name_en: 'Fashion', delivery_charge: '20',
        shop_name: 'StyleHub', shop_id: '3', is_whole_sales: '0',
        product_rating: '4.3', shop_rating: '4.1',
        sku_code: 'SM-URBN-TS-001',
        brand_name: 'Urban Classic',
        highlights: JSON.stringify(['100% Premium Combed Cotton', 'Pre-Shrunk Fabric', 'Reinforced Stitching', 'Available in 5 Colors & 5 Sizes']),
        warranty_info: null,
        return_policy: '7 Days Easy Return',
        total_sold: '512',
      },
      {
        product_name: 'AirStep Sneakers', product_slug: 'airstep-sneakers',
        product_details: '<h3>AirStep Sneakers</h3><p>Lightweight and breathable running sneakers with memory foam sole.</p>',
        product_specification: '<table><tr><td>Upper</td><td>Breathable Mesh</td></tr><tr><td>Sole</td><td>Memory Foam + Rubber</td></tr><tr><td>Closure</td><td>Lace-up</td></tr></table>',
        selling_price: '65', regular_price: '89', discount_rate: '27',
        featured_image: `${IMG_BASE}/images/products/sneakers.png`,
        image: `${IMG_BASE}/images/products/sneakers.png`,
        stock: '80', product_type: 'retail', parent_category_id: '2',
        category_id: '2', category_name_en: 'Fashion', delivery_charge: '30',
        shop_name: 'StyleHub', shop_id: '3', is_whole_sales: '0',
        product_rating: '4.6', shop_rating: '4.1',
        sku_code: 'SM-AIRSTP-001',
        brand_name: 'AirStep',
        highlights: JSON.stringify(['Memory Foam Insole', 'Breathable Mesh Upper', 'Anti-Slip Rubber Outsole', 'Ultra-Lightweight Design']),
        warranty_info: '6 Months Sole Warranty',
        return_policy: '7 Days Easy Return',
        total_sold: '328',
      },
      {
        product_name: 'Chrono Prestige Watch', product_slug: 'chrono-prestige-watch',
        product_details: '<h3>Chrono Prestige Analog Watch</h3><p>Luxury stainless steel analog watch with sapphire crystal glass and Swiss movement.</p>',
        product_specification: '<table><tr><td>Movement</td><td>Swiss Quartz</td></tr><tr><td>Case</td><td>316L Stainless Steel</td></tr><tr><td>Crystal</td><td>Sapphire</td></tr><tr><td>Water Resistance</td><td>50m / 5ATM</td></tr><tr><td>Diameter</td><td>42mm</td></tr></table>',
        selling_price: '199', regular_price: '299', discount_rate: '33',
        featured_image: `${IMG_BASE}/images/products/watch.png`,
        image: `${IMG_BASE}/images/products/watch.png`,
        stock: '40', product_type: 'retail', parent_category_id: '2',
        category_id: '2', category_name_en: 'Fashion', delivery_charge: '30',
        shop_name: 'LuxuryZone', shop_id: '4', is_whole_sales: '0',
        product_rating: '4.9', shop_rating: '4.7',
        sku_code: 'SM-CHRNO-001',
        brand_name: 'Chrono',
        highlights: JSON.stringify(['Swiss Quartz Movement', 'Sapphire Crystal Glass', '316L Stainless Steel Case', '5ATM Water Resistant', 'Premium Gift Box Included']),
        warranty_info: '2 Year International Warranty',
        return_policy: '14 Days Easy Return',
        total_sold: '74',
      },
      {
        product_name: 'TrekMaster Backpack', product_slug: 'trekmaster-backpack',
        product_details: '<h3>TrekMaster 30L Adventure Backpack</h3><p>Durable 30L adventure backpack with laptop compartment, USB charging port, and water-resistant nylon.</p>',
        product_specification: '<table><tr><td>Capacity</td><td>30 Liters</td></tr><tr><td>Material</td><td>Water-Resistant Nylon</td></tr><tr><td>Laptop</td><td>Up to 15.6"</td></tr><tr><td>Features</td><td>USB Port, Rain Cover</td></tr></table>',
        selling_price: '55', regular_price: '75', discount_rate: '27',
        featured_image: `${IMG_BASE}/images/products/backpack.png`,
        image: `${IMG_BASE}/images/products/backpack.png`,
        stock: '60', product_type: 'retail', parent_category_id: '4',
        category_id: '4', category_name_en: 'Sports', delivery_charge: '40',
        shop_name: 'SportsWorld', shop_id: '5', is_whole_sales: '0',
        product_rating: '4.4', shop_rating: '4.2',
        sku_code: 'SM-TREK-BPK-001',
        brand_name: 'TrekMaster',
        highlights: JSON.stringify(['30L Spacious Capacity', '15.6" Laptop Compartment', 'Built-in USB Charging Port', 'Water-Resistant Nylon', 'Included Rain Cover']),
        warranty_info: '1 Year Warranty',
        return_policy: '7 Days Easy Return',
        total_sold: '198',
      },
      {
        product_name: 'Galaxy S24 (Wholesale)', product_slug: 'galaxy-s24-ws',
        product_details: 'Wholesale bulk order for Galaxy S24. Minimum order: 10 units.',
        selling_price: '950', regular_price: '1100', discount_rate: '14',
        featured_image: `${IMG_BASE}/images/products/smartphone.png`,
        image: `${IMG_BASE}/images/products/smartphone.png`,
        stock: '500', product_type: 'whole_sale', parent_category_id: '1',
        category_id: '1', category_name_en: 'Electronics', delivery_charge: '200',
        shop_name: 'BulkTech Distributors', shop_id: '6', is_whole_sales: '1',
        product_rating: '4.5', shop_rating: '4.4', minimum_order_quantity: '10',
        sku_code: 'SM-GS24-WS-001',
        brand_name: 'Samsung',
        highlights: JSON.stringify(['Bulk Order — Min 10 Units', 'Official Samsung Stock', 'Trade Discount Applied']),
        warranty_info: '1 Year Samsung Warranty',
        return_policy: 'Wholesale Return Policy',
        total_sold: '45',
      },
    ];
    await this.productRepo.save(this.productRepo.create(products as any));
    this.log.log('Seeded: Products (with SKU codes, highlights, warranty info)');
  }

  // ── Product Images ────────────────────────────────────────────────────

  private async seedProductImages() {
    if (await this.imageRepo.count() > 0) return;
    const products = await this.productRepo.find();
    const getId = (slug: string) => products.find(p => p.product_slug === slug)?.product_id || '';

    const images = [
      // Galaxy S24 Ultra — 3 images (using premium variants)
      { product_id: getId('galaxy-s24-ultra'), image_url: `${IMG_BASE}/images/products/s24-titanium-black.png`, sort_order: '0', is_primary: '1' },
      { product_id: getId('galaxy-s24-ultra'), image_url: `${IMG_BASE}/images/products/s24-titanium-silver.png`, sort_order: '1', is_primary: '0' },
      { product_id: getId('galaxy-s24-ultra'), image_url: `${IMG_BASE}/images/products/smartphone.png`, sort_order: '2', is_primary: '0' },
      // ProBook Slim
      { product_id: getId('probook-slim-14'), image_url: `${IMG_BASE}/images/products/laptop.png`, sort_order: '0', is_primary: '1' },
      { product_id: getId('probook-slim-14'), image_url: `${IMG_BASE}/images/products/laptop.png`, sort_order: '1', is_primary: '0' },
      // SoundMax Pro
      { product_id: getId('soundmax-pro'), image_url: `${IMG_BASE}/images/products/headphones.png`, sort_order: '0', is_primary: '1' },
      { product_id: getId('soundmax-pro'), image_url: `${IMG_BASE}/images/products/headphones.png`, sort_order: '1', is_primary: '0' },
      // T-Shirt
      { product_id: getId('urban-classic-tshirt'), image_url: `${IMG_BASE}/images/products/tshirt.png`, sort_order: '0', is_primary: '1' },
      { product_id: getId('urban-classic-tshirt'), image_url: `${IMG_BASE}/images/products/tshirt.png`, sort_order: '1', is_primary: '0' },
      // Sneakers
      { product_id: getId('airstep-sneakers'), image_url: `${IMG_BASE}/images/products/sneakers.png`, sort_order: '0', is_primary: '1' },
      { product_id: getId('airstep-sneakers'), image_url: `${IMG_BASE}/images/products/sneakers.png`, sort_order: '1', is_primary: '0' },
      // Watch
      { product_id: getId('chrono-prestige-watch'), image_url: `${IMG_BASE}/images/products/watch.png`, sort_order: '0', is_primary: '1' },
      { product_id: getId('chrono-prestige-watch'), image_url: `${IMG_BASE}/images/products/watch.png`, sort_order: '1', is_primary: '0' },
      // Backpack
      { product_id: getId('trekmaster-backpack'), image_url: `${IMG_BASE}/images/products/backpack.png`, sort_order: '0', is_primary: '1' },
      { product_id: getId('trekmaster-backpack'), image_url: `${IMG_BASE}/images/products/backpack.png`, sort_order: '1', is_primary: '0' },
    ];
    await this.imageRepo.save(this.imageRepo.create(images));
    this.log.log('Seeded: Product Images (15 images across 7 products)');
  }

  // ── Variants + SKU Combinations ───────────────────────────────────────

  private async seedVariants() {
    if (await this.variantTypeRepo.count() > 0) return;

    const products = await this.productRepo.find();
    const getId = (slug: string) => products.find(p => p.product_slug === slug)?.product_id || '';

    const id1 = getId('galaxy-s24-ultra');
    const id2 = getId('probook-slim-14');
    const id3 = getId('soundmax-pro');
    const id4 = getId('urban-classic-tshirt');
    const id5 = getId('airstep-sneakers');
    const id6 = getId('chrono-prestige-watch');

    if (!id1) return;

    // ─── Product 1: Galaxy S24 Ultra → Color + Storage ──────────────────
    const p1Color = await this.variantTypeRepo.save(this.variantTypeRepo.create({ product_id: id1, type_name: 'Color', sort_order: '0' }));
    const p1Storage = await this.variantTypeRepo.save(this.variantTypeRepo.create({ product_id: id1, type_name: 'Storage', sort_order: '1' }));

    await this.variantOptionRepo.save(this.variantOptionRepo.create([
      { type_id: p1Color.type_id.toString(), product_id: id1, option_value: 'Titanium Black', option_image: `${IMG_BASE}/images/products/s24-titanium-black.png`, color_code: '#2C2C2C', sort_order: '0' },
      { type_id: p1Color.type_id.toString(), product_id: id1, option_value: 'Titanium Silver', option_image: `${IMG_BASE}/images/products/s24-titanium-silver.png`, color_code: '#C0C0C0', sort_order: '1' },
      { type_id: p1Color.type_id.toString(), product_id: id1, option_value: 'Titanium Violet', option_image: `${IMG_BASE}/images/products/smartphone.png`, color_code: '#8B5CF6', sort_order: '2' },
      { type_id: p1Storage.type_id.toString(), product_id: id1, option_value: '256GB', sort_order: '0' },
      { type_id: p1Storage.type_id.toString(), product_id: id1, option_value: '512GB', sort_order: '1' },
      { type_id: p1Storage.type_id.toString(), product_id: id1, option_value: '1TB', sort_order: '2' },
    ]));

    // SKU combos for Galaxy S24 Ultra (3 colors × 3 storages = 9, minus 1 disabled)
    await this.skuRepo.save(this.skuRepo.create([
      { product_id: id1, sku_code: 'SM-GS24U-BLK-256', price: '1299', stock: '40', is_active: '1', combination: JSON.stringify({ Color: 'Titanium Black', Storage: '256GB' }) },
      { product_id: id1, sku_code: 'SM-GS24U-BLK-512', price: '1599', stock: '20', is_active: '1', combination: JSON.stringify({ Color: 'Titanium Black', Storage: '512GB' }) },
      { product_id: id1, sku_code: 'SM-GS24U-BLK-1TB', price: '1999', stock: '10', is_active: '1', combination: JSON.stringify({ Color: 'Titanium Black', Storage: '1TB' }) },
      { product_id: id1, sku_code: 'SM-GS24U-SLV-256', price: '1299', stock: '35', is_active: '1', combination: JSON.stringify({ Color: 'Titanium Silver', Storage: '256GB' }) },
      { product_id: id1, sku_code: 'SM-GS24U-SLV-512', price: '1599', stock: '15', is_active: '1', combination: JSON.stringify({ Color: 'Titanium Silver', Storage: '512GB' }) },
      { product_id: id1, sku_code: 'SM-GS24U-SLV-1TB', price: '1999', stock: '5', is_active: '1', combination: JSON.stringify({ Color: 'Titanium Silver', Storage: '1TB' }) },
      { product_id: id1, sku_code: 'SM-GS24U-VLT-256', price: '1349', stock: '25', is_active: '1', combination: JSON.stringify({ Color: 'Titanium Violet', Storage: '256GB' }) },
      { product_id: id1, sku_code: 'SM-GS24U-VLT-512', price: '1649', stock: '12', is_active: '1', combination: JSON.stringify({ Color: 'Titanium Violet', Storage: '512GB' }) },
      { product_id: id1, sku_code: 'SM-GS24U-VLT-1TB', price: '1999', stock: '0', is_active: '0', combination: JSON.stringify({ Color: 'Titanium Violet', Storage: '1TB' }) },
    ]));

    // ─── Product 2: ProBook Slim → Color + RAM ──────────────────────────
    const p2Color = await this.variantTypeRepo.save(this.variantTypeRepo.create({ product_id: id2, type_name: 'Color', sort_order: '0' }));
    const p2Ram = await this.variantTypeRepo.save(this.variantTypeRepo.create({ product_id: id2, type_name: 'RAM', sort_order: '1' }));

    await this.variantOptionRepo.save(this.variantOptionRepo.create([
      { type_id: p2Color.type_id.toString(), product_id: id2, option_value: 'Space Gray', option_image: `${IMG_BASE}/images/products/laptop.png`, color_code: '#4A4A4A', sort_order: '0' },
      { type_id: p2Color.type_id.toString(), product_id: id2, option_value: 'Silver', option_image: `${IMG_BASE}/images/products/laptop.png`, color_code: '#D4D4D4', sort_order: '1' },
      { type_id: p2Ram.type_id.toString(), product_id: id2, option_value: '8GB', sort_order: '0' },
      { type_id: p2Ram.type_id.toString(), product_id: id2, option_value: '16GB', sort_order: '1' },
      { type_id: p2Ram.type_id.toString(), product_id: id2, option_value: '32GB', sort_order: '2' },
    ]));

    await this.skuRepo.save(this.skuRepo.create([
      { product_id: id2, sku_code: 'SM-PRBK14-GRY-8G', price: '699', stock: '20', is_active: '1', combination: JSON.stringify({ Color: 'Space Gray', RAM: '8GB' }) },
      { product_id: id2, sku_code: 'SM-PRBK14-GRY-16G', price: '899', stock: '30', is_active: '1', combination: JSON.stringify({ Color: 'Space Gray', RAM: '16GB' }) },
      { product_id: id2, sku_code: 'SM-PRBK14-GRY-32G', price: '1199', stock: '10', is_active: '1', combination: JSON.stringify({ Color: 'Space Gray', RAM: '32GB' }) },
      { product_id: id2, sku_code: 'SM-PRBK14-SLV-8G', price: '699', stock: '15', is_active: '1', combination: JSON.stringify({ Color: 'Silver', RAM: '8GB' }) },
      { product_id: id2, sku_code: 'SM-PRBK14-SLV-16G', price: '899', stock: '25', is_active: '1', combination: JSON.stringify({ Color: 'Silver', RAM: '16GB' }) },
      { product_id: id2, sku_code: 'SM-PRBK14-SLV-32G', price: '1199', stock: '8', is_active: '1', combination: JSON.stringify({ Color: 'Silver', RAM: '32GB' }) },
    ]));

    // ─── Product 3: SoundMax Pro → Color only ───────────────────────────
    const p3Color = await this.variantTypeRepo.save(this.variantTypeRepo.create({ product_id: id3, type_name: 'Color', sort_order: '0' }));

    await this.variantOptionRepo.save(this.variantOptionRepo.create([
      { type_id: p3Color.type_id.toString(), product_id: id3, option_value: 'Midnight Black', option_image: `${IMG_BASE}/images/products/headphones.png`, color_code: '#1A1A1A', sort_order: '0' },
      { type_id: p3Color.type_id.toString(), product_id: id3, option_value: 'Cloud White', option_image: `${IMG_BASE}/images/products/headphones.png`, color_code: '#F5F5F5', sort_order: '1' },
      { type_id: p3Color.type_id.toString(), product_id: id3, option_value: 'Ocean Blue', option_image: `${IMG_BASE}/images/products/headphones.png`, color_code: '#1E40AF', sort_order: '2' },
    ]));

    await this.skuRepo.save(this.skuRepo.create([
      { product_id: id3, sku_code: 'SM-SNDMX-BLK', price: '149', stock: '50', is_active: '1', combination: JSON.stringify({ Color: 'Midnight Black' }) },
      { product_id: id3, sku_code: 'SM-SNDMX-WHT', price: '149', stock: '40', is_active: '1', combination: JSON.stringify({ Color: 'Cloud White' }) },
      { product_id: id3, sku_code: 'SM-SNDMX-BLU', price: '159', stock: '30', is_active: '1', combination: JSON.stringify({ Color: 'Ocean Blue' }) },
    ]));

    // ─── Product 4: Urban Classic T-Shirt → Color + Size ────────────────
    const p4Color = await this.variantTypeRepo.save(this.variantTypeRepo.create({ product_id: id4, type_name: 'Color', sort_order: '0' }));
    const p4Size = await this.variantTypeRepo.save(this.variantTypeRepo.create({ product_id: id4, type_name: 'Size', sort_order: '1' }));

    await this.variantOptionRepo.save(this.variantOptionRepo.create([
      { type_id: p4Color.type_id.toString(), product_id: id4, option_value: 'Black', option_image: `${IMG_BASE}/images/products/tshirt.png`, color_code: '#000000', sort_order: '0' },
      { type_id: p4Color.type_id.toString(), product_id: id4, option_value: 'White', option_image: `${IMG_BASE}/images/products/tshirt.png`, color_code: '#FFFFFF', sort_order: '1' },
      { type_id: p4Color.type_id.toString(), product_id: id4, option_value: 'Navy', option_image: `${IMG_BASE}/images/products/tshirt.png`, color_code: '#1E3A5F', sort_order: '2' },
      { type_id: p4Color.type_id.toString(), product_id: id4, option_value: 'Red', option_image: `${IMG_BASE}/images/products/tshirt.png`, color_code: '#DC2626', sort_order: '3' },
      { type_id: p4Color.type_id.toString(), product_id: id4, option_value: 'Olive', option_image: `${IMG_BASE}/images/products/tshirt.png`, color_code: '#556B2F', sort_order: '4' },
      { type_id: p4Size.type_id.toString(), product_id: id4, option_value: 'S', sort_order: '0' },
      { type_id: p4Size.type_id.toString(), product_id: id4, option_value: 'M', sort_order: '1' },
      { type_id: p4Size.type_id.toString(), product_id: id4, option_value: 'L', sort_order: '2' },
      { type_id: p4Size.type_id.toString(), product_id: id4, option_value: 'XL', sort_order: '3' },
      { type_id: p4Size.type_id.toString(), product_id: id4, option_value: '2XL', sort_order: '4' },
    ]));

    // T-Shirt: same price for all combos, just different stock
    const tshirtColors = ['Black', 'White', 'Navy', 'Red', 'Olive'];
    const tshirtSizes = ['S', 'M', 'L', 'XL', '2XL'];
    const tshirtSkus: any[] = [];
    for (const color of tshirtColors) {
      for (const size of tshirtSizes) {
        const abbr = color.substring(0, 3).toUpperCase();
        tshirtSkus.push({
          product_id: id4,
          sku_code: `SM-URBN-TS-${abbr}-${size}`,
          price: '25',
          stock: String(Math.floor(Math.random() * 30) + 5),
          is_active: '1',
          combination: JSON.stringify({ Color: color, Size: size }),
        });
      }
    }
    await this.skuRepo.save(this.skuRepo.create(tshirtSkus));

    // ─── Product 5: AirStep Sneakers → Color + Size ─────────────────────
    const p5Color = await this.variantTypeRepo.save(this.variantTypeRepo.create({ product_id: id5, type_name: 'Color', sort_order: '0' }));
    const p5Size = await this.variantTypeRepo.save(this.variantTypeRepo.create({ product_id: id5, type_name: 'Size', sort_order: '1' }));

    await this.variantOptionRepo.save(this.variantOptionRepo.create([
      { type_id: p5Color.type_id.toString(), product_id: id5, option_value: 'White', option_image: `${IMG_BASE}/images/products/sneakers.png`, color_code: '#F8F8F8', sort_order: '0' },
      { type_id: p5Color.type_id.toString(), product_id: id5, option_value: 'Black', option_image: `${IMG_BASE}/images/products/sneakers.png`, color_code: '#1A1A1A', sort_order: '1' },
      { type_id: p5Color.type_id.toString(), product_id: id5, option_value: 'Gray', option_image: `${IMG_BASE}/images/products/sneakers.png`, color_code: '#808080', sort_order: '2' },
      { type_id: p5Size.type_id.toString(), product_id: id5, option_value: '7', sort_order: '0' },
      { type_id: p5Size.type_id.toString(), product_id: id5, option_value: '8', sort_order: '1' },
      { type_id: p5Size.type_id.toString(), product_id: id5, option_value: '9', sort_order: '2' },
      { type_id: p5Size.type_id.toString(), product_id: id5, option_value: '10', sort_order: '3' },
      { type_id: p5Size.type_id.toString(), product_id: id5, option_value: '11', sort_order: '4' },
    ]));

    const sneakerColors = ['White', 'Black', 'Gray'];
    const sneakerSizes = ['7', '8', '9', '10', '11'];
    const sneakerSkus: any[] = [];
    for (const color of sneakerColors) {
      for (const size of sneakerSizes) {
        const abbr = color.substring(0, 3).toUpperCase();
        sneakerSkus.push({
          product_id: id5,
          sku_code: `SM-AIRSTP-${abbr}-${size}`,
          price: '65',
          stock: String(Math.floor(Math.random() * 20) + 3),
          is_active: '1',
          combination: JSON.stringify({ Color: color, Size: size }),
        });
      }
    }
    await this.skuRepo.save(this.skuRepo.create(sneakerSkus));

    // ─── Product 6: Chrono Watch → Color + Band ─────────────────────────
    const p6Color = await this.variantTypeRepo.save(this.variantTypeRepo.create({ product_id: id6, type_name: 'Color', sort_order: '0' }));
    const p6Band = await this.variantTypeRepo.save(this.variantTypeRepo.create({ product_id: id6, type_name: 'Band', sort_order: '1' }));

    await this.variantOptionRepo.save(this.variantOptionRepo.create([
      { type_id: p6Color.type_id.toString(), product_id: id6, option_value: 'Silver', option_image: `${IMG_BASE}/images/products/watch.png`, color_code: '#C0C0C0', sort_order: '0' },
      { type_id: p6Color.type_id.toString(), product_id: id6, option_value: 'Gold', option_image: `${IMG_BASE}/images/products/watch.png`, color_code: '#DAA520', sort_order: '1' },
      { type_id: p6Color.type_id.toString(), product_id: id6, option_value: 'Rose Gold', option_image: `${IMG_BASE}/images/products/watch.png`, color_code: '#B76E79', sort_order: '2' },
      { type_id: p6Band.type_id.toString(), product_id: id6, option_value: 'Leather', sort_order: '0' },
      { type_id: p6Band.type_id.toString(), product_id: id6, option_value: 'Steel', sort_order: '1' },
    ]));

    await this.skuRepo.save(this.skuRepo.create([
      { product_id: id6, sku_code: 'SM-CHRNO-SLV-LTH', price: '199', stock: '15', is_active: '1', combination: JSON.stringify({ Color: 'Silver', Band: 'Leather' }) },
      { product_id: id6, sku_code: 'SM-CHRNO-SLV-STL', price: '249', stock: '10', is_active: '1', combination: JSON.stringify({ Color: 'Silver', Band: 'Steel' }) },
      { product_id: id6, sku_code: 'SM-CHRNO-GLD-LTH', price: '219', stock: '12', is_active: '1', combination: JSON.stringify({ Color: 'Gold', Band: 'Leather' }) },
      { product_id: id6, sku_code: 'SM-CHRNO-GLD-STL', price: '269', stock: '8', is_active: '1', combination: JSON.stringify({ Color: 'Gold', Band: 'Steel' }) },
      { product_id: id6, sku_code: 'SM-CHRNO-RSG-LTH', price: '229', stock: '10', is_active: '1', combination: JSON.stringify({ Color: 'Rose Gold', Band: 'Leather' }) },
      { product_id: id6, sku_code: 'SM-CHRNO-RSG-STL', price: '279', stock: '5', is_active: '1', combination: JSON.stringify({ Color: 'Rose Gold', Band: 'Steel' }) },
    ]));

    // ─── Product 7: TrekMaster Backpack → NO VARIANTS ───────────────────
    // (No variant types/options/skus — uses product's own sku_code, price, stock)

    this.log.log('Seeded: Variant Types, Options & SKU Combinations');
  }

  // ── Customers, Notifications, Vouchers, Reviews ───────────────────────

  private async seedCustomers() {
    if (await this.customerRepo.count() > 0) return;
    await this.customerRepo.save(this.customerRepo.create([
      {
        customer_name: 'Demo User',
        customer_phone: '01700000000',
        customer_email: 'demo@shopperzmart.com',
        customer_password: '12345678', // plain text for demo
        is_active: '1',
        access_token: 'demo-static-token-001',
        auth_provider: 'phone',
      },
    ]));
    this.log.log('Seeded: Demo Customer (phone: 01700000000 / pass: 12345678)');
  }

  private async seedNotifications() {
    if (await this.notifRepo.count() > 0) return;
    await this.notifRepo.save(this.notifRepo.create([
      { customer_id: '1', title: 'Welcome to Shopperz Mart!', message: 'Your account is ready. Start shopping now!', is_read: '0' },
      { customer_id: '1', title: 'Summer Sale Started!', message: 'Enjoy up to 70% off on selected items.', is_read: '0' },
    ]));
    this.log.log('Seeded: Notifications');
  }

  private async seedVouchers() {
    if (await this.voucherRepo.count() > 0) return;
    await this.voucherRepo.save(this.voucherRepo.create([
      { voucher_code: 'WELCOME10', voucher_title: 'Welcome Discount', discount_percent: '10', discount_amount: '0', is_active: '1' },
      { voucher_code: 'SAVE50', voucher_title: 'Save 50 BDT', discount_percent: '0', discount_amount: '50', is_active: '1' },
    ]));
    this.log.log('Seeded: Vouchers');
  }

  private async seedReviews() {
    if (await this.reviewRepo.count() > 0) return;
    await this.reviewRepo.save(this.reviewRepo.create([
      // Galaxy S24 Ultra (product_id = 1)
      {
        product_id: '1', customer_id: '1', customer_name: 'Demo User',
        rating: 5, title: 'Best smartphone ever!',
        comment: 'The S24 Ultra is an absolute beast. The AI features are mind-blowing and the 200MP camera takes stunning photos even in low light. Battery easily lasts a full day with heavy usage.',
        verified_purchase: '1', helpful_count: 12,
      },
      {
        product_id: '1', customer_id: '0', customer_name: 'Rahim Ahmed',
        rating: 4, title: 'Great phone but pricey',
        comment: 'Excellent performance and build quality. The titanium frame feels premium. Only downside is the price tag, but you get what you pay for.',
        verified_purchase: '1', helpful_count: 8,
      },
      {
        product_id: '1', customer_id: '0', customer_name: 'Fatima Begum',
        rating: 5, title: 'Worth every penny',
        comment: 'Upgraded from S22 and the difference is night and day. S Pen is incredibly responsive and the screen is gorgeous.',
        verified_purchase: '1', helpful_count: 5,
      },
      // ProBook Slim 14" (product_id = 2)
      {
        product_id: '2', customer_id: '1', customer_name: 'Demo User',
        rating: 4, title: 'Solid work laptop',
        comment: 'Perfectly thin and light for commuting. The keyboard is comfortable for long typing sessions. Fan noise could be lower under heavy load.',
        verified_purchase: '1', helpful_count: 3,
      },
      {
        product_id: '2', customer_id: '0', customer_name: 'Karim Hassan',
        rating: 5, title: 'Perfect for professionals',
        comment: 'This laptop handles everything I throw at it — VSCode, Docker, Chrome with 50 tabs. 16GB RAM is the sweet spot.',
        verified_purchase: '0', helpful_count: 7,
      },
      // SoundMax Pro Headphones (product_id = 3)
      {
        product_id: '3', customer_id: '0', customer_name: 'Nusrat Jahan',
        rating: 5, title: 'ANC is incredible',
        comment: 'The noise cancellation on these headphones is absolutely top tier. I use them daily on the bus and cannot hear anything. Sound quality is crisp and balanced.',
        verified_purchase: '1', helpful_count: 15,
      },
      {
        product_id: '3', customer_id: '0', customer_name: 'Arif Khan',
        rating: 3, title: 'Good but could be better',
        comment: 'Sound quality is good for the price but the ear cushions could be more comfortable for extended use. Battery life is impressive though.',
        verified_purchase: '1', helpful_count: 2,
      },
      // Urban Classic T-Shirt (product_id = 4)
      {
        product_id: '4', customer_id: '0', customer_name: 'Tanvir Islam',
        rating: 4, title: 'Great casual wear',
        comment: 'Fabric is super soft and breathable. Fits perfectly true to size. Will definitely order more colors!',
        verified_purchase: '1', helpful_count: 4,
      },
      // AirStep Sneakers (product_id = 5)
      {
        product_id: '5', customer_id: '0', customer_name: 'Sabrina Akter',
        rating: 5, title: 'Most comfortable sneakers',
        comment: 'The memory foam sole makes a huge difference. I walked 10km in these and my feet felt great. Highly recommend for daily use.',
        verified_purchase: '1', helpful_count: 9,
      },
      {
        product_id: '5', customer_id: '1', customer_name: 'Demo User',
        rating: 4, title: 'Lightweight and stylish',
        comment: 'Very comfortable for running and casual wear. The design looks much better in person than in photos.',
        verified_purchase: '1', helpful_count: 6,
      },
      // Chrono Prestige Watch (product_id = 6)
      {
        product_id: '6', customer_id: '0', customer_name: 'Imran Hossain',
        rating: 5, title: 'Stunning timepiece',
        comment: 'Absolutely gorgeous watch. The sapphire crystal is scratch-resistant and the stainless steel feels luxurious. Gets compliments every time I wear it.',
        verified_purchase: '1', helpful_count: 11,
      },
      // TrekMaster Backpack (product_id = 7) — the NO-VARIANT product
      {
        product_id: '7', customer_id: '0', customer_name: 'Anika Rahman',
        rating: 4, title: 'Perfect daily backpack',
        comment: 'Great quality for the price. The USB port is super handy and the laptop compartment fits my 15" perfectly. Rain cover is a nice bonus.',
        verified_purchase: '1', helpful_count: 7,
      },
    ]));
    this.log.log('Seeded: Customer Reviews (12 reviews with helpful_count)');
  }
}

// Trigger backend reload
