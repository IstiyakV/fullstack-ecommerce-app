import { Entity, PrimaryColumn, BeforeInsert, Column } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

@Entity('payment_gateways')
export class PaymentGateway {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  gateway_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.gateway_id) {
      this.gateway_id = generateEntityId('pay');
    }
  }

  @Column()
  gateway_name: string;

  @Column()
  display_name: string;

  @Column({ nullable: true })
  icon_url: string;

  @Column({ default: '1' })
  is_active: string;

  @Column({ default: '1' })
  sort_order: string;

  @Column({ nullable: true })
  config_json: string;

  @Column({ default: 'online' })
  payment_type: string;  // 'online' | 'offline'
}
