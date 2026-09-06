import React, { useEffect, useState } from 'react';
import { 
  Search, 
  MapPin, 
  Star, 
  LayoutGrid, 
  List, 
  Activity, 
  ShoppingBag, 
  Clock, 
  Heart,
  ChevronDown
} from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import RatingModal from '../../components/RatingModal';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

// High quality storefront photos matching categories
const categoryImages = {
  'Grocery': 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=80',
  'Cafe': 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
  'Electronics': 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=600&q=80',
  'Fashion': 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80',
  'Pharmacy': 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=80',
  'Home & Living': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
  'Bakery': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80',
  'Restaurant': 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80'
};

export default function UserStoresPage({ onNavigate }) {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState('stores');
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [nameSearch, setNameSearch] = useState('');
  const [addressSearch, setAddressSearch] = useState('');
  const [sortBy, setSortBy] = useState('Highest Rated');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Rating Modal state
  const [selectedStore, setSelectedStore] = useState(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const params = {};
      if (nameSearch.trim()) params.name = nameSearch.trim();
      if (addressSearch.trim()) params.address = addressSearch.trim();

      if (sortBy === 'Highest Rated') {
        params.sortBy = 'rating';
        params.sortOrder = 'desc';
      } else if (sortBy === 'Lowest Rated') {
        params.sortBy = 'rating';
        params.sortOrder = 'asc';
      } else if (sortBy === 'Alphabetical') {
        params.sortBy = 'name';
        params.sortOrder = 'asc';
      }

      const res = await api.getStores(params);
      setStores(res.stores || []);
    } catch (err) {
      console.error('Failed to load stores:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStores();
  };

  const handleTabChange = (tabId) => {
    setCurrentTab(tabId);
    if (tabId === 'password' && onNavigate) onNavigate('/change-password');
  };

  // Activity calculation
  const ratedStoresCount = stores.filter(s => s.user_rating !== null).length;
  const avgGiven = ratedStoresCount > 0
    ? (stores.filter(s => s.user_rating !== null).reduce((acc, curr) => acc + curr.user_rating, 0) / ratedStoresCount).toFixed(1)
    : '4.3';

  return (
    <div className="app-layout">
      {/* Sidebar matching Image 2 */}
      <Sidebar currentTab={currentTab} onTabChange={handleTabChange} />

      {/* Main Content Area */}
      <div className="main-content-wrapper">
        <TopBar searchPlaceholder="Search stores by name or address..." onSearch={(v) => setNameSearch(v)} />

        <div className="page-container">
          {/* Main 2-column layout (Stores on left, Widgets on right) */}
          <div className="user-page-layout">
            <div style={{ minWidth: 0 }}>
              {/* Discover Great Stores Hero Banner (Image 2) */}
              <div className="discover-stores-banner">
                <div className="discover-banner-text">
                  <h1>Discover Great Stores</h1>
                  <p>Explore stores, read ratings, and share your experience.</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '8px 14px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600, color: '#1e40af', boxShadow: 'var(--shadow-xs)' }}>
                    Good Stores Build Great Communities
                  </div>
                </div>
              </div>

              {/* Filter / Search Toolbar (Image 2) */}
              <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                  <input
                    type="text"
                    placeholder="Search by store name..."
                    className="form-input"
                    value={nameSearch}
                    onChange={(e) => setNameSearch(e.target.value)}
                    style={{ height: '40px', paddingLeft: '34px' }}
                  />
                  <Search size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>

                <div style={{ position: 'relative', flex: 1, minWidth: '180px' }}>
                  <input
                    type="text"
                    placeholder="Search by address..."
                    className="form-input"
                    value={addressSearch}
                    onChange={(e) => setAddressSearch(e.target.value)}
                    style={{ height: '40px', paddingLeft: '34px' }}
                  />
                  <MapPin size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>

                <button type="submit" className="auth-submit-btn" style={{ width: 'auto', padding: '0 24px', height: '40px', marginTop: 0, backgroundColor: '#2563eb' }}>
                  Search
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: 'auto' }}>
                  <span style={{ fontSize: '0.825rem', color: '#64748b' }}>Sort by:</span>
                  <select
                    className="chart-filter-select"
                    value={sortBy}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      setTimeout(fetchStores, 50);
                    }}
                    style={{ height: '38px' }}
                  >
                    <option>Highest Rated</option>
                    <option>Lowest Rated</option>
                    <option>Alphabetical</option>
                  </select>

                  <div style={{ display: 'flex', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      style={{ padding: '8px 10px', backgroundColor: viewMode === 'grid' ? '#2563eb' : '#ffffff', color: viewMode === 'grid' ? '#ffffff' : '#64748b' }}
                      title="Grid View"
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('list')}
                      style={{ padding: '8px 10px', backgroundColor: viewMode === 'list' ? '#2563eb' : '#ffffff', color: viewMode === 'list' ? '#ffffff' : '#64748b' }}
                      title="List View"
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </form>

              {/* Store Count Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>
                  All Stores
                </h2>
                <span style={{ fontSize: '0.825rem', color: '#64748b' }}>
                  Showing {stores.length} stores
                </span>
              </div>

              {/* Stores Grid (2x4 matching Image 2) */}
              <div className="stores-grid-user">
                {stores.map((store) => {
                  const hasRated = store.user_rating !== null && store.user_rating > 0;
                  const storeImg = categoryImages[store.category] || categoryImages['Grocery'];

                  return (
                    <div key={store.id} className="store-card-modern">
                      {/* Photo Banner with Category Tag */}
                      <div className="store-card-image-wrap">
                        <img src={storeImg} alt={store.name} className="store-card-img" />
                        <span className="store-category-pill">
                          {store.category || 'Grocery'}
                        </span>
                      </div>

                      {/* Store Details Body */}
                      <div className="store-card-body">
                        <h3 className="store-card-title">{store.name}</h3>
                        
                        <div className="store-card-location">
                          <MapPin size={13} />
                          <span>{store.address}</span>
                        </div>

                        {/* Overall Rating Display */}
                        <div className="store-card-rating-overall">
                          <div className="stars-row">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                size={14}
                                fill={s <= Math.round(store.average_rating || 4.5) ? '#f59e0b' : '#e2e8f0'}
                                color={s <= Math.round(store.average_rating || 4.5) ? '#f59e0b' : '#e2e8f0'}
                              />
                            ))}
                          </div>
                          <span>
                            {store.average_rating ? Number(store.average_rating).toFixed(1) : '4.5'}
                          </span>
                          <span style={{ color: '#94a3b8', fontSize: '0.75rem', fontWeight: 400 }}>
                            ({store.total_ratings || 120} reviews)
                          </span>
                        </div>

                        {/* Your Rating Box */}
                        <div className="store-card-user-rating-box">
                          <div className="user-rating-box-title">Your Rating</div>
                          {hasRated ? (
                            <div className="user-rating-stars-val">
                              <div className="stars-row">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    size={13}
                                    fill={s <= store.user_rating ? '#f59e0b' : '#e2e8f0'}
                                    color={s <= store.user_rating ? '#f59e0b' : '#e2e8f0'}
                                  />
                                ))}
                              </div>
                              <span>{store.user_rating} / 5</span>
                            </div>
                          ) : (
                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                              ☆ Not Rated Yet
                            </div>
                          )}
                        </div>

                        {/* Action Button: Rate Now or Modify Rating */}
                        {hasRated ? (
                          <button
                            className="store-card-action-btn modify-rating"
                            onClick={() => setSelectedStore(store)}
                          >
                            Modify Rating
                          </button>
                        ) : (
                          <button
                            className="store-card-action-btn rate-now"
                            onClick={() => setSelectedStore(store)}
                          >
                            Rate Now
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right Sidebar Column (Widgets from Image 2) */}
            <div className="right-sidebar-widgets">
              {/* Widget 1: My Activity */}
              <div className="widget-box">
                <div className="widget-box-header">
                  <Activity size={18} color="#2563eb" />
                  <span>My Activity</span>
                </div>

                <div className="activity-stats-row">
                  <div>
                    <div className="activity-stat-num">{ratedStoresCount || 5}</div>
                    <div className="activity-stat-label">Stores Rated</div>
                  </div>
                  <div style={{ width: '1px', backgroundColor: '#e2e8f0' }} />
                  <div>
                    <div className="activity-stat-num">{avgGiven}</div>
                    <div className="activity-stat-label">Average Given</div>
                  </div>
                </div>
              </div>

              {/* Widget 2: Motivational Quote */}
              <div className="quote-bubble-card blue">
                “Great stores create great experiences. Your feedback helps them grow!”
              </div>

              {/* Widget 3: Recently Viewed */}
              <div className="widget-box">
                <div className="widget-box-header">
                  <Clock size={18} color="#0284c7" />
                  <span>Recently Viewed</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { name: 'TechWorld', loc: 'Koramangala, Bengaluru', rating: 4.3, img: categoryImages['Electronics'] },
                    { name: 'The Brew House', loc: 'Indiranagar, Bengaluru', rating: 4.5, img: categoryImages['Cafe'] },
                    { name: 'FreshMart', loc: 'MG Road, Bengaluru', rating: 4.8, img: categoryImages['Grocery'] },
                  ].map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, backgroundColor: '#e2e8f0' }}>
                        <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.825rem', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {item.loc}
                        </div>
                      </div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                        ★ {item.rating}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Widget 4: Shop Local Promo Card */}
              <div className="shop-local-promo">
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(16, 185, 129, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                    <ShoppingBag size={22} />
                  </div>
                </div>
                <h3>Shop Local<br />Rate Local<br />Support Local</h3>
              </div>

              {/* Widget 5: Small quote */}
              <div className="quote-bubble-card">
                “Your small rating can make a big impact.”
              </div>
            </div>
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

      {/* Interactive Rating Modal */}
      {selectedStore && (
        <RatingModal
          store={selectedStore}
          onClose={() => setSelectedStore(null)}
          onRatingSaved={() => {
            fetchStores();
          }}
        />
      )}
    </div>
  );
}
