import CrudPage from '../../components/common/CrudPage';

const columns = [
  { key: 'voucher_id', label: 'ID' },
  { key: 'voucher_code', label: 'Code', render: (v) => <span className="font-mono font-semibold text-indigo-600">{v}</span> },
  { key: 'voucher_title', label: 'Title' },
  { key: 'discount_percent', label: 'Discount %', render: (v) => v !== '0' ? `${v}%` : '—' },
  { key: 'discount_amount', label: 'Discount ৳', render: (v) => v !== '0' ? `৳${v}` : '—' },
  { key: 'is_active', label: 'Active', render: (v) => <span className={`badge-status ${v==='1'?'badge-active':'badge-inactive'}`}>{v==='1'?'Yes':'No'}</span> },
  { key: 'expiry_date', label: 'Expires', render: (v) => <span className="text-xs text-slate-500">{v ? new Date(v).toLocaleDateString() : '—'}</span> },
];

const formFields = [
  { key: 'voucher_code', label: 'Coupon Code' },
  { key: 'voucher_title', label: 'Title' },
  { key: 'discount_percent', label: 'Discount Percent', default: '0' },
  { key: 'discount_amount', label: 'Discount Amount (Fixed)', default: '0' },
  { key: 'is_active', label: 'Active', type: 'select', default: '1', options: [{ value: '1', label: 'Yes' }, { value: '0', label: 'No' }] },
  { key: 'expiry_date', label: 'Expiry Date', type: 'date' },
];

export default function VoucherList() {
  return <CrudPage title="Vouchers" subtitle="Manage discount coupons and vouchers" endpoint="/vouchers" idField="voucher_id" columns={columns} formFields={formFields} />;
}
