import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import TableSortHeader from '../../components/TableSortHeader';
import { 
  Users, 
  Search, 
  Mail, 
  MapPin, 
  Filter, 
  X, 
  Eye, 
  UserPlus, 
  AlertCircle,
  Shield,
  Store,
  UserCheck
} from 'lucide-react';

import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';

export default function AdminUsersPage({ onNavigate }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtering criteria (ADMIN-004)
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: '',
    role: ''
  });

  // Sorting criteria (ADMIN-005)
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        sortBy,
        sortOrder,
        ...(filters.name && { name: filters.name }),
        ...(filters.email && { email: filters.email }),
        ...(filters.address && { address: filters.address }),
        ...(filters.role && { role: filters.role })
      };
      const res = await api.getUsers(params);
      setUsers(res.users || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters, sortBy, sortOrder]);

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ name: '', email: '', address: '', role: '' });
  };

  const hasActiveFilters = Object.values(filters).some(val => val !== '');

  const handleTabChange = (tabId) => {
    if (tabId === 'dashboard') onNavigate('/admin/dashboard');
    if (tabId === 'stores') onNavigate('/admin/stores');
    if (tabId === 'users') onNavigate('/admin/users');
  };

  // Helper for initials & avatar
  const getUserAvatar = (name, role, index) => {
    const initials = (name || 'User')
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    let colorClass = 'avatar-blue';
    if (role === 'ADMIN') colorClass = 'avatar-purple';
    else if (role === 'STORE_OWNER') colorClass = 'avatar-green';
    else {
      const colors = ['avatar-blue', 'avatar-cyan', 'avatar-amber'];
      colorClass = colors[index % colors.length];
    }
    return { initials, colorClass };
  };

  // Render role badge with icon
  const renderRoleBadge = (role) => {
    if (role === 'ADMIN') {
      return (
        <span className="role-badge role-badge-admin">
          <Shield size={12} />
          <span>Admin</span>
        </span>
      );
    }
    if (role === 'STORE_OWNER') {
      return (
        <span className="role-badge role-badge-owner">
          <Store size={12} />
          <span>Store Owner</span>
        </span>
      );
    }
    return (
      <span className="role-badge role-badge-user">
        <UserCheck size={12} />
        <span>User</span>
      </span>
    );
  };

  return (
    <div className="app-layout">
      <Sidebar currentTab="users" onTabChange={handleTabChange} />
      <div className="main-content-wrapper">
        <TopBar />
        <div className="page-container" id="admin-users-page">
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                User Directory
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
                View, filter, and inspect registered platform accounts
              </p>
            </div>
            <button
              onClick={() => onNavigate('/admin/users/create')}
              id="btn-add-new-user"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#2563eb',
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.9rem',
                boxShadow: '0 2px 4px rgba(37, 99, 235, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
            >
              <UserPlus size={18} />
              <span>Add New User</span>
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Modern Combinable Filter Bar */}
          <div className="admin-filter-bar" id="user-filter-bar">
            <div className="admin-filter-group">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Filter by Name..."
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                id="filter-user-name"
              />
            </div>

            <div className="admin-filter-group">
              <Mail size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Filter by Email..."
                value={filters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                id="filter-user-email"
              />
            </div>

            <div className="admin-filter-group">
              <MapPin size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Filter by Address..."
                value={filters.address}
                onChange={(e) => handleFilterChange('address', e.target.value)}
                id="filter-user-address"
              />
            </div>

            <div className="admin-filter-group" style={{ maxWidth: '190px' }}>
              <Filter size={16} color="#94a3b8" />
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                id="filter-user-role"
              >
                <option value="">All Roles</option>
                <option value="USER">Normal User</option>
                <option value="STORE_OWNER">Store Owner</option>
                <option value="ADMIN">Administrator</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                className="admin-filter-btn-reset"
                onClick={resetFilters}
                title="Clear all filters"
                id="btn-reset-user-filters"
              >
                <X size={15} />
                <span>Reset</span>
              </button>
            )}

            <div style={{ marginLeft: 'auto', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
              Showing {users.length} {users.length === 1 ? 'User' : 'Users'}
            </div>
          </div>

          {/* Users Modern Table */}
          {loading ? (
            <div className="admin-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p style={{ marginTop: '12px', color: '#64748b' }}>Loading user directory...</p>
              </div>
            </div>
          ) : users.length === 0 ? (
            <div className="admin-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#64748b' }}>
                <Users size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>No users found</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>No registered user accounts matched your filtering criteria.</p>
              {hasActiveFilters && (
                <button 
                  className="admin-filter-btn-reset" 
                  style={{ margin: '16px auto 0', backgroundColor: '#2563eb', color: '#ffffff', borderColor: '#2563eb' }} 
                  onClick={resetFilters}
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <div className="admin-card" id="users-table-wrapper">
              <div className="admin-table-wrapper">
                <table className="admin-table" id="users-table">
                  <thead>
                    <tr>
                      <TableSortHeader
                        field="name"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Name
                      </TableSortHeader>
                      <TableSortHeader
                        field="email"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Email
                      </TableSortHeader>
                      <TableSortHeader
                        field="address"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Address
                      </TableSortHeader>
                      <TableSortHeader
                        field="role"
                        currentSortBy={sortBy}
                        currentSortOrder={sortOrder}
                        onSort={handleSort}
                      >
                        Role
                      </TableSortHeader>
                      <th style={{ textAlign: 'right', paddingRight: '1.5rem' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u, index) => {
                      const avatar = getUserAvatar(u.name, u.role, index);
                      return (
                        <tr key={u.id} id={`user-row-${u.id}`}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div className={`entity-avatar-box ${avatar.colorClass}`}>
                                {avatar.initials}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                                  {u.name}
                                </div>
                                <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                  User #{u.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                              <Mail size={14} color="#94a3b8" />
                              <span style={{ fontSize: '0.88rem' }}>{u.email}</span>
                            </div>
                          </td>
                          <td style={{ maxWidth: '300px' }} title={u.address}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#64748b' }}>
                              <MapPin size={14} color="#94a3b8" style={{ marginTop: '3px', flexShrink: 0 }} />
                              <span style={{ fontSize: '0.86rem', lineHeight: '1.4' }}>{u.address}</span>
                            </div>
                          </td>
                          <td>
                            {renderRoleBadge(u.role)}
                          </td>
                          <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                            <button
                              className="admin-action-btn"
                              onClick={() => onNavigate(`/admin/users/${u.id}`)}
                              title="View user details"
                              id={`btn-view-user-${u.id}`}
                            >
                              <Eye size={15} />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
