import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../api/adminApi';

export default function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api.get('/orders', { params: { page, per_page: 20, status, search } })
      .then(r => { setOrders(r.data.data || []); setTotal(r.data.total || 0); })
      .finally(() => setLoading(false));
  }, [page, status, search]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="page-header"><h1>Orders</h1><p>Manage and track all customer orders</p></div>
      <div className="data-table-wrapper">
        <div className="table-header">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="search-wrapper w-60">
              <FiSearch className="text-slate-400" />
              <input placeholder="Search order…" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
            </div>
            <select className="form-select max-w-[200px]" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
              <option value="">All Statuses</option>
              {[
                { v: 'placed', l: 'Placed' },
                { v: 'confirmed', l: 'Confirmed' },
                { v: 'preparing', l: 'Preparing' },
                { v: 'packed', l: 'Packed' },
                { v: 'in_transit', l: 'In Transit' },
                { v: 'delivery_assigned', l: 'Delivery Assigned' },
                { v: 'out_for_delivery', l: 'Out For Delivery' },
                { v: 'delivered', l: 'Delivered' },
                { v: 'delivery_failed', l: 'Delivery Failed' },
                { v: 'cancelled', l: 'Cancelled' },
              ].map(s => (
                <option key={s.v} value={s.v}>{s.l}</option>
              ))}
            </select>
          </div>
          <span className="text-xs text-slate-400">{total} orders</span>
        </div>
        <div className="overflow-x-auto">
          <table>
            <thead><tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th className="w-[1%] whitespace-nowrap">Actions</th></tr></thead>
            <tbody>
              {loading ? (<tr><td colSpan={7} className="text-center py-8 text-slate-400">Loading…</td></tr>) :
              orders.length === 0 ? (<tr><td colSpan={7} className="text-center py-8 text-slate-400">No orders found</td></tr>) :
              orders.map(o => (
                <tr key={o.order_id} className="cursor-pointer" onClick={() => navigate(`/orders/${o.order_id}`)}>
                  <td className="font-semibold text-indigo-600">#{o.order_id}</td>
                  <td><div className="font-medium">{o.customer_name}</div><div className="text-xs text-slate-400">{o.customer_phone}</div></td>
                  <td className="font-semibold">৳{o.total_amount}</td>
                  <td><span className={`badge-status badge-${o.payment_status || 'pending'}`}>{o.payment_method}</span></td>
                  <td><span className={`badge-status badge-${o.order_status}`}>{o.order_status}</span></td>
                  <td className="text-xs text-slate-500">{new Date(o.created_at).toLocaleDateString()}</td>
                  <td className="whitespace-nowrap" onClick={e => e.stopPropagation()}>
                    <Link to={`/orders/${o.order_id}`} className="table-action-btn edit" title="View Order"><FiEye size={15} /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <button className="btn-outline" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><FiChevronLeft size={16}/></button>
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <button className="btn-outline" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}><FiChevronRight size={16}/></button>
          </div>
        )}
      </div>
    </div>
  );
}
