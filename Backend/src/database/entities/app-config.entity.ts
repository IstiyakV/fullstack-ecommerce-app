import { Entity, PrimaryColumn, BeforeInsert, Column } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

@Entity('app_config')
export class AppConfig {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  config_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.config_id) {
      this.config_id = generateEntityId('app');
    }
  }

  @Column({ unique: true })
  config_key: string;

  @Column()
  config_value: string;

  @Column({ nullable: true })
  description: string;
}
