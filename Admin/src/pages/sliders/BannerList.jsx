import CrudPage from '../../components/common/CrudPage';
import { resolveImage } from '../../api/adminApi';

const columns = [
  { key: 'promotional_slider_id', label: 'ID' },
  { key: 'slider_image', label: 'Image', render: (v) => v ? <img src={resolveImage(v)} alt="" className="w-16 h-8 rounded object-cover" /> : '—' },
  { key: 'slider_title', label: 'Title', render: (v) => <span className="font-medium">{v || '—'}</span> },
  { key: 'section_id', label: 'Section' },
  { key: 'publish_status', label: 'Published', render: (v) => <span className={`badge-status ${v==='1'?'badge-active':'badge-inactive'}`}>{v==='1'?'Yes':'No'}</span> },
];

const formFields = [
  { key: 'slider_image', label: 'Banner Image', type: 'image', folder: 'banners' },
  { key: 'slider_mobile_image', label: 'Mobile Image', type: 'image', folder: 'banners' },
  { key: 'slider_title', label: 'Title' },
  { key: 'slider_sub_title', label: 'Subtitle' },
  { key: 'slider_url', label: 'Link URL' },
  { key: 'section_id', label: 'Section ID', default: '1' },
  { key: 'publish_status', label: 'Published', type: 'select', default: '1', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }] },
];

export default function BannerList() {
  return <CrudPage title="Banners" subtitle="Manage promotional banners" endpoint="/banners" idField="promotional_slider_id" columns={columns} formFields={formFields} />;
}
