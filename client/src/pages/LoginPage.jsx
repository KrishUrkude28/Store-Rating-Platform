import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, AlertCircle, ArrowLeft } from 'lucide-react';

export default function LoginPage({ onNavigate }) {
  const { login, getRoleHomePath } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const user = await login(email, password);
      onNavigate(getRoleHomePath(user.role));
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Back to Home Link */}
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={() => onNavigate('/')}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Brand Header */}
        <div className="auth-logo-header">
          <div className="auth-logo-icon">
            <Store size={26} />
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your RateStore account</p>
        </div>

        {error && (
          <div style={{ padding: '12px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">Email Address</label>
            <input
              type="email"
              id="login-email"
              className="form-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="login-password">Password</label>
            <input
              type="password"
              id="login-password"
              className="form-input"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer-links">
          <span>Don't have an account? </span>
          <a
            href="#register"
            onClick={(e) => { e.preventDefault(); onNavigate('/register'); }}
          >
            Sign up here
          </a>
        </div>
      </div>
    </div>
  );
}
