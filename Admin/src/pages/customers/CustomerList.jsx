import CrudPage from '../../components/common/CrudPage';

const columns = [
  { key: 'customer_id', label: 'ID' },
  { key: 'customer_name', label: 'Name', render: (v) => <span className="font-medium">{v}</span> },
  { key: 'customer_phone', label: 'Phone' },
  { key: 'customer_email', label: 'Email' },
  { key: 'auth_provider', label: 'Provider', render: (v) => <span className={`badge-status ${v==='google'?'badge-confirmed':'badge-processing'}`}>{v}</span> },
  { key: 'is_active', label: 'Active', render: (v) => <span className={`badge-status ${v==='1'?'badge-active':'badge-inactive'}`}>{v==='1'?'Yes':'No'}</span> },
  { key: 'created_at', label: 'Joined', render: (v) => <span className="text-xs text-slate-500">{new Date(v).toLocaleDateString()}</span> },
];

export default function CustomerList() {
  return (
    <CrudPage
      title="Customers"
      subtitle="View and manage registered customers"
      endpoint="/customers"
      idField="customer_id"
      columns={columns}
      noCreate
      noEdit
      noDelete
      paginated
    />
  );
}
