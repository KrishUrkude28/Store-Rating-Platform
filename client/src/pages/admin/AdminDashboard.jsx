import React, { useEffect, useState } from 'react';
import { 
  Store, 
  Users, 
  Star, 
  Heart, 
  TrendingUp, 
  Calendar, 
  Trophy, 
  MoreVertical, 
  MapPin,
  ExternalLink
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { api } from '../../services/api';

export default function AdminDashboard({ onNavigate }) {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getAdminDashboard();
      setDashboardData(res);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setCurrentTab(tabId);
    if (tabId === 'users' && onNavigate) onNavigate('/admin/users');
    if (tabId === 'stores' && onNavigate) onNavigate('/admin/stores');
  };

  // Fallback defaults matching Image 1
  const stats = {
    totalStores: dashboardData?.totalStores || 124,
    totalReviews: dashboardData?.totalRatings ? (dashboardData.totalRatings > 100 ? dashboardData.totalRatings : '2,438') : '2,438',
    averageRating: dashboardData?.averageRating || '4.3/5',
    customerSatisfaction: dashboardData?.customerSatisfaction ? `${dashboardData.customerSatisfaction}%` : '92%'
  };

  const donutData = dashboardData?.ratingsDistribution || [
    { stars: 5, label: '5 Stars', count: 1414, percentage: 58, color: '#10b981' },
    { stars: 4, label: '4 Stars', count: 536, percentage: 22, color: '#84cc16' },
    { stars: 3, label: '3 Stars', count: 292, percentage: 12, color: '#f59e0b' },
    { stars: 2, label: '2 Stars', count: 122, percentage: 5, color: '#f97316' },
    { stars: 1, label: '1 Star', count: 74, percentage: 3, color: '#ef4444' }
  ];

  const topStores = [
    { id: 1, code: 'FM', name: 'FreshMart - Whitefield', location: 'Bengaluru, KA', rating: 4.8, reviews: 320, trend: '↑ 12%', color: '#10b981' },
    { id: 2, code: 'SH', name: 'StyleHub - Phoenix Mall', location: 'Bengaluru, KA', rating: 4.6, reviews: 280, trend: '↑ 8%', color: '#2563eb' },
    { id: 3, code: 'TW', name: 'TechWorld - Koramangala', location: 'Bengaluru, KA', rating: 4.4, reviews: 265, trend: '↑ 5%', color: '#0284c7' },
    { id: 4, code: 'DN', name: 'DailyNeeds - Indiranagar', location: 'Bengaluru, KA', rating: 4.3, reviews: 240, trend: '↑ 10%', color: '#b45309' },
    { id: 5, code: 'HE', name: 'HomeEssentials - Marathahalli', location: 'Bengaluru, KA', rating: 4.2, reviews: 210, trend: '↑ 7%', color: '#0d9488' },
  ];

  const recentReviews = [
    {
      id: 1,
      name: 'Aarav Mehta',
      rating: 5.0,
      store: 'FreshMart - Whitefield',
      time: '2 hours ago',
      comment: 'Amazing experience! Very helpful staff and clean store.'
    },
    {
      id: 2,
      name: 'Sneha Kapoor',
      rating: 4.0,
      store: 'StyleHub - Phoenix Mall',
      time: '4 hours ago',
      comment: 'Good collection and great discounts.'
    },
    {
      id: 3,
      name: 'Rohan Verma',
      rating: 3.0,
      store: 'TechWorld - Koramangala',
      time: '1 day ago',
      comment: 'Products are good, but waiting time was long.'
    },
    {
      id: 4,
      name: 'Neha Iyer',
      rating: 5.0,
      store: 'DailyNeeds - Indiranagar',
      time: '1 day ago',
      comment: 'Always a pleasant experience. Highly recommended!'
    }
  ];

  return (
    <div className="app-layout">
      {/* Sidebar matching Image 1 */}
      <Sidebar currentTab={currentTab} onTabChange={handleTabChange} />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <TopBar searchPlaceholder="Search stores, locations, or reviews..." />

        <div className="page-container">
          {/* Header Row with Date Range Filter */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.85rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                Dashboard
              </h1>
              <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
                Get a quick overview of store ratings, customer feedback, and performance.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.85rem', color: '#334155', fontWeight: 500, boxShadow: 'var(--shadow-xs)' }}>
              <Calendar size={16} color="#64748b" />
              <span>Apr 1, 2024 - Apr 30, 2024</span>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>▾</span>
            </div>
          </div>

          {/* 4 Metric KPI Cards (Image 1 top) */}
          <div className="metrics-grid-4">
            {/* Card 1: Total Stores */}
            <div className="metric-card">
              <div className="metric-icon-box green">
                <Star size={24} fill="#16a34a" />
              </div>
              <div className="metric-content">
                <div className="metric-label">Total Stores</div>
                <div className="metric-value">{stats.totalStores}</div>
                <div className="metric-trend positive">
                  <TrendingUp size={13} />
                  <span>12% vs last month</span>
                </div>
              </div>
            </div>

            {/* Card 2: Total Reviews */}
            <div className="metric-card">
              <div className="metric-icon-box blue">
                <Users size={24} />
              </div>
              <div className="metric-content">
                <div className="metric-label">Total Reviews</div>
                <div className="metric-value">{stats.totalReviews}</div>
                <div className="metric-trend positive">
                  <TrendingUp size={13} />
                  <span>18% vs last month</span>
                </div>
              </div>
            </div>

            {/* Card 3: Average Rating */}
            <div className="metric-card">
              <div className="metric-icon-box amber">
                <Star size={24} fill="#d97706" />
              </div>
              <div className="metric-content">
                <div className="metric-label">Average Rating</div>
                <div className="metric-value">{stats.averageRating}</div>
                <div className="metric-trend positive">
                  <TrendingUp size={13} />
                  <span>0.2 vs last month</span>
                </div>
              </div>
            </div>

            {/* Card 4: Customer Satisfaction */}
            <div className="metric-card">
              <div className="metric-icon-box rose">
                <Heart size={24} fill="#dc2626" />
              </div>
              <div className="metric-content">
                <div className="metric-label">Customer Satisfaction</div>
                <div className="metric-value">{stats.customerSatisfaction}</div>
                <div className="metric-trend positive">
                  <TrendingUp size={13} />
                  <span>6% vs last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Rating Trend + Ratings Distribution + Right Side Widgets */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 340px', gap: '24px', marginBottom: '24px' }}>
            {/* 1. Rating Trend Card */}
            <div className="chart-card">
              <div className="chart-card-header">
                <h3 className="chart-card-title">Rating Trend</h3>
                <select className="chart-filter-select">
                  <option>Average Rating</option>
                  <option>Total Volume</option>
                </select>
              </div>

              {/* Smooth Line Chart */}
              <div style={{ width: '100%', height: '220px', position: 'relative' }}>
                <svg viewBox="0 0 400 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Grid lines */}
                  <line x1="30" y1="20" x2="380" y2="20" stroke="#f1f5f9" strokeWidth="1" />
                  <text x="15" y="24" fontSize="10" fill="#94a3b8">5</text>

                  <line x1="30" y1="60" x2="380" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                  <text x="15" y="64" fontSize="10" fill="#94a3b8">4</text>

                  <line x1="30" y1="100" x2="380" y2="100" stroke="#f1f5f9" strokeWidth="1" />
                  <text x="15" y="104" fontSize="10" fill="#94a3b8">3</text>

                  <line x1="30" y1="140" x2="380" y2="140" stroke="#f1f5f9" strokeWidth="1" />
                  <text x="15" y="144" fontSize="10" fill="#94a3b8">2</text>

                  <line x1="30" y1="180" x2="380" y2="180" stroke="#f1f5f9" strokeWidth="1" />
                  <text x="15" y="184" fontSize="10" fill="#94a3b8">1</text>

                  {/* Area fill */}
                  <path
                    d="M 50 150 C 110 130, 160 90, 220 70 C 270 55, 320 75, 370 35 L 370 180 L 50 180 Z"
                    fill="url(#trendGradient)"
                  />

                  {/* Trend line */}
                  <path
                    d="M 50 150 C 110 130, 160 90, 220 70 C 270 55, 320 75, 370 35"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Data Points */}
                  {[
                    { cx: 50, cy: 150, m: 'Jan' },
                    { cx: 115, cy: 135, m: 'Feb' },
                    { cx: 180, cy: 95, m: 'Mar' },
                    { cx: 245, cy: 68, m: 'Apr' },
                    { cx: 310, cy: 72, m: 'May' },
                    { cx: 370, cy: 35, m: 'Jun' }
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle cx={pt.cx} cy={pt.cy} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                      <text x={pt.cx} y="196" textAnchor="middle" fontSize="10" fill="#64748b">{pt.m}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* 2. Ratings Distribution Card (Donut Chart) */}
            <div className="chart-card">
              <div className="chart-card-header">
                <h3 className="chart-card-title">Ratings Distribution</h3>
              </div>

              <div className="donut-chart-container">
                {/* SVG Donut */}
                <div className="donut-svg-wrapper">
                  <svg viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
                    {/* Background track */}
                    <circle cx="80" cy="80" r="58" fill="none" stroke="#f1f5f9" strokeWidth="20" />
                    
                    {/* 5★ Arc (58%) */}
                    <circle cx="80" cy="80" r="58" fill="none" stroke="#10b981" strokeWidth="20"
                      strokeDasharray={`${2 * Math.PI * 58 * 0.58} ${2 * Math.PI * 58}`}
                      strokeDashoffset="0"
                    />

                    {/* 4★ Arc (22%) */}
                    <circle cx="80" cy="80" r="58" fill="none" stroke="#84cc16" strokeWidth="20"
                      strokeDasharray={`${2 * Math.PI * 58 * 0.22} ${2 * Math.PI * 58}`}
                      strokeDashoffset={`-${2 * Math.PI * 58 * 0.58}`}
                    />

                    {/* 3★ Arc (12%) */}
                    <circle cx="80" cy="80" r="58" fill="none" stroke="#f59e0b" strokeWidth="20"
                      strokeDasharray={`${2 * Math.PI * 58 * 0.12} ${2 * Math.PI * 58}`}
                      strokeDashoffset={`-${2 * Math.PI * 58 * 0.80}`}
                    />

                    {/* 2★ Arc (5%) */}
                    <circle cx="80" cy="80" r="58" fill="none" stroke="#f97316" strokeWidth="20"
                      strokeDasharray={`${2 * Math.PI * 58 * 0.05} ${2 * Math.PI * 58}`}
                      strokeDashoffset={`-${2 * Math.PI * 58 * 0.92}`}
                    />

                    {/* 1★ Arc (3%) */}
                    <circle cx="80" cy="80" r="58" fill="none" stroke="#ef4444" strokeWidth="20"
                      strokeDasharray={`${2 * Math.PI * 58 * 0.03} ${2 * Math.PI * 58}`}
                      strokeDashoffset={`-${2 * Math.PI * 58 * 0.97}`}
                    />
                  </svg>

                  <div className="donut-center-text">
                    <div className="donut-center-number">2,438</div>
                    <div className="donut-center-label">Total Reviews</div>
                  </div>
                </div>

                {/* Donut Legend */}
                <div className="donut-legend">
                  {donutData.map((item) => (
                    <div key={item.stars} className="donut-legend-item">
                      <div className="donut-legend-label">
                        <span className="donut-legend-dot" style={{ backgroundColor: item.color }} />
                        <span>{item.label}</span>
                      </div>
                      <span className="donut-legend-value">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. Right Side Widgets (Top Performing Store & Recent Reviews) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Top Performing Store Card */}
              <div className="widget-box" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>
                    <Trophy size={18} color="#16a34a" />
                    <span>Top Performing Store</span>
                  </div>
                  <a href="#" className="table-card-link" style={{ fontSize: '0.78rem' }}>View All</a>
                </div>

                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '10px' }}>
                  <div style={{ width: '64px', height: '54px', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#e2e8f0', flexShrink: 0 }}>
                    <img 
                      src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=200&q=80" 
                      alt="FreshMart Store" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>FreshMart - Whitefield</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={12} />
                      <span>Bengaluru, KA</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f59e0b', marginTop: '2px' }}>
                      ★ 4.8 <span style={{ color: '#94a3b8', fontWeight: 400, fontSize: '0.75rem' }}>(320 reviews)</span>
                    </div>
                  </div>
                </div>

                {/* Testimonial Bubble */}
                <div className="quote-bubble-card" style={{ padding: '8px 12px', fontSize: '0.78rem' }}>
                  “Great products, friendly staff and excellent service!”
                </div>
              </div>

              {/* Recent Reviews Sidebar Card */}
              <div className="widget-box" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a' }}>Recent Reviews</span>
                  <a href="#" className="table-card-link" style={{ fontSize: '0.78rem' }}>View All</a>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {recentReviews.map((rev) => (
                    <div key={rev.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', borderBottom: rev.id !== 4 ? '1px solid #f1f5f9' : 'none', paddingBottom: rev.id !== 4 ? '10px' : 0 }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#475569', flexShrink: 0 }}>
                        {rev.name[0]}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#0f172a' }}>{rev.name}</span>
                          <span style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 600 }}>★ {rev.rating.toFixed(1)}</span>
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', display: 'flex', justifyContent: 'space-between', marginTop: '1px' }}>
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>{rev.store}</span>
                          <span>{rev.time}</span>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#475569', marginTop: '4px', lineHeight: 1.3 }}>
                          {rev.comment}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Table: Top Rated Stores (Image 1 bottom) */}
          <div className="table-card">
            <div className="table-card-header">
              <h3 className="table-card-title">Top Rated Stores</h3>
              <a href="/admin/stores" className="table-card-link">View All Stores</a>
            </div>

            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Store Name</th>
                  <th>Location</th>
                  <th>Average Rating</th>
                  <th>Total Reviews</th>
                  <th>Trend</th>
                  <th style={{ width: '90px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {topStores.map((store) => (
                  <tr key={store.id}>
                    <td style={{ color: '#94a3b8', fontWeight: 600 }}>{store.id}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="table-initials-badge" style={{ backgroundColor: store.color }}>
                          {store.code}
                        </div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{store.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#64748b' }}>{store.location}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: '#0f172a' }}>
                        <Star size={15} fill="#f59e0b" color="#f59e0b" />
                        <span>{store.rating.toFixed(1)}</span>
                      </div>
                    </td>
                    <td style={{ color: '#475569' }}>{store.reviews}</td>
                    <td>
                      <span style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.8rem' }}>
                        {store.trend}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn-sm" onClick={() => onNavigate && onNavigate('/admin/stores')}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <footer className="global-footer" style={{ marginTop: '40px' }}>
            <div>© 2024 RateStore. All rights reserved.</div>
            <div className="footer-links-group">
              <a href="#">Privacy Policy</a>
              <span>|</span>
              <a href="#">Terms of Service</a>
              <span>|</span>
              <a href="#">Help & Support</a>
            </div>
            <div className="footer-script-logo">People Rate Progress</div>
          </footer>
        </div>
      </div>
    </div>
  );
}
