import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';

export default function ProtectedRoute({ allowedRoles, children, onNavigate }) {
  const { user, isAuthenticated, loading, getRoleHomePath } = useAuth();

  if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Verifying authentication credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (onNavigate) {
      onNavigate('/');
    } else {
      window.location.href = '/';
    }
    return null;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="empty-state">
        <ShieldAlert className="empty-state-icon" style={{ color: '#f59e0b' }} />
        <h3>Access Denied (403 Forbidden)</h3>
        <p>Your current account role does not have permission to access this area.</p>
        <button
          className="btn btn-secondary"
          style={{ marginTop: '1.25rem' }}
          onClick={() => onNavigate(getRoleHomePath(user.role))}
        >
          Return to My Dashboard
        </button>
      </div>
    );
  }

  return children;
}
