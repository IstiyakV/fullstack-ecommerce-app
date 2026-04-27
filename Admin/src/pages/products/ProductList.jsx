import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiLayers } from 'react-icons/fi';
import CrudPage from '../../components/common/CrudPage';
import api, { resolveImage } from '../../api/adminApi';

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

  return (
    <CrudPage
      title="Products"
      subtitle="Manage your product catalog"
      endpoint="/products"
      idField="product_id"
      columns={columns}
      formFields={formFields}
      paginated
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
