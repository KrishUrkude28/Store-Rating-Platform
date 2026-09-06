import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import TableSortHeader from '../../components/TableSortHeader';
import StarRating from '../../components/StarRating';
import { Store, Search, X, PlusCircle, AlertCircle } from 'lucide-react';

import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';

export default function AdminStoresPage({ onNavigate }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters (ADMIN-008)
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    address: ''
  });

  // Sorting (ADMIN-009)
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        sortBy,
        sortOrder,
        ...(filters.name && { name: filters.name }),
        ...(filters.email && { email: filters.email }),
        ...(filters.address && { address: filters.address })
      };
      const res = await api.getStores(params);
      setStores(res.stores || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch stores.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [filters, sortBy, sortOrder]);

  const handleSort = (field, order) => {
    setSortBy(field);
    setSortOrder(order);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({ name: '', email: '', address: '' });
  };

  const hasActiveFilters = Object.values(filters).some(val => val !== '');

  const handleTabChange = (tabId) => {
    if (tabId === 'dashboard') onNavigate('/admin/dashboard');
    if (tabId === 'stores') onNavigate('/admin/stores');
    if (tabId === 'users') onNavigate('/admin/users');
  };

  return (
    <div className="app-layout">
      <Sidebar currentTab="stores" onTabChange={handleTabChange} />
      <div className="main-content-wrapper">
        <TopBar />
        <div className="page-container" id="admin-stores-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Store Directory</h1>
          <p>Manage, filter, and inspect registered stores and their ratings</p>
        </div>
        <button
          className="btn btn-amber"
          onClick={() => onNavigate('/admin/stores/create')}
          id="btn-add-new-store"
        >
          <PlusCircle size={16} />
          <span>Add New Store</span>
        </button>
      </div>

      {error && (
        <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Filter Bar (ADMIN-008) */}
      <div className="filter-bar" id="store-filter-bar">
        <div className="filter-input-group">
          <Search size={15} color="#9ca3af" />
          <input
            type="text"
            placeholder="Filter by Store Name..."
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
            id="filter-store-name"
          />
        </div>

        <div className="filter-input-group">
          <Search size={15} color="#9ca3af" />
          <input
            type="text"
            placeholder="Filter by Store Email..."
            value={filters.email}
            onChange={(e) => handleFilterChange('email', e.target.value)}
            id="filter-store-email"
          />
        </div>

        <div className="filter-input-group">
          <Search size={15} color="#9ca3af" />
          <input
            type="text"
            placeholder="Filter by Store Address..."
            value={filters.address}
            onChange={(e) => handleFilterChange('address', e.target.value)}
            id="filter-store-address"
          />
        </div>

        {hasActiveFilters && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={resetFilters}
            title="Clear all filters"
            id="btn-reset-store-filters"
          >
            <X size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Stores Table (ADMIN-007, ADMIN-009) */}
      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading stores...</p>
        </div>
      ) : stores.length === 0 ? (
        <div className="empty-state glass-card">
          <Store className="empty-state-icon" />
          <h3>No stores found</h3>
          <p>No store listings match your search criteria.</p>
          {hasActiveFilters && (
            <button className="btn btn-secondary btn-sm" style={{ marginTop: '1rem' }} onClick={resetFilters}>
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div className="table-responsive" id="stores-table-wrapper">
          <table className="table-custom" id="stores-table">
            <thead>
              <tr>
                <TableSortHeader
                  field="name"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                >
                  Store Name
                </TableSortHeader>
                <TableSortHeader
                  field="email"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                >
                  Email Address
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
                  field="rating"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                >
                  Overall Rating
                </TableSortHeader>
              </tr>
            </thead>
            <tbody>
              {stores.map((s) => (
                <tr key={s.id} id={`admin-store-row-${s.id}`}>
                  <td style={{ fontWeight: 600, color: '#ffffff' }}>{s.name}</td>
                  <td style={{ color: '#93c5fd' }}>{s.email}</td>
                  <td style={{ color: 'var(--text-secondary)', maxWidth: '320px' }} title={s.address}>
                    {s.address}
                  </td>
                  <td>
                    <StarRating
                      value={s.rating || s.average_rating}
                      readOnly={true}
                      showLabel={true}
                    />
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
