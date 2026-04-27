import { Entity, PrimaryColumn, BeforeInsert, Column } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

// Maps to Android's BrandsModel
// Fields: brand_id, brand_image, category_name_en, category_name_bn
@Entity('brands')
export class Brand {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  brand_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.brand_id) {
      this.brand_id = generateEntityId('bra');
    }
  }

  @Column({ nullable: true })
  brand_image: string;

  @Column({ nullable: true })
  category_name_en: string;

  @Column({ nullable: true })
  category_name_bn: string;

  @Column({ default: '1' })
  is_active: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;
}
