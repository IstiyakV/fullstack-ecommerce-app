import { Entity, PrimaryColumn, BeforeInsert, Column } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

@Entity('variant_options')
export class VariantOption {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  option_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.option_id) {
      this.option_id = generateEntityId('var');
    }
  }

  @Column()
  type_id: string;       // FK → variant_types

  @Column()
  product_id: string;    // denormalized for easy queries

  @Column()
  option_value: string;  // "Titanium Black", "256GB", "XL"

  @Column({ nullable: true })
  option_image: string;  // image shown when selected (nullable)

  @Column({ nullable: true })
  color_code: string;    // hex color code for swatch (nullable)

  @Column({ default: '0' })
  sort_order: string;

  @Column({ default: '1' })
  is_active: string;

  @Column({ default: '0' })
  is_default: string; // '1' = default selection for this type

  @Column({ type: 'text', nullable: true })
  gallery_images: string; // JSON array of image URLs
}
