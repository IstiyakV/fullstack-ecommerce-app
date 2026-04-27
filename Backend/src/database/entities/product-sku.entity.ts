import { Entity, PrimaryColumn, BeforeInsert, Column, CreateDateColumn } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

@Entity('product_skus')
export class ProductSku {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  sku_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.sku_id) {
      this.sku_id = generateEntityId('pro');
    }
  }

  @Column()
  product_id: string;

  @Column({ unique: true })
  sku_code: string;        // "SM-GS24U-BLK-256"

  @Column({ nullable: true })
  regular_price: string;

  @Column()
  price: string;           // selling price for this combination

  @Column({ default: '0' })
  stock: string;

  @Column({ default: '1' })
  is_active: string;       // admin can disable impossible combos

  @Column({ type: 'text' })
  combination: string;     // JSON: {"Color":"Titanium Black","Storage":"256GB"}

  @CreateDateColumn()
  created_at: Date;
}
