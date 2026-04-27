import CrudPage from '../../components/common/CrudPage';
import { resolveImage } from '../../api/adminApi';

const columns = [
  { key: 'brand_id', label: 'ID' },
  { key: 'brand_image', label: 'Image', render: (v) => v ? <img src={resolveImage(v)} alt="" className="w-8 h-8 rounded object-cover" /> : '—' },
  { key: 'category_name_en', label: 'Name (EN)', render: (v) => <span className="font-medium">{v}</span> },
  { key: 'category_name_bn', label: 'Name (BN)' },
  { key: 'is_active', label: 'Active', render: (v) => <span className={`badge-status ${v==='1'?'badge-active':'badge-inactive'}`}>{v==='1'?'Yes':'No'}</span> },
];

const formFields = [
  { key: 'category_name_en', label: 'Brand Name (English)' },
  { key: 'category_name_bn', label: 'Brand Name (Bangla)' },
  { key: 'brand_image', label: 'Brand Image', type: 'image', folder: 'brands' },
  { key: 'is_active', label: 'Active', type: 'select', default: '1', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }] },
];

export default function BrandList() {
  return <CrudPage title="Brands" subtitle="Manage product brands" endpoint="/brands" idField="brand_id" columns={columns} formFields={formFields} />;
}
