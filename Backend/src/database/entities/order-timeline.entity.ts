import { Entity, PrimaryColumn, BeforeInsert, Column, CreateDateColumn } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

@Entity('order_timeline')
export class OrderTimeline {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  timeline_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.timeline_id) {
      this.timeline_id = generateEntityId('otm');
    }
  }

  @Column()
  order_id: string;

  @Column()
  status: string; // 'placed', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'

  @Column({ default: '' })
  note: string;

  @CreateDateColumn()
  timestamp: Date;
}
