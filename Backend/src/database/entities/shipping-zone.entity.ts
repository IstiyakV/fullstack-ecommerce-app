import { Entity, PrimaryColumn, BeforeInsert, Column } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

@Entity('shipping_zones')
export class ShippingZone {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  zone_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.zone_id) {
      this.zone_id = generateEntityId('shi');
    }
  }

  @Column()
  zone_name: string;

  @Column({ default: '1' })
  has_standard: string;

  @Column({ default: '60' })
  standard_fee: string;

  @Column({ default: '3' })
  standard_min_days: string;

  @Column({ default: '5' })
  standard_max_days: string;

  @Column({ default: '0' })
  has_express: string;

  @Column({ default: '120' })
  express_fee: string;

  @Column({ default: '1' })
  express_min_days: string;

  @Column({ default: '2' })
  express_max_days: string;

  @Column({ default: '1' })
  is_active: string;
}
