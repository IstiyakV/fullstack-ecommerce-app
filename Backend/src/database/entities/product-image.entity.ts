import { Entity, PrimaryColumn, BeforeInsert, Column } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

@Entity('product_images')
export class ProductImage {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  image_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.image_id) {
      this.image_id = generateEntityId('pro');
    }
  }

  @Column()
  product_id: string;

  @Column()
  image_url: string;

  @Column({ default: '0' })
  sort_order: string;

  @Column({ default: '0' })
  is_primary: string;
}
