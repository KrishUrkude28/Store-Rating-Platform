import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, AlertCircle, CheckCircle2, ArrowLeft, Check } from 'lucide-react';

export default function ChangePasswordPage({ onNavigate }) {
  const { changePassword, getRoleHomePath, user } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const hasUpper = /[A-Z]/.test(formData.newPassword);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.newPassword);
  const isPassLength = formData.newPassword.length >= 8 && formData.newPassword.length <= 16;

  const validate = () => {
    const newErrors = {};

    if (!formData.currentPassword) {
      newErrors.currentPassword = 'Current password is required.';
    }

    if (!isPassLength || !hasUpper || !hasSpecial) {
      newErrors.newPassword = 'Password must meet complexity rules.';
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'New password and confirmation do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);
    setSuccessMsg(null);

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      const res = await changePassword(formData);
      setSuccessMsg(res.message || 'Password updated successfully.');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setTimeout(() => {
        onNavigate(getRoleHomePath(user?.role));
      }, 1500);
    } catch (err) {
      setServerError(err.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Back Button */}
        <div style={{ marginBottom: '16px' }}>
          <button
            onClick={() => onNavigate(getRoleHomePath(user?.role))}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Brand Header */}
        <div className="auth-logo-header">
          <div className="auth-logo-icon" style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)' }}>
            <Lock size={24} />
          </div>
          <h1>Modify Password</h1>
          <p>Update your account security credentials</p>
        </div>

        {serverError && (
          <div style={{ padding: '12px 14px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#b91c1c', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '12px 14px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', gap: '8px', alignItems: 'center' }}>
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Current Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter current password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
            />
            {errors.currentPassword && <div className="form-error">{errors.currentPassword}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">New Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Enter new strong password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              required
            />
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
            {errors.newPassword && <div className="form-error">{errors.newPassword}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="Re-type new password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />
            {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
          </div>

          <button
            type="submit"
            className="auth-submit-btn"
            style={{ backgroundColor: '#2563eb' }}
            disabled={loading}
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
