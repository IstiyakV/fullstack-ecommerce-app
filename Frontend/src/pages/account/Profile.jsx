import { useState } from 'react';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import client from '../../api/client';
import { useAuth } from '../../context/AuthContext';

export default function Profile() {
  const { user, token, updateUser } = useAuth();
  const [form, setForm] = useState({
    customer_name: user?.customer_name || '',
    customer_email: user?.customer_email || '',
    customer_phone: user?.customer_phone || '',
  });
  const [loading, setLoading] = useState(false);

  const update = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await client.post('/profile-update', { ...form, access_token: token });
      if (res.data.status_code === 200) {
        updateUser(form);
        toast.success('Profile updated!');
      } else {
        toast.error(res.data.message || 'Update failed');
      }
    } catch { toast.error('Something went wrong'); }
    setLoading(false);
  };

  return (
    <div className="account-panel">
      <h2>My Profile</h2>
      <form onSubmit={handleSave} className="account-form">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.customer_name} onChange={e => update('customer_name', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" value={form.customer_phone} disabled style={{ opacity: 0.6 }} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.customer_email} onChange={e => update('customer_email', e.target.value)} />
        </div>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          <FiSave size={16} /> {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
