import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { PlusCircle, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';

import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';

export default function AdminAddStorePage({ onNavigate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });

  const [owners, setOwners] = useState([]);
  const [loadingOwners, setLoadingOwners] = useState(true);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleTabChange = (tabId) => {
    if (tabId === 'dashboard') onNavigate('/admin/dashboard');
    if (tabId === 'stores') onNavigate('/admin/stores');
    if (tabId === 'users') onNavigate('/admin/users');
  };

  useEffect(() => {
    async function loadOwners() {
      try {
        const res = await api.getStoreOwners();
        setOwners(res.owners || []);
        if (res.owners && res.owners.length > 0) {
          setFormData(prev => ({ ...prev, owner_id: res.owners[0].id }));
        }
      } catch (err) {
        console.warn('Failed to load store owners:', err.message);
      } finally {
        setLoadingOwners(false);
      }
    }
    loadOwners();
  }, []);

  const nameLen = formData.name.trim().length;
  const isNameValid = nameLen > 0 && nameLen <= 60;
  const isAddressValid = formData.address.trim().length > 0 && formData.address.trim().length <= 400;

  const validate = () => {
    const newErrors = {};

    if (!isNameValid) {
      newErrors.name = 'Store name is required and cannot exceed 60 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim() || !emailRegex.test(formData.email.trim())) {
      newErrors.email = 'Please provide a valid email address.';
    }

    if (!isAddressValid) {
      newErrors.address = 'Store address is required and cannot exceed 400 characters.';
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

    setSubmitting(true);

    try {
      await api.createStore({
        ...formData,
        owner_id: formData.owner_id ? parseInt(formData.owner_id, 10) : null
      });

      setSuccessMsg(`Store "${formData.name}" created successfully! Redirecting...`);
      setTimeout(() => {
        onNavigate('/admin/stores');
      }, 1200);
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
      }
      setServerError(err.message || 'Failed to create store.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-layout">
      <Sidebar currentTab="stores" onTabChange={handleTabChange} />
      <div className="main-content-wrapper">
        <TopBar />
        <div className="page-container" id="admin-add-store-page">
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              className="admin-filter-btn-reset"
              onClick={() => onNavigate('/admin/stores')}
              id="btn-back-from-add-store"
            >
              <ArrowLeft size={15} />
              <span>Back to Stores</span>
            </button>
          </div>

          <div className="admin-card" style={{ maxWidth: '640px', margin: '0 auto', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
          <div className="stat-icon-wrapper stat-icon-stores" style={{ width: '44px', height: '44px' }}>
            <PlusCircle size={22} />
          </div>
          <div>
            <h2>Add New Store</h2>
            <p style={{ fontSize: '0.88rem' }}>Register a retail store and optionally assign a store owner</p>
          </div>
        </div>

        {serverError && (
          <div className="alert alert-danger" id="add-store-error-alert">
            <AlertCircle size={18} />
            <span>{serverError}</span>
          </div>
        )}

        {successMsg && (
          <div className="alert alert-success" id="add-store-success-alert">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} id="admin-create-store-form">
          {/* Store Name (Max 60 chars) */}
          <div className="form-group">
            <div className="form-label">
              <label htmlFor="store-name">Store Name</label>
              <span className="form-hint">{nameLen}/60</span>
            </div>
            <input
              type="text"
              id="store-name"
              className={`form-control ${errors.name ? 'is-invalid' : ''}`}
              placeholder="e.g. FreshMart Organic Groceries"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Store Email */}
          <div className="form-group">
            <label className="form-label" htmlFor="store-email">Store Email Address</label>
            <input
              type="email"
              id="store-email"
              className={`form-control ${errors.email ? 'is-invalid' : ''}`}
              placeholder="contact@storename.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Store Address (Max 400 chars) */}
          <div className="form-group">
            <div className="form-label">
              <label htmlFor="store-address">Store Address</label>
              <span className="form-hint">{formData.address.length}/400</span>
            </div>
            <textarea
              id="store-address"
              className={`form-control ${errors.address ? 'is-invalid' : ''}`}
              placeholder="Store physical location / street address (max 400 characters)"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
            {errors.address && <span className="error-text">{errors.address}</span>}
          </div>

          {/* Store Owner Selection */}
          <div className="form-group">
            <label className="form-label" htmlFor="store-owner">
              Assign Store Owner (Optional)
            </label>
            <select
              id="store-owner"
              className="form-control"
              value={formData.owner_id}
              onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
            >
              <option value="">-- No Owner Assigned (Unassigned) --</option>
              {owners.map((owner) => (
                <option key={owner.id} value={owner.id}>
                  {owner.name} ({owner.email})
                </option>
              ))}
            </select>
            <span className="form-hint">
              Assigning an owner allows them to access their store ratings on their owner dashboard.
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ flex: 1 }}
              onClick={() => onNavigate('/admin/stores')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 2 }}
              disabled={submitting}
              id="btn-submit-create-store"
            >
              {submitting ? 'Registering Store...' : 'Create Store'}
            </button>
          </div>
        </form>
          </div>
        </div>
      </div>
    </div>
  );
}
