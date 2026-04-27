import { Entity, PrimaryColumn, BeforeInsert, Column } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

@Entity('cities')
export class City {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  city_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.city_id) {
      this.city_id = generateEntityId('cit');
    }
  }

  @Column()
  city_name: string;

  @Column()
  division: string;

  @Column({ nullable: true })
  postal_code: string;

  @Column()
  shipping_zone_id: string;

  @Column({ default: '1' })
  is_active: string;
}
