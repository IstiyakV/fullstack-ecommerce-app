import { Entity, PrimaryColumn, Column, BeforeInsert } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

@Entity('orders')
export class Order {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  order_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.order_id) {
      this.order_id = generateEntityId('ord');
    }
  }

  @Column()
  customer_id: string;

  @Column({ nullable: true })
  product_details: string; // JSON serialized order items

  @Column({ nullable: true })
  total_amount: string;

  @Column({ nullable: true })
  shipping_fee: string;

  @Column({ nullable: true })
  discount_amount: string;

  @Column({ nullable: true })
  coupon_code: string;

  @Column({ nullable: true })
  address_id: string;

  @Column({ nullable: true })
  shipping_address: string; // JSON: full address snapshot

  @Column({ nullable: true })
  shipping_method: string; // 'standard' | 'express'

  @Column({ nullable: true })
  payment_method: string; // 'stripe' | 'cod' | 'bkash'

  @Column({ nullable: true })
  payment_status: string; // 'pending' | 'paid' | 'failed' | 'refunded'

  @Column({ nullable: true })
  stripe_payment_intent_id: string;

  @Column({ default: 'pending' })
  order_status: string; // 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

  @Column({ nullable: true })
  estimated_delivery: string;

  @Column({ nullable: true })
  tracking_number: string;

  @Column({ nullable: true })
  tracking_url: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;
}
