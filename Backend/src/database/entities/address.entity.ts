import { Entity, PrimaryColumn, BeforeInsert, Column } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

@Entity('addresses')
export class Address {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  address_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.address_id) {
      this.address_id = generateEntityId('add');
    }
  }

  @Column()
  customer_id: string;

  @Column({ nullable: true })
  recipient_name: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  full_address: string;

  @Column({ nullable: true })
  city_id: string;

  @Column({ nullable: true })
  city_name: string;

  @Column({ nullable: true })
  postal_code: string;

  @Column({ default: 'home' })
  label: string;  // 'home' | 'office' | 'other'

  @Column({ default: '0' })
  is_default: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;
}
