import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import api from '../api/adminApi';
import toast from 'react-hot-toast';

export default function ChangePassword({ standalone = false }) {
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
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
        setOldPw('');
        setNewPw('');
        setConfirm('');
        if (standalone) navigate('/');
      } else {
        toast.error(res.data.message || 'Failed');
      }
    } catch (err) {
      toast.error('Failed to change password');
    }
    setLoading(false);
  };

  // Standalone mode = forced password change screen (full-page)
  if (standalone) {
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

  // In-layout mode = settings-style card
  return (
    <div>
      <div className="page-header">
        <h1>Change Password</h1>
        <p>Update your admin account password</p>
      </div>

      <div className="data-table-wrapper" style={{ maxWidth: 520 }}>
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          <div className="mb-5">
            <label className="form-label">Current Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showOld ? 'text' : 'password'}
                className="form-input"
                value={oldPw}
                onChange={(e) => setOldPw(e.target.value)}
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                onClick={() => setShowOld(!showOld)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                {showOld ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
          </div>

          <div className="mb-5">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showNew ? 'text' : 'password'}
                className="form-input"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                placeholder="Enter new password (min 6 characters)"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                {showNew ? <FiEyeOff size={16} /> : <FiEye size={16} />}
              </button>
            </div>
            {newPw && (
              <div style={{ marginTop: 6, fontSize: 12, color: newPw.length >= 6 ? '#10b981' : '#ef4444' }}>
                {newPw.length >= 6 ? '✓ Password length OK' : `✗ ${6 - newPw.length} more characters needed`}
              </div>
            )}
          </div>

          <div className="mb-5">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
            {confirm && (
              <div style={{ marginTop: 6, fontSize: 12, color: confirm === newPw ? '#10b981' : '#ef4444' }}>
                {confirm === newPw ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn-primary justify-center py-2.5"
            style={{ width: '100%' }}
            disabled={loading || !oldPw || newPw.length < 6 || newPw !== confirm}
          >
            {loading ? (
              'Updating…'
            ) : (
              <><FiCheck size={16} /> Update Password</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
