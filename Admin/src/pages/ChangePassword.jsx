import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/adminApi';
import toast from 'react-hot-toast';

export default function ChangePassword() {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPw !== confirm) return toast.error('Passwords do not match');
    if (newPw.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      const res = await api.post('/change-password', { old_password: oldPw, new_password: newPw });
      if (res.data.success) {
        localStorage.setItem('admin_token', res.data.access_token);
        toast.success('Password changed successfully!');
        navigate('/');
      } else {
        toast.error(res.data.message || 'Failed');
      }
    } catch (err) {
      toast.error('Failed to change password');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="logo">🔒</div>
          <h1>Change Password</h1>
          <p>You must change the default password before continuing.</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Current Password</label>
            <input type="password" className="form-input" value={oldPw} onChange={(e) => setOldPw(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" value={newPw} onChange={(e) => setNewPw(e.target.value)} required />
          </div>
          <div className="mb-4">
            <label className="form-label">Confirm New Password</label>
            <input type="password" className="form-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
            {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
