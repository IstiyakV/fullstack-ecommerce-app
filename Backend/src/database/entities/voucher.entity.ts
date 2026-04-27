import { Entity, PrimaryColumn, BeforeInsert, Column } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

// Maps to Android's VouchersModel
@Entity('vouchers')
export class Voucher {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  voucher_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.voucher_id) {
      this.voucher_id = generateEntityId('vou');
    }
  }

  @Column()
  voucher_code: string;

  @Column({ nullable: true })
  voucher_title: string;

  @Column({ default: '0' })
  discount_amount: string;

  @Column({ default: '0' })
  discount_percent: string;

  @Column({ default: '1' })
  is_active: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  expiry_date: string;
}
