import React, { useState } from 'react';
import { api } from '../../services/api';
import { UserPlus, ArrowLeft, AlertCircle, CheckCircle2, Check, X } from 'lucide-react';

export default function AdminAddUserPage({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER'
  });

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [loading, setLoading] = useState(false);

  const nameLen = formData.name.trim().length;
  const isNameValid = nameLen >= 20 && nameLen <= 60;

  const hasUpper = /[A-Z]/.test(formData.password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password);
  const isPassLength = formData.password.length >= 8 && formData.password.length <= 16;
  const isPassValid = hasUpper && hasSpecial && isPassLength;

  const validate = () => {
    const newErrors = {};

    if (!isNameValid) {
      newErrors.name = 'Name must be between 20 and 60 characters.';
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
      newErrors.password = 'Password must be 8–16 characters with at least one uppercase letter and one special character.';
    }

    if (!['ADMIN', 'USER', 'STORE_OWNER'].includes(formData.role)) {
      newErrors.role = 'Please select a valid role.';
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
      await api.createUser(formData);
      setSuccessMsg(`User ${formData.name} created successfully! Redirecting...`);
      setTimeout(() => {
        onNavigate('/admin/users');
      }, 1200);
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      }
      setServerError(err.message || 'Failed to create user account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" id="admin-add-user-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onNavigate('/admin/users')}
          id="btn-back-from-add-user"
        >
          <ArrowLeft size={15} />
          <span>Back to Users</span>
        </button>
      </div>

      <div className="glass-card" style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div className="stat-icon-wrapper stat-icon-users" style={{ width: '44px', height: '44px' }}>
            <UserPlus size={22} />
          </div>
          <div>
            <h2>Add New User</h2>
            <p style={{ fontSize: '0.88rem' }}>Create administrator, normal user, or store owner accounts</p>
          </div>
        </div>

        {serverError && (
          <div className="alert alert-danger" id="add-user-error-alert">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" id="add-user-success-alert">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} id="admin-create-user-form">
          {/* Role Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="user-role">Account Role</label>
            <select
              id="user-role"
              className="form-control"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              <option value="USER">Normal User</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          {/* Full Name */}
          <div className="form-group">
            <div className="form-label">
              <label htmlFor="user-name">Full Name</label>
              <span className="form-hint" style={{ color: isNameValid ? '#34d399' : undefined }}>
                {nameLen}/60 (min 20)
              </span>
            </div>
            <input
              type="text"
              id="user-name"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. Eleanor Vance Montgomery (20-60 chars)"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="user-email">Email Address</label>
            <input
              type="email"
              id="user-email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Address */}
          <div className="form-group">
            <div className="form-label">
              <label htmlFor="user-address">Physical Address</label>
              <span className="form-hint">{formData.address.length}/400</span>
            </div>
            <textarea
              id="user-address"
              className={`form-control ${errors.address ? 'is-invalid' : ''}`}
              placeholder="Full mailing address details (max 400 characters)"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label" htmlFor="user-password">Initial Password</label>
            <input
              type="password"
              id="user-password"
              className={`form-control ${errors.password ? 'is-invalid' : ''}`}
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            {errors.password && <span className="error-text">{errors.password}</span>}

            <div style={{ marginTop: '0.6rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.78rem' }}>
              <span style={{ color: isPassLength ? '#34d399' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {isPassLength ? <Check size={14} /> : <X size={14} />} 8 to 16 characters
              </span>
              <span style={{ color: hasUpper ? '#34d399' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {hasUpper ? <Check size={14} /> : <X size={14} />} At least one uppercase letter
              </span>
              <span style={{ color: hasSpecial ? '#34d399' : '#9ca3af', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                {hasSpecial ? <Check size={14} /> : <X size={14} />} At least one special character
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => onNavigate('/admin/users')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={loading}
              id="btn-submit-create-user"
            >
              {loading ? 'Creating Account...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
