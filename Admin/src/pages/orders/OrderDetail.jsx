import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiCheck, FiTruck, FiPlus, FiPackage, FiAlertTriangle } from 'react-icons/fi';
import api, { resolveImage } from '../../api/adminApi';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  placed:             '#3b82f6',
  confirmed:          '#14b8a6',
  preparing:          '#f97316',
  packed:             '#6366f1',
  in_transit:         '#8b5cf6',
  delivery_assigned:  '#0ea5e9',
  out_for_delivery:   '#f59e0b',
  delivery_attempt_1: '#eab308',
  delivery_attempt_2: '#eab308',
  delivery_attempt_3: '#eab308',
  delivered:          '#10b981',
  delivery_failed:    '#ef4444',
  cancelled:          '#ef4444',
  // Legacy
  pending:            '#f59e0b',
  processing:         '#6366f1',
  shipped:            '#a855f7',
  note:               '#94a3b8',
};

const STATUS_LABELS = {
  placed:             'Order Placed',
  confirmed:          'Confirmed',
  preparing:          'Preparing Order',
  packed:             'Packed',
  in_transit:         'In Transit / Hub',
  delivery_assigned:  'Delivery Person Assigned',
  out_for_delivery:   'Out For Delivery',
  delivery_attempt_1: 'Delivery Attempt 1',
  delivery_attempt_2: 'Delivery Attempt 2',
  delivery_attempt_3: 'Delivery Attempt 3',
  delivered:          'Delivered',
  delivery_failed:    'Delivery Failed',
  cancelled:          'Cancelled',
  pending:            'Pending',
  processing:         'Processing',
  shipped:            'Shipped',
  note:               'Note',
};

const NEXT_STATUS = {
  placed:             ['confirmed', 'cancelled'],
  confirmed:          ['preparing', 'cancelled'],
  preparing:          ['packed', 'cancelled'],
  packed:             ['in_transit'],
  in_transit:         ['delivery_assigned'],
  delivery_assigned:  ['out_for_delivery'],
  out_for_delivery:   ['delivered', 'delivery_attempt_1'],
  delivery_attempt_1: ['out_for_delivery', 'delivery_attempt_2', 'delivery_failed'],
  delivery_attempt_2: ['out_for_delivery', 'delivery_attempt_3', 'delivery_failed'],
  delivery_attempt_3: ['delivery_failed'],
  delivered:          [],
  delivery_failed:    [],
  cancelled:          [],
  // Legacy
  pending:            ['confirmed', 'cancelled'],
  processing:         ['packed', 'cancelled'],
  shipped:            ['delivered'],
};

