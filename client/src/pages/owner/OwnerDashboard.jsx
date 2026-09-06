import React, { useEffect, useState } from 'react';
import { 
  Store, 
  Users, 
  Star, 
  ThumbsUp, 
  TrendingUp, 
  MapPin, 
  Mail, 
  Trophy, 
  ChevronDown,
  UserCheck
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function OwnerDashboard({ onNavigate }) {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOwnerDashboard();
  }, []);

  const fetchOwnerDashboard = async () => {
    try {
      setLoading(true);
      const res = await api.getOwnerDashboard();
      setDashboardData(res);
    } catch (err) {
      console.error('Failed to load owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tabId) => {
    setCurrentTab(tabId);
    if (tabId === 'password' && onNavigate) onNavigate('/change-password');
  };

  // Fallback defaults matching Image 3
  const store = dashboardData?.store || {
    name: 'FreshMart',
    address: 'Whitefield, Bengaluru, KA',
    email: 'freshmart@store.com',
    averageRating: 4.8,
    totalRatings: 320,
    category: 'Grocery'
  };

  const distribution = dashboardData?.ratingsDistribution || [
    { stars: 5, label: '5 Stars', percentage: 58, color: '#10b981' },
    { stars: 4, label: '4 Stars', percentage: 22, color: '#84cc16' },
    { stars: 3, label: '3 Stars', percentage: 12, color: '#f59e0b' },
    { stars: 2, label: '2 Stars', percentage: 5, color: '#f97316' },
    { stars: 1, label: '1 Star', percentage: 3, color: '#ef4444' }
  ];

  const raters = dashboardData?.raters && dashboardData.raters.length > 0 ? dashboardData.raters : [
    { ratingId: 1, userName: 'Aarav Mehta', rating: 5, review: 'Great products, friendly staff and excellent service!', createdAt: '2024-04-28' },
    { ratingId: 2, userName: 'Sneha Kapoor', rating: 4, review: 'Good collection and reasonable prices.', createdAt: '2024-04-26' },
    { ratingId: 3, userName: 'Karan Shah', rating: 5, review: 'Always a pleasant experience. Highly recommended!', createdAt: '2024-04-24' },
    { ratingId: 4, userName: 'Priya Iyer', rating: 4, review: 'Well organized store with fresh products.', createdAt: '2024-04-22' },
    { ratingId: 5, userName: 'Aditya Nair', rating: 5, review: 'Best grocery store in the area. Keep it up!', createdAt: '2024-04-20' },
  ];

  return (
    <div className="app-layout">
      {/* Sidebar matching Image 3 (Emerald Green active) */}
      <Sidebar currentTab={currentTab} onTabChange={handleTabChange} />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <TopBar searchPlaceholder="Search reviews, customers, or feedback..." />

        <div className="page-container">
          {/* Welcome Greeting Row (Image 3) */}
          <div style={{ marginBottom: '20px' }}>
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.6rem', fontWeight: 700, color: '#0f172a' }}>
              Welcome back, {user?.name?.split(' ')[0] || 'Rohan Mehta'} 👋
            </h1>
            <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Store Owner</span>
          </div>

          {/* Store Hero Banner Card (Image 3) */}
          <div className="owner-store-banner">
            <div className="owner-banner-img-wrap">
              <img
                src="https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80"
                alt={store.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div className="owner-banner-details">
              <h2>{store.name}</h2>
              <div className="owner-banner-meta">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={14} color="#64748b" />
                  <span>{store.address}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Mail size={14} color="#64748b" />
                  <span>{store.email}</span>
                </div>
              </div>

              <div className="owner-category-tags">
                <span className="owner-tag-pill">Grocery</span>
                <span className="owner-tag-pill">Daily Essentials</span>
                <span className="owner-tag-pill">Household</span>
              </div>
            </div>

            {/* Right side banner graphic & button */}
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100px' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-script)', fontSize: '1.2rem', color: '#16a34a' }}>
                  Quality Products Happier Communities
                </div>
                <div style={{ fontSize: '0.8rem', fontStyle: 'italic', color: '#64748b', marginTop: '2px' }}>
                  “Great experiences build loyal customers.”
                </div>
              </div>

              <button
                className="action-btn-sm"
                style={{ borderColor: '#10b981', color: '#10b981', backgroundColor: '#f0fdf4', padding: '8px 16px', borderRadius: '8px' }}
              >
                View Store Details
              </button>
            </div>
          </div>

          {/* 4 Metric KPI Cards (Image 3) */}
          <div className="metrics-grid-4">
            {/* 1. Average Rating */}
            <div className="metric-card">
              <div className="metric-icon-box amber">
                <Star size={24} fill="#d97706" />
              </div>
              <div className="metric-content">
                <div className="metric-label">Average Rating</div>
                <div className="metric-value">{store.averageRating ? Number(store.averageRating).toFixed(1) : '4.8'} / 5</div>
                <div className="metric-trend positive">
                  <TrendingUp size={13} />
                  <span>0.3 vs last month</span>
                </div>
              </div>
            </div>

            {/* 2. Total Reviews */}
            <div className="metric-card">
              <div className="metric-icon-box blue">
                <Users size={24} />
              </div>
              <div className="metric-content">
                <div className="metric-label">Total Reviews</div>
                <div className="metric-value">{store.totalRatings || 320}</div>
                <div className="metric-trend positive">
                  <TrendingUp size={13} />
                  <span>12% vs last month</span>
                </div>
              </div>
            </div>

            {/* 3. Unique Customers */}
            <div className="metric-card">
              <div className="metric-icon-box emerald">
                <UserCheck size={24} />
              </div>
              <div className="metric-content">
                <div className="metric-label">Unique Customers</div>
                <div className="metric-value">{dashboardData?.uniqueCustomers || 285}</div>
                <div className="metric-trend positive">
                  <TrendingUp size={13} />
                  <span>10% vs last month</span>
                </div>
              </div>
            </div>

            {/* 4. Positive Feedback */}
            <div className="metric-card">
              <div className="metric-icon-box rose">
                <ThumbsUp size={24} fill="#dc2626" />
              </div>
              <div className="metric-content">
                <div className="metric-label">Positive Feedback</div>
                <div className="metric-value">{dashboardData?.positiveFeedback ? `${dashboardData.positiveFeedback}%` : '92%'}</div>
                <div className="metric-trend positive">
                  <TrendingUp size={13} />
                  <span>6% vs last month</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Row: Rating Distribution (Bars) + Rating Trend + Keep Going Card */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 300px', gap: '24px', marginBottom: '24px' }}>
            {/* 1. Rating Distribution Horizontal Bars */}
            <div className="chart-card">
              <div className="chart-card-header">
                <h3 className="chart-card-title">Rating Distribution</h3>
              </div>

              <div className="rating-bars-list">
                {distribution.map((item) => (
                  <div key={item.stars} className="rating-bar-row">
                    <span className="rating-bar-label">{item.label}</span>
                    <div className="rating-bar-track">
                      <div
                        className="rating-bar-fill"
                        style={{
                          width: `${item.percentage}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                    <span className="rating-bar-pct">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Rating Trend Line Chart */}
            <div className="chart-card">
              <div className="chart-card-header">
                <h3 className="chart-card-title">Rating Trend</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#64748b', border: '1px solid #e2e8f0', padding: '4px 10px', borderRadius: '6px' }}>
                  <span>Last 6 Months</span>
                  <ChevronDown size={14} />
                </div>
              </div>

              <div style={{ width: '100%', height: '180px' }}>
                <svg viewBox="0 0 360 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                  <defs>
                    <linearGradient id="ownerTrendGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Guide Lines */}
                  {[20, 50, 80, 110, 140].map((y, idx) => (
                    <g key={idx}>
                      <line x1="30" y1={y} x2="350" y2={y} stroke="#f1f5f9" strokeWidth="1" />
                      <text x="15" y={y + 4} fontSize="9" fill="#94a3b8">{5 - idx}</text>
                    </g>
                  ))}

                  {/* Area Fill */}
                  <path
                    d="M 45 125 C 100 110, 150 75, 210 65 C 260 55, 300 45, 340 28 L 340 140 L 45 140 Z"
                    fill="url(#ownerTrendGrad)"
                  />

                  {/* Line */}
                  <path
                    d="M 45 125 C 100 110, 150 75, 210 65 C 260 55, 300 45, 340 28"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  {/* Dots */}
                  {[
                    { cx: 45, cy: 125, m: 'Jan' },
                    { cx: 105, cy: 112, m: 'Feb' },
                    { cx: 165, cy: 82, m: 'Mar' },
                    { cx: 225, cy: 68, m: 'Apr' },
                    { cx: 285, cy: 52, m: 'May' },
                    { cx: 340, cy: 28, m: 'Jun' }
                  ].map((pt, i) => (
                    <g key={i}>
                      <circle cx={pt.cx} cy={pt.cy} r="4" fill="#ffffff" stroke="#10b981" strokeWidth="2.5" />
                      <text x={pt.cx} y="155" textAnchor="middle" fontSize="10" fill="#64748b">{pt.m}</text>
                    </g>
                  ))}
                </svg>
              </div>
            </div>

            {/* 3. Keep Going! Trophy Card (Image 3) */}
            <div className="widget-box" style={{ background: 'linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 100%)', border: '1px solid #bbf7d0', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', padding: '24px' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '50%', backgroundColor: '#fef08a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                <Trophy size={28} color="#d97706" />
              </div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Keep Going!
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#475569', lineHeight: 1.4 }}>
                Your store is rated higher than <span style={{ fontWeight: 700, color: '#16a34a' }}>87%</span> of similar stores in your area.
              </p>
            </div>
          </div>

          {/* Bottom Table: Recent Reviews (Image 3) */}
          <div className="table-card">
            <div className="table-card-header">
              <h3 className="table-card-title">Recent Reviews</h3>
              <a href="#" className="table-card-link">View All Reviews</a>
            </div>

            <table className="custom-table">
              <thead>
                <tr>
                  <th style={{ width: '50px' }}>#</th>
                  <th>Customer Name</th>
                  <th>Rating</th>
                  <th>Review</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {raters.map((r, idx) => (
                  <tr key={r.ratingId || idx}>
                    <td style={{ color: '#94a3b8', fontWeight: 600 }}>{idx + 1}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>
                          {r.userName[0]}
                        </div>
                        <span style={{ fontWeight: 600, color: '#0f172a' }}>{r.userName}</span>
                      </div>
                    </td>
                    <td>
                      <div className="stars-row">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            size={14}
                            fill={s <= r.rating ? '#f59e0b' : '#e2e8f0'}
                            color={s <= r.rating ? '#f59e0b' : '#e2e8f0'}
                          />
                        ))}
                      </div>
                    </td>
                    <td style={{ color: '#475569', maxWidth: '400px' }}>
                      {r.review || 'Great products, friendly staff and excellent service!'}
                    </td>
                    <td style={{ color: '#64748b', fontSize: '0.8rem' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Apr 28, 2024'}
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
          </footer>
        </div>
      </div>
    </div>
  );
}
