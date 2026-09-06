import React, { useState } from 'react';
import { 
  Store, 
  Search, 
  Star, 
  Users, 
  Heart, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Coffee,
  Settings
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (user) {
      window.location.href = '/user/stores';
    } else {
      window.location.href = `/login?redirect=/user/stores`;
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff' }}>
      {/* Top Navigation Bar */}
      <header className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className="sidebar-logo-icon">
            <Store size={22} />
          </div>
          <div>
            <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: '#0f172a', letterSpacing: '-0.02em' }}>
              RateStore
            </span>
            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Real People. Real Ratings.</div>
          </div>
        </div>

        {/* Center Links */}
        <nav className="landing-nav-links">
          <a href="/" className="landing-nav-link active">Home</a>
          <a href={user ? "/user/stores" : "/login"} className="landing-nav-link">Stores</a>
          <a href="#how-it-works" className="landing-nav-link">How It Works</a>
          <a href="#about" className="landing-nav-link">About</a>
        </nav>

        {/* Right Auth Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button style={{ color: '#64748b', padding: '8px' }} title="Search">
            <Search size={20} />
          </button>
          
          {user ? (
            <a
              href={user.role === 'ADMIN' ? '/admin/dashboard' : user.role === 'STORE_OWNER' ? '/owner/dashboard' : '/user/stores'}
              className="action-btn-sm"
              style={{ padding: '8px 18px', borderColor: '#16a34a', color: '#16a34a', fontWeight: 600 }}
            >
              Go to Dashboard
            </a>
          ) : (
            <>
              <a
                href="/login"
                className="action-btn-sm"
                style={{ padding: '8px 20px', borderRadius: '9999px', fontWeight: 600 }}
              >
                Login
              </a>
              <a
                href="/register"
                className="landing-search-btn"
                style={{ padding: '8px 22px', fontSize: '0.875rem' }}
              >
                Sign Up
              </a>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-left">
          <h1>
            Discover Great Stores <span className="highlight-green">Around You</span>
          </h1>
          <p className="landing-hero-subtitle">
            Read genuine reviews, share your experience, and support local businesses.
          </p>

          {/* Search Bar with Green Action Button */}
          <form className="landing-search-bar" onSubmit={handleSearchSubmit}>
            <Search size={20} color="#94a3b8" style={{ alignSelf: 'center', marginRight: '10px' }} />
            <input
              type="text"
              placeholder="Search stores by name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button type="submit" className="landing-search-btn">
              Search
            </button>
          </form>

          {/* Value Badges */}
          <div className="landing-badges-row">
            <div className="landing-badge-item">
              <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                <Star size={13} fill="#16a34a" />
              </div>
              <span>Real Reviews</span>
            </div>

            <div className="landing-badge-item">
              <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                <Users size={13} />
              </div>
              <span>Trusted Community</span>
            </div>

            <div className="landing-badge-item">
              <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                <Store size={13} />
              </div>
              <span>Support Local Businesses</span>
            </div>

            <div className="landing-badge-item">
              <div style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a' }}>
                <Heart size={13} fill="#16a34a" />
              </div>
              <span>Better Choices</span>
            </div>
          </div>

          {/* Cursive Tagline */}
          <div style={{ marginTop: '16px' }}>
            <span className="script-tagline">Small Reviews. Big Impact.</span>
          </div>
        </div>

        {/* Right Hero Image - Street Cafe Storefront (Image 4) */}
        <div className="landing-hero-img-wrap">
          <img
            src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80"
            alt="The Daily Brew coffee storefront with outdoor cafe seating"
          />
          <div style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '12px 18px',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '0.825rem',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>THE DAILY BREW</div>
            <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>COFFEE • PEOPLE • GOOD VIBES</div>
          </div>
        </div>
      </section>

      {/* Section 2: A Platform for a Stronger Community */}
      <section className="community-section" id="how-it-works">
        <div className="section-header-center">
          <h2>A Platform for a Stronger Community</h2>
          <p>Different roles. A shared purpose.</p>
        </div>

        <div className="community-cards-grid">
          {/* Card 1: For Customers */}
          <div className="community-card customers">
            <div className="community-icon-circle">
              <Users size={24} />
            </div>
            <h3>For Customers</h3>
            <p>Discover stores, share ratings, and help others make better choices.</p>
            <a href="/register" className="community-link" style={{ color: '#16a34a' }}>
              <span>Get Started</span>
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Card 2: For Store Owners */}
          <div className="community-card owners">
            <div className="community-icon-circle">
              <Store size={24} />
            </div>
            <h3>For Store Owners</h3>
            <p>View your store's ratings, understand customer feedback, and grow your business.</p>
            <a href="/login" className="community-link" style={{ color: '#d97706' }}>
              <span>Learn More</span>
              <ArrowRight size={16} />
            </a>
          </div>

          {/* Card 3: For Administrators */}
          <div className="community-card admins">
            <div className="community-icon-circle">
              <Settings size={24} />
            </div>
            <h3>For Administrators</h3>
            <p>Manage stores, users, and platform data to ensure a trusted community.</p>
            <a href="/login" className="community-link" style={{ color: '#2563eb' }}>
              <span>Learn More</span>
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* Section 3: Platform Stats Bar (Image 4 bottom) */}
      <div className="landing-stats-bar">
        <div className="stats-items-group">
          <div className="stats-item">
            <Store size={26} className="stats-item-icon" />
            <div>
              <div className="stats-num">500+</div>
              <div className="stats-sub">Stores Listed</div>
            </div>
          </div>

          <div className="stats-item">
            <Users size={26} className="stats-item-icon" />
            <div>
              <div className="stats-num">10K+</div>
              <div className="stats-sub">Reviews Shared</div>
            </div>
          </div>

          <div className="stats-item">
            <Heart size={26} className="stats-item-icon" />
            <div>
              <div className="stats-num">5K+</div>
              <div className="stats-sub">Happy Users</div>
            </div>
          </div>
        </div>

        <div className="stats-quote-right">
          “Stronger local businesses create stronger communities.”
        </div>
      </div>

      {/* Global Footer */}
      <footer className="global-footer" style={{ maxWidth: '1320px', margin: '0 auto', border: 'none' }}>
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
  );
}
