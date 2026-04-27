import { Entity, PrimaryColumn, BeforeInsert, Column } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

@Entity('notifications')
export class Notification {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  notification_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.notification_id) {
      this.notification_id = generateEntityId('not');
    }
  }

  @Column({ nullable: true })
  customer_id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  message: string;

  @Column({ default: '0' })
  is_read: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;
}
