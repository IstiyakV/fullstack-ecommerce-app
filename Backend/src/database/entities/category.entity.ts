import { Entity, PrimaryColumn, BeforeInsert, Column, OneToMany } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

// Maps to Android's CategoriesModel & TopCategoriesModel
// Fields: parent_category_id, parent_category_name_en, parent_category_name_bn,
//         featured_image, is_active, created_at, updated_at
@Entity('categories')
export class Category {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  parent_category_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.parent_category_id) {
      this.parent_category_id = generateEntityId('cat');
    }
  }

  @Column()
  parent_category_name_en: string;

  @Column({ nullable: true })
  parent_category_name_bn: string;

  @Column({ nullable: true })
  featured_image: string;

  @Column({ default: '1' })
  is_active: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;
}
