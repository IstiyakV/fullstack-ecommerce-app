import CrudPage from '../../components/common/CrudPage';
import { resolveImage } from '../../api/adminApi';

const columns = [
  { key: 'slider_id', label: 'ID' },
  { key: 'slider_image', label: 'Image', render: (v) => v ? <img src={resolveImage(v)} alt="" className="w-16 h-8 rounded object-cover" /> : '—' },
  { key: 'slider_title', label: 'Title', render: (v) => <span className="font-medium">{v || '—'}</span> },
  { key: 'slider_url', label: 'URL', render: (v) => v ? <a href={v} className="text-indigo-500 text-xs" target="_blank" rel="noreferrer">{v.substring(0,30)}…</a> : '—' },
];

const formFields = [
  { key: 'slider_image', label: 'Slider Image', type: 'image', folder: 'sliders' },
  { key: 'slider_title', label: 'Title' },
  { key: 'slider_url', label: 'Link URL' },
];

export default function SliderList() {
  return <CrudPage title="Sliders" subtitle="Manage hero carousel sliders" endpoint="/sliders" idField="slider_id" columns={columns} formFields={formFields} />;
}
