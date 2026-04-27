import { Entity, PrimaryColumn, BeforeInsert, Column } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

@Entity('variant_types')
export class VariantType {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  type_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.type_id) {
      this.type_id = generateEntityId('var');
    }
  }

  @Column()
  product_id: string;

  @Column()
  type_name: string;  // "Color", "Size", "Storage", "RAM"

  @Column({ default: '0' })
  sort_order: string;
}
