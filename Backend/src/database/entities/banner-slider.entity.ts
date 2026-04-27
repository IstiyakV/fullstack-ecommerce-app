import { Entity, PrimaryColumn, BeforeInsert, Column } from 'typeorm';
import { generateEntityId } from '../../utils/id-generator';

// Maps to Android's FullSliderModel & HalfSliderModel
// Fields: promotional_slider_id, section_id, slider_image, slider_mobile_image,
//         slider_title, slider_sub_title, slider_url, publish_status
@Entity('banner_sliders')
export class BannerSlider {
  @PrimaryColumn({ type: 'varchar', length: 12 })
  promotional_slider_id: string;

  @BeforeInsert()
  generateId() {
    if (!this.promotional_slider_id) {
      this.promotional_slider_id = generateEntityId('ban');
    }
  }

  @Column({ default: '1' })
  section_id: string;

  @Column()
  slider_image: string;

  @Column({ nullable: true })
  slider_mobile_image: string;

  @Column({ nullable: true })
  slider_title: string;

  @Column({ nullable: true })
  slider_sub_title: string;

  @Column({ nullable: true })
  slider_url: string;

  @Column({ default: '1' })
  publish_status: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  created_at: string;

  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  updated_at: string;
}
