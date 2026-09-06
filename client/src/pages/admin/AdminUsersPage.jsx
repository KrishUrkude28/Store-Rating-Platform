import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import TableSortHeader from '../../components/TableSortHeader';
import { Users, Search, Filter, X, Eye, UserPlus, AlertCircle } from 'lucide-react';

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

  const roleClassMap = {
    ADMIN: 'role-admin',
    USER: 'role-user',
    STORE_OWNER: 'role-owner'
  };

  const handleTabChange = (tabId) => {
    if (tabId === 'dashboard') onNavigate('/admin/dashboard');
    if (tabId === 'stores') onNavigate('/admin/stores');
    if (tabId === 'users') onNavigate('/admin/users');
  };

  return (
    <div className="app-layout">
      <Sidebar currentTab="users" onTabChange={handleTabChange} />
      <div className="main-content-wrapper">
        <TopBar />
        <div className="page-container" id="admin-users-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>User Directory</h1>
          <p>View, filter, and inspect registered platform accounts</p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => onNavigate('/admin/users/create')}
          id="btn-add-new-user"
        >
          <UserPlus size={16} />
          <span>Add New User</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Combinable Filter Bar (ADMIN-004) */}
      <div className="filter-bar" id="user-filter-bar">
        <div className="filter-input-group">
          <Search size={15} color="#9ca3af" />
          <input
            type="text"
            placeholder="Filter by Name..."
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            id="filter-user-name"
          />
        </div>

        <div className="filter-input-group">
          <Search size={15} color="#9ca3af" />
          <input
            type="text"
            placeholder="Filter by Email..."
            value={filters.email}
            onChange={(e) => handleFilterChange('email', e.target.value)}
            id="filter-user-email"
          />
        </div>

        <div className="filter-input-group">
          <Search size={15} color="#9ca3af" />
          <input
            type="text"
            placeholder="Filter by Address..."
            value={filters.address}
            onChange={(e) => handleFilterChange('address', e.target.value)}
            id="filter-user-address"
          />
        </div>

        <div className="filter-input-group" style={{ maxWidth: '180px' }}>
          <Filter size={15} color="#9ca3af" />
          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            id="filter-user-role"
          >
            <option value="">All Roles</option>
            <option value="USER">Normal User</option>
            <option value="ADMIN">Administrator</option>
            <option value="STORE_OWNER">Store Owner</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={resetFilters}
            title="Clear all filters"
            id="btn-reset-user-filters"
          >
            <X size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Users Table (ADMIN-003, 005) */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading users...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="empty-state glass-card">
          <Users className="empty-state-icon" />
          <h3>No users found</h3>
          <p>No user accounts matched your current filtering criteria.</p>
          {hasActiveFilters && (
            <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }} onClick={resetFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive" id="users-table-wrapper">
          <table className="table-custom" id="users-table">
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
              {users.map((u) => (
                <tr key={u.id} id={`user-row-${u.id}`}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ color: '#93c5fd' }}>{u.email}</td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: '300px' }} title={u.address}>
                    {u.address}
                  </td>
                  <td>
                    <span className={`user-role-tag ${roleClassMap[u.role] || ''}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right', paddingRight: '1.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onNavigate(`/admin/users/${u.id}`)}
                      title="View user details"
                      id={`btn-view-user-${u.id}`}
                    >
                      <Eye size={14} />
                      <span>Details</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
