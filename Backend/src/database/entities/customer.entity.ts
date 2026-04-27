import { Entity, PrimaryColumn, Column, BeforeInsert } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

// Maps to Android's CustomerModel
@Entity('customers')
export class Customer {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  customer_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.customer_id) {
      this.customer_id = generateEntityId('cus');
    }
  }

  @Column()
  customer_name: string;

  @Column({ unique: true })
  customer_phone: string;

  @Column({ nullable: true })
  customer_email: string;

  @Column()
  customer_password: string;

  @Column({ default: '1' })
  is_active: string;

  @Column({ default: '0' })
  is_newsletter_enable: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  access_token: string;

  @Column({ default: 'phone' })
  auth_provider: string;  // 'phone' | 'google'

  @Column({ nullable: true })
  google_id: string;

  @Column({ nullable: true })
  fcm_token: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;
}
