import CrudPage from '../../components/common/CrudPage';

const columns = [
  { key: 'review_id', label: 'ID' },
  { key: 'product_id', label: 'Product' },
  { key: 'customer_name', label: 'Customer', render: (v) => <span className="font-medium">{v}</span> },
  { key: 'rating', label: 'Rating', render: (v) => <span className="text-amber-500 font-semibold">{'★'.repeat(v)}{'☆'.repeat(5-v)}</span> },
  { key: 'title', label: 'Title' },
  { key: 'comment', label: 'Comment', render: (v) => <span className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">{v}</span> },
  { key: 'verified_purchase', label: 'Verified', render: (v) => <span className={`badge-status ${v==='1'?'badge-active':'badge-inactive'}`}>{v==='1'?'Yes':'No'}</span> },
  { key: 'created_at', label: 'Date', render: (v) => <span className="text-xs text-slate-500">{new Date(v).toLocaleDateString()}</span> },
];

export default function ReviewList() {
  return (
    <CrudPage
      title="Reviews"
      subtitle="Moderate customer reviews"
      endpoint="/reviews"
      idField="review_id"
      columns={columns}
      noCreate
      noEdit
      paginated
    />
  );
}
