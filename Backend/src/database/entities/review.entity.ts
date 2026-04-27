import { Entity, PrimaryColumn, BeforeInsert, Column, CreateDateColumn } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

@Entity('reviews')
export class Review {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  review_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.review_id) {
      this.review_id = generateEntityId('rev');
    }
  }

  @Column()
  product_id: string;

  @Column()
  customer_id: string;

  @Column()
  customer_name: string;

  @Column({ type: 'int', default: 5 })
  rating: number;

  @Column({ default: '' })
  title: string;

  @Column({ type: 'text', default: '' })
  comment: string;

  @Column({ default: '0' })
  verified_purchase: string;

  @Column({ type: 'int', default: 0 })
  helpful_count: number;

  @CreateDateColumn()
  created_at: Date;
}
