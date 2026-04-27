import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { FiDollarSign, FiShoppingCart, FiUsers, FiPackage } from 'react-icons/fi';
import api, { resolveImage } from '../api/adminApi';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

const STATUS_COLORS = {
  pending: '#f59e0b', confirmed: '#3b82f6', processing: '#6366f1',
  shipped: '#a855f7', delivered: '#10b981', cancelled: '#ef4444',
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard').then((r) => { setData(r.data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-slate-400">Loading dashboard…</div></div>;
  if (!data) return <div className="text-red-500">Failed to load dashboard data.</div>;

  const stats = [
    { label: 'Total Revenue', value: `৳${data.total_revenue?.toLocaleString() || '0'}`, icon: FiDollarSign, color: '#10b981', bg: '#d1fae5' },
    { label: 'Total Orders', value: data.total_orders, icon: FiShoppingCart, color: '#6366f1', bg: '#e0e7ff' },
    { label: 'Total Customers', value: data.total_customers, icon: FiUsers, color: '#3b82f6', bg: '#dbeafe' },
    { label: 'Total Products', value: data.total_products, icon: FiPackage, color: '#f59e0b', bg: '#fef3c7' },
  ];

  const revenueChart = {
    labels: data.monthly_revenue?.map(m => m.month) || [],
    datasets: [{
      label: 'Revenue (৳)',
      data: data.monthly_revenue?.map(m => m.revenue) || [],
      borderColor: '#6366f1',
      backgroundColor: 'rgba(99,102,241,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#6366f1',
    }],
  };

  const statusLabels = Object.keys(data.orders_by_status || {});
  const statusChart = {
    labels: statusLabels.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    datasets: [{
      data: statusLabels.map(s => data.orders_by_status[s]),
      backgroundColor: statusLabels.map(s => STATUS_COLORS[s] || '#94a3b8'),
      borderWidth: 0,
    }],
  };

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's an overview of your store.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((s, i) => (
          <div key={i} className="stat-card flex items-center gap-4">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}><s.icon size={24} /></div>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="stat-card lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Revenue (Last 6 Months)</h3>
          <Line data={revenueChart} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true } } }} />
        </div>
        <div className="stat-card">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Orders by Status</h3>
          <Doughnut data={statusChart} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12, font: { size: 11 } } } } }} />
        </div>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="data-table-wrapper">
          <div className="table-header">
            <h3 className="text-sm font-semibold text-slate-700">Recent Orders</h3>
            <Link to="/orders" className="text-sm text-indigo-500 font-medium hover:underline">View All</Link>
          </div>
          <table>
            <thead><tr><th>Order ID</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {(data.recent_orders || []).map((o, i) => (
                <tr key={i}>
                  <td><Link to={`/orders/${o.order_id}`} className="text-indigo-500 font-medium">#{o.order_id}</Link></td>
                  <td className="font-semibold">৳{o.total_amount}</td>
                  <td><span className={`badge-status badge-${o.order_status}`}>{o.order_status}</span></td>
                  <td className="text-slate-500 text-xs">{new Date(o.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="data-table-wrapper">
          <div className="table-header">
            <h3 className="text-sm font-semibold text-slate-700">Top Selling Products</h3>
          </div>
          <table>
            <thead><tr><th>Product</th><th>Units Sold</th></tr></thead>
            <tbody>
              {(data.top_products || []).map((p, i) => (
                <tr key={i}>
                  <td className="flex items-center gap-2">
                    {p.image && <img src={resolveImage(p.image)} alt="" className="w-8 h-8 rounded object-cover" />}
                    <span className="font-medium">{p.name}</span>
                  </td>
                  <td><span className="font-semibold text-indigo-600">{p.count}</span></td>
                </tr>
              ))}
              {(!data.top_products || data.top_products.length === 0) && (
                <tr><td colSpan={2} className="text-center text-slate-400 py-6">No sales data yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
