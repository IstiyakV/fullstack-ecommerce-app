import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiUser, FiPhone, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ customer_name: '', customer_phone: '', customer_email: '', password: '', confirm_password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer_name || !form.customer_phone || !form.password) {
      toast.error('Please fill all required fields');
      return;
    }
    if (form.password !== form.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const result = await register({
      customer_name: form.customer_name,
      customer_phone: form.customer_phone,
      customer_email: form.customer_email,
      password: form.password,
    });
    setLoading(false);
    if (result.success) {
      toast.success('Account created! Please login.');
      navigate('/login');
    } else {
      toast.error(result.data?.message || 'Registration failed');
    }
  };

  return (
    <>
      <Helmet><title>Register — Shopperz Mart</title></Helmet>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__header">
            <h1>Create Account</h1>
            <p className="text-muted">Join Shopperz Mart and start shopping!</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div className="input-icon-wrap">
                <FiUser className="input-icon" size={16} />
                <input type="text" className="form-input form-input--icon" placeholder="John Doe" value={form.customer_name} onChange={e => update('customer_name', e.target.value)} autoFocus />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <div className="input-icon-wrap">
                <FiPhone className="input-icon" size={16} />
                <input type="tel" className="form-input form-input--icon" placeholder="01XXXXXXXXX" value={form.customer_phone} onChange={e => update('customer_phone', e.target.value)} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email (optional)</label>
              <div className="input-icon-wrap">
                <FiMail className="input-icon" size={16} />
                <input type="email" className="form-input form-input--icon" placeholder="email@example.com" value={form.customer_email} onChange={e => update('customer_email', e.target.value)} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password *</label>
                <div className="input-icon-wrap">
                  <FiLock className="input-icon" size={16} />
                  <input type={showPass ? 'text' : 'password'} className="form-input form-input--icon" placeholder="Min 6 characters" value={form.password} onChange={e => update('password', e.target.value)} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm Password *</label>
                <div className="input-icon-wrap">
                  <FiLock className="input-icon" size={16} />
                  <input type={showPass ? 'text' : 'password'} className="form-input form-input--icon" placeholder="Re-enter password" value={form.confirm_password} onChange={e => update('confirm_password', e.target.value)} />
                  <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>Already have an account? <Link to="/login" className="text-primary font-semibold">Sign In</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}
