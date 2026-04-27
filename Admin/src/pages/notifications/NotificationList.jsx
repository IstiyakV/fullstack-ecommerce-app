import { useState, useEffect } from 'react';
import { FiSend, FiTrash2, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../../api/adminApi';
import toast from 'react-hot-toast';

export default function NotificationList() {
  const [notifs, setNotifs] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customer_id: '', title: '', message: '', broadcast: false });

  const fetchData = () => {
    setLoading(true);
    api.get('/notifications', { params: { page, per_page: 20 } })
      .then(r => { setNotifs(r.data.data || []); setTotal(r.data.total || 0); })
      .finally(() => setLoading(false));
  };

  useEffect(fetchData, [page]);

  const handleSend = async () => {
    const res = await api.post('/notifications', form);
    if (res.data.success) { toast.success(res.data.message); setShowForm(false); setForm({ customer_id:'', title:'', message:'', broadcast:false }); fetchData(); }
    else toast.error(res.data.message);
  };

  const handleDelete = async (id) => {
    await api.delete(`/notifications/${id}`);
    toast.success('Deleted');
    fetchData();
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div>
      <div className="page-header flex items-start justify-between">
        <div><h1>Notifications</h1><p>Send and manage customer notifications</p></div>
        <button className="btn-primary" onClick={() => setShowForm(true)}><FiSend size={16} /> Send New</button>
      </div>

      <div className="data-table-wrapper">
        <div className="table-header"><span className="text-xs text-slate-400">{total} notifications</span></div>
        <table>
          <thead><tr><th>ID</th><th>Customer</th><th>Title</th><th>Message</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">Loading…</td></tr> :
            notifs.length === 0 ? <tr><td colSpan={6} className="text-center py-8 text-slate-400">No notifications</td></tr> :
            notifs.map(n => (
              <tr key={n.notification_id}>
                <td>{n.notification_id}</td>
                <td>{n.customer_id || 'All'}</td>
                <td className="font-medium">{n.title}</td>
                <td className="text-sm text-slate-500 max-w-[200px] truncate">{n.message}</td>
                <td className="text-xs text-slate-400">{new Date(n.created_at).toLocaleDateString()}</td>
                <td><button className="btn-danger" onClick={() => handleDelete(n.notification_id)}><FiTrash2 size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
            <button className="btn-outline" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><FiChevronLeft size={16}/></button>
            <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
            <button className="btn-outline" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}><FiChevronRight size={16}/></button>
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card max-w-lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">Send Notification</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.broadcast} onChange={(e) => setForm({...form, broadcast: e.target.checked, customer_id: ''})} /> <strong>Broadcast to all customers</strong></label>
              {!form.broadcast && <div><label className="form-label">Customer ID</label><input className="form-input" value={form.customer_id} onChange={(e) => setForm({...form, customer_id: e.target.value})} /></div>}
              <div><label className="form-label">Title</label><input className="form-input" value={form.title} onChange={(e) => setForm({...form, title: e.target.value})} /></div>
              <div><label className="form-label">Message</label><textarea className="form-input" rows={3} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} /></div>
            </div>
            <div className="flex gap-2 mt-5">
              <button className="btn-primary flex-1" onClick={handleSend}><FiSend size={14} /> Send</button>
              <button className="btn-outline flex-1" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
