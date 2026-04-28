import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiLayers, FiDownloadCloud, FiUploadCloud } from 'react-icons/fi';
import CrudPage from '../../components/common/CrudPage';
import api, { resolveImage } from '../../api/adminApi';
import toast from 'react-hot-toast';

const columns = [
  { key: 'product_id', label: 'ID' },
  { key: 'featured_image', label: 'Image', render: (v) => v ? <img src={resolveImage(v)} alt="" className="w-10 h-10 rounded object-cover" /> : '—' },
  { key: 'product_name', label: 'Name', render: (v) => <span className="font-medium">{v}</span> },
  { key: 'sku_code', label: 'SKU', render: (v) => <span className="text-xs font-mono">{v || '—'}</span> },
  { key: 'selling_price', label: 'Price', render: (v) => <span className="font-semibold">৳{v}</span> },
  { key: 'stock', label: 'Stock' },
  { key: 'stock_status', label: 'Status', render: (v) => <span className={`badge-status ${v==='in_stock'?'badge-active':'badge-inactive'}`}>{v}</span> },
  { key: 'category_name_en', label: 'Category' },
  { key: 'brand_name', label: 'Brand' },
  { key: 'is_active', label: 'Active', render: (v) => <span className={`badge-status ${v==='1'?'badge-active':'badge-inactive'}`}>{v==='1'?'Yes':'No'}</span> },
];

export default function ProductList() {
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [brandOptions, setBrandOptions] = useState([]);
  const [backupLoading, setBackupLoading] = useState(false);
  const [restoreLoading, setRestoreLoading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    api.get('/categories').then(r => {
      const cats = (r.data.data || []).map(c => ({
        value: c.parent_category_id?.toString(),
        label: c.parent_category_name_en,
      }));
      setCategoryOptions([{ value: '', label: '— Select Category —' }, ...cats]);
    });
    api.get('/brands').then(r => {
      const brands = (r.data.data || []).map(b => ({
        value: b.brand_id?.toString(),
        label: b.category_name_en,
      }));
      setBrandOptions([{ value: '', label: '— Select Brand —' }, ...brands]);
    });
  }, []);

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const res = await api.get('/products-backup');
      if (res.data.success) {
        const blob = new Blob([JSON.stringify(res.data.data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const date = new Date().toISOString().split('T')[0];
        a.href = url;
        a.download = `shopperz-products-backup-${date}.json`;
        a.click();
        URL.revokeObjectURL(url);
        const s = res.data.data.stats;
        toast.success(`Backup exported: ${s.products} products, ${s.skus} SKUs`);
      } else {
        toast.error('Backup failed');
      }
    } catch (err) {
      toast.error('Failed to create backup');
    }
    setBackupLoading(false);
  };

  const handleRestoreClick = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  const handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Confirm before restore
    const confirmed = window.confirm(
      '⚠️ WARNING: This will replace ALL existing products with the backup data.\n\n' +
      'This action cannot be undone.\n\nAre you sure you want to proceed?'
    );
    if (!confirmed) {
      e.target.value = '';
      return;
    }

    setRestoreLoading(true);
    try {
      const text = await file.text();
      const backup = JSON.parse(text);
      const res = await api.post('/products-restore', backup);
      if (res.data.success) {
        toast.success(res.data.message);
        // Reload page to refresh product list
        setTimeout(() => window.location.reload(), 1000);
      } else {
        toast.error(res.data.message || 'Restore failed');
      }
    } catch (err) {
      toast.error('Invalid backup file or restore failed');
    }
    e.target.value = '';
    setRestoreLoading(false);
  };

  const formFields = [
    { key: 'product_name', label: 'Product Name', required: true },
    { key: 'product_slug', label: 'Slug' },
    { key: 'sku_code', label: 'SKU Code', placeholder: 'e.g. SM-GS24U-001' },
    { key: 'brand_name', label: 'Brand Name', placeholder: 'e.g. Samsung' },
    { key: 'product_details', label: 'Details', type: 'textarea' },
    { key: 'product_specification', label: 'Specification', type: 'textarea' },
    { key: 'highlights', label: 'Highlights (semicolon-separated)', type: 'textarea', placeholder: 'Feature 1; Feature 2; Feature 3' },
    { key: 'regular_price', label: 'Regular Price' },
    { key: 'selling_price', label: 'Selling Price', required: true },
    { key: 'discount_rate', label: 'Discount Rate (%)' },
    { key: 'stock', label: 'Stock', default: '10' },
    { key: 'stock_status', label: 'Stock Status', type: 'select', default: 'in_stock', options: [{ value: 'in_stock', label: 'In Stock' }, { value: 'out_of_stock', label: 'Out of Stock' }] },
    { key: 'featured_image', label: 'Product Image', type: 'image', folder: 'products' },
    { key: 'category_id', label: 'Category', type: 'select', options: categoryOptions },
    { key: 'brand_id', label: 'Brand', type: 'select', options: brandOptions },
    { key: 'warranty_info', label: 'Warranty Info', placeholder: 'e.g. 1 Year Official Warranty' },
    { key: 'return_policy', label: 'Return Policy', placeholder: 'e.g. 7 Days Easy Return' },
    { key: 'total_sold', label: 'Total Sold', default: '0' },
    { key: 'minimum_order_quantity', label: 'Min Order Qty', default: '1' },
    { key: 'product_type', label: 'Type', type: 'select', default: 'retail', options: [{ value: 'retail', label: 'Retail' }, { value: 'whole_sale', label: 'Wholesale' }] },
    { key: 'is_featured', label: 'Featured', type: 'select', default: '1', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }] },
    { key: 'is_active', label: 'Active', type: 'select', default: '1', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }] },
    { key: 'publish_status', label: 'Published', type: 'select', default: '1', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }] },
  ];

  const headerActions = (
    <div className="flex items-center gap-2">
      <button
        onClick={handleBackup}
        disabled={backupLoading}
        className="btn-outline flex items-center gap-1.5 text-xs"
        title="Export all products, variants & SKUs as JSON"
      >
        <FiDownloadCloud size={15} />
        {backupLoading ? 'Exporting…' : 'Backup'}
      </button>
      <button
        onClick={handleRestoreClick}
        disabled={restoreLoading}
        className="btn-outline flex items-center gap-1.5 text-xs"
        style={{ borderColor: '#f59e0b', color: '#f59e0b' }}
        title="Restore products from a backup JSON file"
      >
        <FiUploadCloud size={15} />
        {restoreLoading ? 'Restoring…' : 'Restore'}
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleRestoreFile}
        accept=".json"
        className="hidden"
      />
    </div>
  );

  return (
    <CrudPage
      title="Products"
      subtitle="Manage your product catalog"
      endpoint="/products"
      idField="product_id"
      columns={columns}
      formFields={formFields}
      paginated
      headerActions={headerActions}
      renderExtra={(item) => (
        <Link 
          to={`/products/${item.product_id}/variants`} 
          className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded whitespace-nowrap hover:bg-indigo-100 text-xs font-medium ml-2"
          title="Manage Variants"
        >
          <FiLayers size={14} /> Variants
        </Link>
      )}
    />
  );
}
