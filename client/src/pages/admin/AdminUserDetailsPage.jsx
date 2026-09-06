import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import StarRating from '../../components/StarRating';
import { ArrowLeft, User, Mail, MapPin, Shield, Store, Star, AlertCircle } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Retrieving user profile information...</p>
        </div>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="main-content">
        <div className="alert alert-danger">
          <AlertCircle size={18} />
          <span>{error || 'User not found.'}</span>
        </div>
        <button className="btn btn-secondary" onClick={() => onNavigate('/admin/users')}>
          <ArrowLeft size={16} />
          <span>Back to Users List</span>
        </button>
      </div>
    );
  }

  const { user, stores } = userData;

  const roleClassMap = {
    ADMIN: 'role-admin',
    USER: 'role-user',
    STORE_OWNER: 'role-owner'
  };

  return (
    <div className="main-content" id="admin-user-details-page">
      <div style={{ marginBottom: '1.5rem' }}>
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => onNavigate('/admin/users')}
          id="btn-back-to-users"
        >
          <ArrowLeft size={15} />
          <span>Back to Users</span>
        </button>
      </div>

      <div className="glass-card" style={{ maxWidth: '750px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1.25rem', marginBottom: '1.75rem' }}>
          <div>
            <h1>{user.name}</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>User ID: {user.id}</p>
          </div>
          <span className={`user-role-tag ${roleClassMap[user.role] || ''}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.85rem' }}>
            {user.role}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <div className="stat-icon-wrapper stat-icon-users" style={{ width: '42px', height: '42px' }}>
              <Mail size={18} />
            </div>
            <div>
              <span className="stat-label" style={{ fontSize: '0.78rem' }}>Email Address</span>
              <p style={{ color: '#ffffff', fontWeight: 600 }}>{user.email}</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.85rem' }}>
            <div className="stat-icon-wrapper stat-icon-users" style={{ width: '42px', height: '42px' }}>
              <MapPin size={18} />
            </div>
            <div>
              <span className="stat-label" style={{ fontSize: '0.78rem' }}>Physical Address</span>
              <p style={{ color: '#ffffff' }}>{user.address}</p>
            </div>
          </div>
        </div>

        {/* PRD ADMIN-006: If role is Store Owner, display store and rating information */}
        {user.role === 'STORE_OWNER' && (
          <div style={{ marginTop: '2rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <Store size={20} color="#38bdf8" />
              <h3>Associated Stores & Rating</h3>
            </div>

            {stores && stores.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {stores.map((store) => (
                  <div
                    key={store.id}
                    style={{
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '1.25rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '1rem'
                    }}
                    id={`owner-store-${store.id}`}
                  >
                    <div>
                      <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{store.name}</h4>
                      <p style={{ fontSize: '0.85rem' }}>{store.address}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Average Rating</span>
                      <StarRating
                        value={store.rating || store.average_rating}
                        readOnly={true}
                        showLabel={true}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                No stores currently registered under this owner account.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
