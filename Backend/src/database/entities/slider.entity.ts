import { Entity, PrimaryColumn, BeforeInsert, Column } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

// Maps to Android's SliderModel: { slider_id, slider_image, slider_title, slider_url }
@Entity('sliders')
export class Slider {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  slider_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.slider_id) {
      this.slider_id = generateEntityId('sli');
    }
  }

  @Column()
  slider_image: string;

  @Column({ nullable: true })
  slider_title: string;

  @Column({ nullable: true })
  slider_url: string;
}
