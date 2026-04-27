import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const STATUS_COLORS = {
  'pending': 'badge-warning',
  'confirmed': 'badge-primary',
  'processing': 'badge-primary',
  'picked': 'badge-primary',
  'shipped': 'badge-primary',
  'delivered': 'badge-success',
  'cancelled': 'badge-danger',
  'returned': 'badge-danger',
  'refunded': 'badge-neutral',
};

export default function OrderHistory() {
  const { user, token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.post('/get-orders', { user_key: user?.customer_id || user?.id, access_token: token })
      .then(r => setOrders(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="account-panel">
      <h2>My Orders</h2>

      {loading ? (
        <div className="flex flex-col gap-3 mt-4">
          {[1,2,3].map(i => <div key={i} className="skeleton" style={{ height: '80px' }} />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state mt-4" style={{ padding: '40px' }}>
          <FiPackage size={40} color="var(--sm-text-muted)" />
          <h3 className="mt-2">No orders yet</h3>
          <p className="text-muted">Start shopping and your orders will appear here.</p>
          <Link to="/products" className="btn btn-primary btn-sm mt-4">Browse Products</Link>
        </div>
      ) : (
        <div className="order-list mt-4">
          {orders.map(order => (
            <div key={order.order_id || order.id} className="order-card">
              <div className="order-card__header">
                <div>
                  <span className="font-semibold">Order #{order.order_id || order.id}</span>
                  <span className="text-xs text-muted" style={{ marginLeft: '12px' }}>
                    {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                  </span>
                </div>
                <span className={`badge ${STATUS_COLORS[order.order_status?.toLowerCase()] || 'badge-neutral'}`}>
                  {order.order_status}
                </span>
              </div>
              <div className="order-card__body">
                <div>
                  <p className="text-sm">{order.total_items || order.items?.length || 0} item(s)</p>
                  <p className="font-semibold text-primary">৳{parseFloat(order.total_amount || 0).toLocaleString()}</p>
                </div>
                <Link to={`/account/orders/${order.order_id || order.id}`} className="btn btn-ghost btn-sm">
                  View Details <FiChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
