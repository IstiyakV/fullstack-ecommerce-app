import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { FiEye, FiEyeOff, FiPhone, FiLock } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone || !password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    const result = await login(phone, password);
    setLoading(false);
    if (result.success) {
      toast.success('Logged in successfully!');
      navigate(redirect, { replace: true });
    } else {
      toast.error(result.message || 'Invalid credentials');
    }
  };

  return (
    <>
      <Helmet><title>Login — Shopperz Mart</title></Helmet>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-card__header">
            <h1>Welcome Back!</h1>
            <p className="text-muted">Sign in to your Shopperz Mart account</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-icon-wrap">
                <FiPhone className="input-icon" size={16} />
                <input
                  type="tel"
                  className="form-input form-input--icon"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-icon-wrap">
                <FiLock className="input-icon" size={16} />
                <input
                  type={showPass ? 'text' : 'password'}
                  className="form-input form-input--icon"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="auth-card__footer">
            <p>Don't have an account? <Link to="/register" className="text-primary font-semibold">Register</Link></p>
          </div>
        </div>
      </div>
    </>
  );
}
