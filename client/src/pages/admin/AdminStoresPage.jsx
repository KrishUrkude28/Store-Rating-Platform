import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import TableSortHeader from '../../components/TableSortHeader';
import StarRating from '../../components/StarRating';
import { 
  Store, 
  Search, 
  Mail, 
  MapPin, 
  X, 
  PlusCircle, 
  AlertCircle, 
  Filter,
  Layers
} from 'lucide-react';

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
    address: '',
    category: ''
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
        ...(filters.address && { address: filters.address }),
        ...(filters.category && { category: filters.category })
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
    setFilters({ name: '', email: '', address: '', category: '' });
  };

  const hasActiveFilters = Object.values(filters).some(val => val !== '');

  const handleTabChange = (tabId) => {
    if (tabId === 'dashboard') onNavigate('/admin/dashboard');
    if (tabId === 'stores') onNavigate('/admin/stores');
    if (tabId === 'users') onNavigate('/admin/users');
  };

  // Helper for store initials & color avatar
  const getAvatarInfo = (name, index) => {
    const initials = (name || 'Store')
      .split(' ')
      .map(w => w[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
    const colors = ['avatar-green', 'avatar-blue', 'avatar-purple', 'avatar-amber', 'avatar-cyan', 'avatar-rose'];
    return { initials, colorClass: colors[index % colors.length] };
  };

  return (
    <div className="app-layout">
      <Sidebar currentTab="stores" onTabChange={handleTabChange} />
      <div className="main-content-wrapper">
        <TopBar />
        <div className="page-container" id="admin-stores-page">
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em', marginBottom: '4px' }}>
                Store Directory
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.92rem' }}>
                Manage, filter, and inspect registered stores and their ratings
              </p>
            </div>
            <button
              onClick={() => onNavigate('/admin/stores/create')}
              id="btn-add-new-store"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: '#10b981',
                color: '#ffffff',
                padding: '10px 18px',
                borderRadius: '10px',
                fontWeight: 600,
                fontSize: '0.9rem',
                boxShadow: '0 2px 4px rgba(16, 185, 129, 0.25)',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#10b981'}
            >
              <PlusCircle size={18} />
              <span>Add New Store</span>
            </button>
          </div>

          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1.5rem' }}>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          )}

          {/* Enhanced Modern Filter Bar */}
          <div className="admin-filter-bar" id="store-filter-bar">
            <div className="admin-filter-group">
              <Search size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Filter by Store Name..."
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
                id="filter-store-name"
              />
            </div>

            <div className="admin-filter-group">
              <Mail size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Filter by Email..."
                value={filters.email}
                onChange={(e) => handleFilterChange('email', e.target.value)}
                id="filter-store-email"
              />
            </div>

            <div className="admin-filter-group">
              <MapPin size={16} color="#94a3b8" />
              <input
                type="text"
                placeholder="Filter by Address..."
                value={filters.address}
                onChange={(e) => handleFilterChange('address', e.target.value)}
                id="filter-store-address"
              />
            </div>

            <div className="admin-filter-group" style={{ maxWidth: '180px' }}>
              <Layers size={16} color="#94a3b8" />
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                id="filter-store-category"
              >
                <option value="">All Categories</option>
                <option value="Grocery">Grocery</option>
                <option value="Supermarket">Supermarket</option>
                <option value="Fashion">Fashion</option>
                <option value="Electronics">Electronics</option>
                <option value="Dining">Dining / Cafe</option>
                <option value="Pharmacy">Pharmacy</option>
                <option value="General">General</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                className="admin-filter-btn-reset"
                onClick={resetFilters}
                title="Clear all filters"
                id="btn-reset-store-filters"
              >
                <X size={15} />
                <span>Reset</span>
              </button>
            )}

            <div style={{ marginLeft: 'auto', fontSize: '0.85rem', fontWeight: 600, color: '#64748b' }}>
              Showing {stores.length} {stores.length === 1 ? 'Store' : 'Stores'}
            </div>
          </div>

          {/* Stores Modern Table */}
          {loading ? (
            <div className="admin-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p style={{ marginTop: '12px', color: '#64748b' }}>Loading store directory...</p>
              </div>
            </div>
          ) : stores.length === 0 ? (
            <div className="admin-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: '#64748b' }}>
                <Store size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>No stores found</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto' }}>No registered store listings match your search criteria.</p>
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
            <div className="admin-card" id="stores-table-wrapper">
              <div className="admin-table-wrapper">
                <table className="admin-table" id="stores-table">
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
                    {stores.map((s, index) => {
                      const avatar = getAvatarInfo(s.name, index);
                      return (
                        <tr key={s.id} id={`admin-store-row-${s.id}`}>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <div className={`entity-avatar-box ${avatar.colorClass}`}>
                                {avatar.initials}
                              </div>
                              <div>
                                <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.92rem' }}>
                                  {s.name}
                                </div>
                                <div style={{ marginTop: '2px' }}>
                                  <span className="category-pill">
                                    {s.category || 'Retail Store'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#334155' }}>
                              <Mail size={14} color="#94a3b8" />
                              <span style={{ fontSize: '0.88rem' }}>{s.email}</span>
                            </div>
                          </td>
                          <td style={{ maxWidth: '340px' }} title={s.address}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', color: '#64748b' }}>
                              <MapPin size={14} color="#94a3b8" style={{ marginTop: '3px', flexShrink: 0 }} />
                              <span style={{ fontSize: '0.86rem', lineHeight: '1.4' }}>{s.address}</span>
                            </div>
                          </td>
                          <td>
                            <StarRating
                              value={s.rating || s.average_rating}
                              readOnly={true}
                              showLabel={true}
                              size={17}
                            />
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
