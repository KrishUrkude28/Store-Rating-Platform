import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import StarRating from '../../components/StarRating';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  MapPin, 
  Shield, 
  Store, 
  Star, 
  AlertCircle,
  UserCheck,
  Calendar,
  Hash,
  Award
} from 'lucide-react';

import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';

export default function AdminUserDetailsPage({ userId, onNavigate }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadUserDetails() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getUserDetails(userId);
        setUserData(data);
      } catch (err) {
        setError(err.message || 'Failed to retrieve user details.');
      } finally {
        setLoading(false);
      }
    }
    if (userId) {
      loadUserDetails();
    }
  }, [userId]);

  const handleTabChange = (tabId) => {
    if (tabId === 'dashboard') onNavigate('/admin/dashboard');
    if (tabId === 'stores') onNavigate('/admin/stores');
    if (tabId === 'users') onNavigate('/admin/users');
  };

  // Helper for avatar initials
  const getInitials = (name) => {
    return (name || 'User')
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const renderRoleBadge = (role) => {
    if (role === 'ADMIN') {
      return (
        <span className="role-badge role-badge-admin" style={{ fontSize: '0.82rem', padding: '5px 12px' }}>
          <Shield size={13} />
          <span>Administrator</span>
        </span>
      );
    }
    if (role === 'STORE_OWNER') {
      return (
        <span className="role-badge role-badge-owner" style={{ fontSize: '0.82rem', padding: '5px 12px' }}>
          <Store size={13} />
          <span>Store Owner</span>
        </span>
      );
    }
    return (
      <span className="role-badge role-badge-user" style={{ fontSize: '0.82rem', padding: '5px 12px' }}>
        <UserCheck size={13} />
        <span>Platform User</span>
      </span>
    );
  };

  return (
    <div className="app-layout">
      <Sidebar currentTab="users" onTabChange={handleTabChange} />
      <div className="main-content-wrapper">
        <TopBar />
        <div className="page-container" id="admin-user-details-page">
          
          {/* Back Navigation */}
          <div style={{ marginBottom: '1.25rem' }}>
            <button
              onClick={() => onNavigate('/admin/users')}
              id="btn-back-to-users"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                color: '#475569',
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '0.88rem',
                fontWeight: 600,
                boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#0f172a';
                e.currentTarget.style.backgroundColor = '#f8fafc';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#475569';
                e.currentTarget.style.backgroundColor = '#ffffff';
              }}
            >
              <ArrowLeft size={16} />
              <span>Back to User Directory</span>
            </button>
          </div>

          {loading ? (
            <div className="admin-card" style={{ padding: '70px 20px', textAlign: 'center' }}>
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p style={{ marginTop: '12px', color: '#64748b' }}>Retrieving user profile information...</p>
              </div>
            </div>
          ) : error || !userData ? (
            <div className="admin-card" style={{ padding: '40px 24px', textAlign: 'center' }}>
              <div className="alert alert-danger" style={{ maxWidth: '480px', margin: '0 auto 1.5rem' }}>
                <AlertCircle size={18} />
                <span>{error || 'User profile not found.'}</span>
              </div>
              <button
                className="admin-filter-btn-reset"
                style={{ margin: '0 auto', backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#2563eb' }}
                onClick={() => onNavigate('/admin/users')}
              >
                Back to Users List
              </button>
            </div>
          ) : (
            <>
              {/* Profile Card Banner matching RateStore theme */}
              <div className="user-profile-header-card">
                <div className="user-profile-banner">
                  <div style={{ position: 'absolute', right: '24px', bottom: '16px', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                    RateStore Verified Account
                  </div>
                </div>
                <div className="user-profile-body">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '20px', flexWrap: 'wrap' }}>
                      <div className="user-avatar-large">
                        {getInitials(userData.user.name)}
                      </div>
                      <div style={{ paddingBottom: '4px' }}>
                        <h1 style={{ fontSize: '1.65rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                          {userData.user.name}
                        </h1>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                          {userData.user.email}
                        </p>
                      </div>
                    </div>
                    <div style={{ marginTop: '16px' }}>
                      {renderRoleBadge(userData.user.role)}
                    </div>
                  </div>

                  {/* Profile Details Grid */}
                  <div className="user-details-grid">
                    <div className="user-detail-tile">
                      <div className="user-detail-tile-icon" style={{ color: '#2563eb' }}>
                        <Mail size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Email Address
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                          {userData.user.email}
                        </div>
                      </div>
                    </div>

                    <div className="user-detail-tile">
                      <div className="user-detail-tile-icon" style={{ color: '#10b981' }}>
                        <MapPin size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Physical Address
                        </div>
                        <div style={{ fontSize: '0.92rem', color: '#0f172a', marginTop: '2px', lineHeight: '1.4' }}>
                          {userData.user.address}
                        </div>
                      </div>
                    </div>

                    <div className="user-detail-tile">
                      <div className="user-detail-tile-icon" style={{ color: '#8b5cf6' }}>
                        <Hash size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          User Identifier
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                          ID #{userData.user.id}
                        </div>
                      </div>
                    </div>

                    <div className="user-detail-tile">
                      <div className="user-detail-tile-icon" style={{ color: '#f59e0b' }}>
                        <Shield size={18} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                          Account Privilege
                        </div>
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#0f172a', marginTop: '2px' }}>
                          {userData.user.role === 'ADMIN' ? 'Full System Administrator' : userData.user.role === 'STORE_OWNER' ? 'Store & Ratings Manager' : 'Standard Customer'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* PRD ADMIN-006: Associated Stores if Role is STORE_OWNER */}
              {userData.user.role === 'STORE_OWNER' && (
                <div className="admin-card" style={{ padding: '24px 28px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Store size={20} />
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#0f172a' }}>
                        Associated Stores & Performance
                      </h3>
                      <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
                        Stores managed by this owner account
                      </p>
                    </div>
                  </div>

                  {userData.stores && userData.stores.length > 0 ? (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                      {userData.stores.map((store) => (
                        <div
                          key={store.id}
                          style={{
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            borderRadius: '12px',
                            padding: '18px 20px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: '12px',
                            transition: 'transform 0.15s ease, box-shadow 0.15s ease'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                                {store.name}
                              </h4>
                              <span className="category-pill">
                                {store.category || 'Retail Store'}
                              </span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', marginTop: '6px', color: '#64748b' }}>
                              <MapPin size={14} style={{ marginTop: '2px', flexShrink: 0 }} />
                              <span style={{ fontSize: '0.84rem' }}>{store.address}</span>
                            </div>
                          </div>

                          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>
                              Average Rating
                            </span>
                            <StarRating
                              value={store.rating || store.average_rating}
                              readOnly={true}
                              showLabel={true}
                              size={16}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={{ padding: '32px 20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px dashed #cbd5e1' }}>
                      <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                        No stores currently assigned to this store owner.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
