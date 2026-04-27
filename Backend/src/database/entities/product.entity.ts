import { Entity, PrimaryColumn, Column, BeforeInsert } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

// Maps to Android's ProductModel — exact field names to match Gson deserialization
@Entity('products')
export class Product {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  product_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.product_id) {
      this.product_id = generateEntityId('prd');
    }
  }

  @Column()
  product_name: string;

  @Column({ nullable: true })
  product_slug: string;

  @Column({ nullable: true })
  product_details: string;

  @Column({ nullable: true })
  product_specification: string;

  @Column({ default: '10' })
  stock: string;

  @Column({ nullable: true })
  regular_price: string;

  @Column()
  selling_price: string;

  @Column({ nullable: true })
  discount_rate: string;

  @Column({ default: 'in_stock' })
  stock_status: string;

  @Column({ nullable: true })
  featured_image: string;

  @Column({ nullable: true })
  image: string;

  @Column({ default: '1' })
  is_featured: string;

  @Column({ default: 'retail' })
  product_type: string;  // 'retail' or 'whole_sale'

  @Column({ default: '1' })
  publish_status: string;

  @Column({ default: '1' })
  minimum_order_quantity: string;

  @Column({ nullable: true })
  parent_category_id: string;

  @Column({ nullable: true })
  category_id: string;

  @Column({ nullable: true })
  category_name_en: string;

  @Column({ nullable: true })
  category_name_bn: string;

  @Column({ nullable: true })
  category_image: string;

  @Column({ default: '1' })
  shop_id: string;

  @Column({ default: 'Shopperz Mart Store' })
  shop_name: string;

  @Column({ default: '01700000000' })
  shop_phone: string;

  @Column({ default: 'store@shopperzmart.com' })
  shop_email: string;

  @Column({ default: '50' })
  delivery_charge: string;

  @Column({ default: '1' })
  is_active: string;

  @Column({ default: '0' })
  is_whole_sales: string;

  @Column({ default: '4.5' })
  product_rating: string;

  @Column({ default: '4.2' })
  shop_rating: string;

  @Column({ nullable: true })
  brand_id: string;

  @Column({ nullable: true })
  sku_code: string;

  @Column({ type: 'text', nullable: true })
  highlights: string;  // JSON array: ["200MP Camera", "Titanium Build"]

  @Column({ nullable: true })
  warranty_info: string;  // "1 Year Official Warranty"

  @Column({ nullable: true })
  return_policy: string;  // "7 Days Easy Return"

  @Column({ default: '0' })
  total_sold: string;

  @Column({ nullable: true })
  brand_name: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;
}
