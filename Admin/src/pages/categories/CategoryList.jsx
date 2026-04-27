import CrudPage from '../../components/common/CrudPage';
import { resolveImage } from '../../api/adminApi';

const columns = [
  { key: 'parent_category_id', label: 'ID' },
  { key: 'featured_image', label: 'Image', render: (v) => v ? <img src={resolveImage(v)} alt="" className="w-8 h-8 rounded object-cover" /> : '—' },
  { key: 'parent_category_name_en', label: 'Name (EN)', render: (v) => <span className="font-medium">{v}</span> },
  { key: 'parent_category_name_bn', label: 'Name (BN)' },
  { key: 'is_active', label: 'Active', render: (v) => <span className={`badge-status ${v==='1'?'badge-active':'badge-inactive'}`}>{v==='1'?'Yes':'No'}</span> },
];

const formFields = [
  { key: 'parent_category_name_en', label: 'Category Name (English)' },
  { key: 'parent_category_name_bn', label: 'Category Name (Bangla)' },
  { key: 'featured_image', label: 'Category Image', type: 'image', folder: 'categories' },
  { key: 'is_active', label: 'Active', type: 'select', default: '1', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }] },
];

export default function CategoryList() {
  return <CrudPage title="Categories" subtitle="Manage product categories" endpoint="/categories" idField="parent_category_id" columns={columns} formFields={formFields} />;
}
