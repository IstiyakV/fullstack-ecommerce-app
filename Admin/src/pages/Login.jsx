import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        toast.success('Welcome back!');
        if (res.must_change_password) {
          navigate('/change-password');
        } else {
          navigate('/');
        }
      } else {
        toast.error(res.message || 'Login failed');
      }
    } catch (err) {
      toast.error('Connection error');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-brand">
          <div className="logo">SM</div>
          <h1>Shopperz Mart</h1>
          <p>Admin Panel Login</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@shopperzmart.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
