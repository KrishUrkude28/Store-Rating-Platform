import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Store, AlertCircle, ArrowLeft, Check, User, ShoppingBag, ShieldCheck } from 'lucide-react';

export default function RegisterPage({ onNavigate }) {
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    role: 'USER'
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Real-time validation checks
  const nameLen = formData.name.trim().length;
  const isNameValid = nameLen >= 20 && nameLen <= 60;

  const hasUpper = /[A-Z]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
  const isPassLength = formData.password.length >= 8 && formData.password.length <= 16;
  const isPassValid = hasUpper && hasSpecial && isPassLength;

  const isAddressValid = formData.address.trim().length > 0 && formData.address.trim().length <= 400;

  const validate = () => {
    const newErrors = {};

    if (!isNameValid) {
      newErrors.name = 'Name must be 20 to 60 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Address is required.';
    } else if (formData.address.trim().length > 400) {
      newErrors.address = 'Address cannot exceed 400 characters.';
    }

    if (!isPassValid) {
      newErrors.password = 'Password must meet complexity rules.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const user = await register({
        name: formData.name.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        password: formData.password,
        role: formData.role
      });

      // Role-based destination
      if (user && user.role === 'ADMIN') {
        onNavigate('/admin/dashboard');
      } else if (user && user.role === 'STORE_OWNER') {
        onNavigate('/owner/dashboard');
      } else {
        onNavigate('/user/stores');
      }
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
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
          <h1>Create Account</h1>
          <p>Join the RateStore community</p>
        </div>

        {serverError && (
          <div style={{ padding: '12px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Account Preference / Role Selection */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label" style={{ marginBottom: '8px' }}>I am joining as:</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'USER' })}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  border: formData.role === 'USER' ? '2px solid #2563eb' : '1px solid #e2e8f0',
                  backgroundColor: formData.role === 'USER' ? '#eff6ff' : '#ffffff',
                  color: formData.role === 'USER' ? '#1e40af' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <User size={18} color={formData.role === 'USER' ? '#2563eb' : '#64748b'} />
                <span>User</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'STORE_OWNER' })}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  border: formData.role === 'STORE_OWNER' ? '2px solid #10b981' : '1px solid #e2e8f0',
                  backgroundColor: formData.role === 'STORE_OWNER' ? '#f0fdf4' : '#ffffff',
                  color: formData.role === 'STORE_OWNER' ? '#166534' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <ShoppingBag size={18} color={formData.role === 'STORE_OWNER' ? '#10b981' : '#64748b'} />
                <span>Store Owner</span>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: 'ADMIN' })}
                style={{
                  padding: '10px 8px',
                  borderRadius: '10px',
                  border: formData.role === 'ADMIN' ? '2px solid #f59e0b' : '1px solid #e2e8f0',
                  backgroundColor: formData.role === 'ADMIN' ? '#fefce8' : '#ffffff',
                  color: formData.role === 'ADMIN' ? '#854d0e' : '#475569',
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <ShieldCheck size={18} color={formData.role === 'ADMIN' ? '#f59e0b' : '#64748b'} />
                <span>Admin</span>
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Full Name</label>
              <span style={{ fontSize: '0.75rem', color: isNameValid ? '#16a34a' : '#94a3b8' }}>
                {nameLen}/60 (min 20)
              </span>
            </div>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Christopher David Evans"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            {errors.name && <div className="form-error">{errors.name}</div>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="name@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            {errors.email && <div className="form-error">{errors.email}</div>}
          </div>

          {/* Address */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label">Physical Address</label>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                {formData.address.length}/400 max
              </span>
            </div>
            <textarea
              className="form-textarea"
              placeholder="Flat/House, Street, Area, City, State"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              rows={2}
              required
            />
            {errors.address && <div className="form-error">{errors.address}</div>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Create strong password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            {/* Live validation indicator */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', color: isPassLength ? '#16a34a' : '#94a3b8' }}>
                {isPassLength ? <Check size={12} /> : '•'} 8–16 chars
              </span>
              <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', color: hasUpper ? '#16a34a' : '#94a3b8' }}>
                {hasUpper ? <Check size={12} /> : '•'} 1 Uppercase
              </span>
              <span style={{ fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: '4px', color: hasSpecial ? '#16a34a' : '#94a3b8' }}>
                {hasSpecial ? <Check size={12} /> : '•'} 1 Special char
              </span>
            </div>
            {errors.password && <div className="form-error">{errors.password}</div>}
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Sign Up'}
          </button>
        </form>

        <div className="auth-footer-links">
          <span>Already have an account? </span>
          <a
            href="#login"
            onClick={(e) => { e.preventDefault(); onNavigate('/login'); }}
          >
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}
