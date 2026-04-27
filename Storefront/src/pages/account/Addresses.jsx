import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import axios from 'axios';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

const configClient = axios.create({
  baseURL: '/api/v1/config',
  headers: { 'Content-Type': 'application/json' },
});

export default function Addresses() {
  const { user, token } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    recipient_name: '', phone: '', full_address: '', city_id: '', postal_code: '', label: 'Home',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAddresses();
    configClient.post('/cities').then(r => setCities(r.data.data || [])).catch(() => {});
  }, []);

  const loadAddresses = () => {
    setLoading(true);
    client.post('/get-address', { user_key: user?.customer_id || user?.id, access_token: token })
      .then(r => setAddresses(r.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.recipient_name || !form.phone || !form.full_address || !form.city_id) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    try {
      const city = cities.find(c => String(c.city_id) === form.city_id);
      const body = {
        ...form,
        city_name: city?.city_name || '',
        customer_id: user?.customer_id || user?.id,
        access_token: token,
      };
      await client.post('/save-address', body);
      toast.success('Address saved!');
      setShowForm(false);
      setForm({ recipient_name: '', phone: '', full_address: '', city_id: '', postal_code: '', label: 'Home' });
      loadAddresses();
    } catch { toast.error('Failed to save address'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this address?')) return;
    try {
      await client.post('/delete-address', { address_id: id, access_token: token });
      toast.success('Address deleted');
      loadAddresses();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="account-panel">
      <div className="flex items-center justify-between mb-4">
        <h2>My Addresses</h2>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          <FiPlus size={14} /> Add Address
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleAdd} className="address-form mb-4">
          <div className="form-row">
            <div className="form-group"><label className="form-label">Recipient Name *</label>
              <input className="form-input" placeholder="Full name" value={form.recipient_name} onChange={e => update('recipient_name', e.target.value)} />
            </div>
            <div className="form-group"><label className="form-label">Phone *</label>
              <input className="form-input" placeholder="01XXXXXXXXX" value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>
          </div>
          <div className="form-group"><label className="form-label">Full Address *</label>
            <input className="form-input" placeholder="House, Road, Area" value={form.full_address} onChange={e => update('full_address', e.target.value)} />
          </div>
          <div className="form-row">
            <div className="form-group"><label className="form-label">City *</label>
              <select className="form-select" value={form.city_id} onChange={e => update('city_id', e.target.value)}>
                <option value="">Select City</option>
                {cities.map(c => <option key={c.city_id} value={c.city_id}>{c.city_name}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">Postal Code</label>
              <input className="form-input" placeholder="1200" value={form.postal_code} onChange={e => update('postal_code', e.target.value)} />
            </div>
            <div className="form-group"><label className="form-label">Label</label>
              <select className="form-select" value={form.label} onChange={e => update('label', e.target.value)}>
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>{saving ? 'Saving...' : 'Save Address'}</button>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </form>
      )}

      {/* Address list */}
      {loading ? (
        <div className="skeleton" style={{ height: '100px' }} />
      ) : addresses.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px' }}>
          <FiMapPin size={40} color="var(--sm-text-muted)" />
          <p className="text-muted mt-2">No saved addresses yet.</p>
        </div>
      ) : (
        <div className="address-list">
          {addresses.map(a => (
            <div key={a.address_id || a.id} className="address-card">
              <div className="address-card__label">
                <span className="badge badge-primary">{a.label || 'Home'}</span>
              </div>
              <p className="font-medium">{a.recipient_name}</p>
              <p className="text-sm text-muted">{a.phone}</p>
              <p className="text-sm">{a.full_address}</p>
              <p className="text-sm text-muted">{a.city_name} {a.postal_code && `- ${a.postal_code}`}</p>
              <button className="address-card__delete" onClick={() => handleDelete(a.address_id || a.id)} title="Delete">
                <FiTrash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