const statusBtnColor = (s) => {
  if (s === 'cancelled' || s === 'delivery_failed') return '#ef4444';
  if (s === 'delivered') return '#10b981';
  return STATUS_COLORS[s] || '#6366f1';
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState('');
  const [trackingUrl, setTrackingUrl] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [customStatus, setCustomStatus] = useState('');
  const [customNote, setCustomNote] = useState('');

  const fetchOrder = () => {
    api.get(`/orders/${id}`).then(r => {
      setOrder(r.data.data);
      setTracking(r.data.data?.tracking_number || '');
      setTrackingUrl(r.data.data?.tracking_url || '');
    }).finally(() => setLoading(false));
  };

  useEffect(fetchOrder, [id]);

  const updateStatus = async (newStatus) => {
    const res = await api.patch(`/orders/${id}/status`, { status: newStatus, note: statusNote || undefined });
    if (res.data.success) { toast.success(res.data.message); setStatusNote(''); fetchOrder(); }
    else toast.error(res.data.message);
  };

  const saveTracking = async () => {
    const res = await api.patch(`/orders/${id}/tracking`, { 
      tracking_number: tracking,
      tracking_url: trackingUrl 
    });
    if (res.data.success) toast.success('Tracking updated');
    else toast.error(res.data.message);
  };

  const addCustomEntry = async () => {
    if (!customStatus && !customNote) return toast.error('Please enter a status or note.');
    const res = await api.post(`/orders/${id}/timeline`, {
      status: customStatus || 'note',
      note: customNote || '',
    });
    if (res.data.success) { toast.success(res.data.message); setCustomStatus(''); setCustomNote(''); fetchOrder(); }
    else toast.error(res.data.message);
  };

  if (loading) return <div className="text-center py-12 text-slate-400">Loading order…</div>;
  if (!order) return <div className="text-red-500">Order not found</div>;

  const addr = order.shipping_address_parsed || {};
  const nextStatuses = NEXT_STATUS[order.order_status] || [];
  const currentLabel = STATUS_LABELS[order.order_status] || order.order_status;
  const currentColor = STATUS_COLORS[order.order_status] || '#94a3b8';

  return (
    <div>
      <Link to="/orders" className="flex items-center gap-1.5 text-sm text-indigo-500 font-medium mb-4 hover:underline"><FiArrowLeft size={14} /> Back to Orders</Link>

      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Order #{order.order_id}</h1>
          <p className="text-sm text-slate-500">Placed on {new Date(order.created_at).toLocaleString()}</p>
        </div>
        <span className="text-sm px-4 py-1.5 rounded-full font-bold text-white" style={{ background: currentColor }}>
          {currentLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Order Status Update */}
        <div className="stat-card lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Update Status</h3>
          {nextStatuses.length > 0 ? (
            <div className="flex flex-wrap gap-2 mb-3">
              {nextStatuses.map(s => (
                <button
                  key={s}
                  className="px-4 py-2 rounded-lg text-sm font-bold text-white transition-all hover:opacity-90 hover:scale-105"
                  style={{ background: statusBtnColor(s) }}
                  onClick={() => updateStatus(s)}
                >
                  {s === 'cancelled' ? '✕ Cancel' : s === 'delivery_failed' ? '✕ Delivery Failed' : `→ ${STATUS_LABELS[s] || s}`}
                </button>
              ))}
            </div>
          ) : <p className="text-sm text-slate-400 mb-3">No further status updates available. Order is <strong>{currentLabel}</strong>.</p>}
          <input className="form-input mt-2" placeholder="Status note (optional)" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} />
        </div>

        {/* Tracking */}
        <div className="stat-card">
          <h3 className="text-sm font-semibold text-slate-700 mb-3"><FiTruck className="inline mr-1" />Tracking</h3>
          <input className="form-input mb-2" placeholder="Tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} />
          <input className="form-input mb-2" placeholder="Tracking URL (e.g. Courier link)" value={trackingUrl} onChange={(e) => setTrackingUrl(e.target.value)} />
          <button className="btn-primary w-full justify-center" onClick={saveTracking}>Save Tracking Info</button>
        </div>
      </div>

      {/* Custom Timeline Entry */}
      <div className="stat-card mb-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3"><FiPlus className="inline mr-1" /> Add Custom Timeline Entry</h3>
        <p className="text-xs text-slate-400 mb-3">Add a custom stage or note to this order's timeline. This won't change the order status.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="form-input" placeholder="Custom status label (e.g. 'Quality Check')" value={customStatus} onChange={(e) => setCustomStatus(e.target.value)} />
          <input className="form-input md:col-span-1" placeholder="Note / description" value={customNote} onChange={(e) => setCustomNote(e.target.value)} />
          <button className="btn-primary justify-center" onClick={addCustomEntry}>
            <FiPlus size={14} className="mr-1" /> Add Entry
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Order Items */}
        <div className="data-table-wrapper lg:col-span-2">
          <div className="table-header"><h3 className="text-sm font-semibold text-slate-700">Order Items</h3></div>
          <table>
            <thead><tr><th>Product</th><th>Price</th><th>Qty</th><th>Subtotal</th></tr></thead>
            <tbody>
              {(order.items||[]).map((item,i) => (
                <tr key={i}>
                  <td className="flex items-center gap-2">
                    {item.image ? (
                      <img src={resolveImage(item.image)} alt="" className="w-10 h-10 rounded object-cover" onError={(e) => { e.target.style.display='none'; }} />
                    ) : (
                      <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center">
                        <FiPackage className="text-slate-400" />
                      </div>
                    )}
                    <div>
                      <span className="font-medium">{item.product_name || `Product #${item.product_id}`}</span>
                      {item.shop_name && <div className="text-xs text-slate-400">{item.shop_name}</div>}
                    </div>
                  </td>
                  <td>৳{item.selling_price || '0'}</td>
                  <td>{item.quantity || '1'}</td>
                  <td className="font-semibold">৳{(parseFloat(item.selling_price || '0') * parseInt(item.quantity || '1')).toFixed(0)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary + Address */}
        <div className="space-y-4">
          <div className="stat-card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Price Breakdown</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span>৳{order.total_amount}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span>৳{order.shipping_fee || '0'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Discount</span><span className="text-green-600">-৳{order.discount_amount || '0'}</span></div>
              {order.coupon_code && <div className="flex justify-between"><span className="text-slate-500">Coupon</span><span className="text-indigo-600">{order.coupon_code}</span></div>}
              <hr className="border-slate-100"/>
              <div className="flex justify-between font-bold text-base"><span>Total</span><span>৳{order.total_amount}</span></div>
            </div>
          </div>
          <div className="stat-card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Shipping Address</h3>
            <div className="text-sm space-y-1">
              <div className="font-medium">{addr.recipient_name || 'N/A'}</div>
              <div className="text-slate-500">{addr.full_address}</div>
              <div className="text-slate-500">{addr.city_name} {addr.postal_code}</div>
              <div className="text-slate-500">📞 {addr.phone}</div>
            </div>
          </div>
          <div className="stat-card">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Payment</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-slate-500">Method</span><span className="font-medium">{order.payment_method}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Status</span><span className="font-medium capitalize">{order.payment_status}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Shipping</span><span className="font-medium capitalize">{order.shipping_method}</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="stat-card">
        <h3 className="text-sm font-semibold text-slate-700 mb-4">Order Timeline</h3>
        {(order.timeline||[]).map((t,i) => {
          const tColor = STATUS_COLORS[t.status] || '#94a3b8';
          const tLabel = STATUS_LABELS[t.status] || t.status.replace(/_/g, ' ');
          return (
            <div key={i} className="timeline-step">
              <div className="timeline-dot" style={{background: tColor}}><FiCheck size={12}/></div>
              <div>
                <div className="font-medium text-sm" style={{ color: tColor }}>{tLabel}</div>
                <div className="text-xs text-slate-500">{t.note}</div>
                <div className="text-xs text-slate-400 mt-0.5">{new Date(t.timestamp).toLocaleString()}</div>
              </div>
            </div>
          );
        })}
        {(order.timeline||[]).length === 0 && <p className="text-sm text-slate-400">No timeline entries yet.</p>}
      </div>
    </div>
  );
}
