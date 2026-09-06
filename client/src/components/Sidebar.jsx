import React from 'react';
import { 
  LayoutDashboard, 
  Store, 
  MessageSquare, 
  BarChart2, 
  Users, 
  FileText, 
  Settings, 
  User, 
  Lock, 
  LogOut,
  ShoppingBag
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentTab, onTabChange }) {
  const { user, logout } = useAuth();
  const role = user?.role || 'USER';

  // Role taglines
  const taglines = {
    ADMIN: 'Better Stores. Happier Customers.',
    USER: 'Discover. Rate. Support.',
    STORE_OWNER: 'Better Reviews. Brighter Business.'
  };

  const getAdminNav = () => [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'stores', label: 'Stores', icon: Store },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare },
    { id: 'insights', label: 'Ratings & Insights', icon: BarChart2 },
    { id: 'users', label: 'Manage Users', icon: Users },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const getUserNav = () => [
    { id: 'stores', label: 'Browse Stores', icon: Store },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: 'logout', label: 'Logout', icon: LogOut, action: logout },
  ];

  const getOwnerNav = () => [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'store', label: 'My Store', icon: Store },
    { id: 'reviews', label: 'Ratings & Reviews', icon: MessageSquare },
    { id: 'password', label: 'Change Password', icon: Lock },
    { id: 'logout', label: 'Logout', icon: LogOut, action: logout },
  ];

  const navItems = role === 'ADMIN' ? getAdminNav() : role === 'STORE_OWNER' ? getOwnerNav() : getUserNav();
  const activeClass = role === 'STORE_OWNER' ? 'active-green' : 'active-blue';

  return (
    <aside className="sidebar">
      {/* Sidebar Logo */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon">
          <Store size={22} />
        </div>
        <div className="sidebar-brand-text">
          <h2>RateStore</h2>
          <p>{taglines[role] || 'Real People. Real Ratings.'}</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              className={`sidebar-nav-item ${isActive ? activeClass : ''}`}
              onClick={() => {
                if (item.action) {
                  item.action();
                } else if (onTabChange) {
                  onTabChange(item.id);
                }
              }}
            >
              <Icon size={19} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Role-Specific Bottom Widget */}
      <div className="sidebar-bottom-widget">
        <div className="sidebar-widget-illustration">
          {role === 'USER' ? (
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <rect x="16" y="24" width="32" height="34" rx="4" fill="#3b82f6" fillOpacity="0.4" />
              <path d="M24 24V18C24 13.5817 27.5817 10 32 10C36.4183 10 40 13.5817 40 18V24" stroke="#60a5fa" strokeWidth="3" strokeLinecap="round" />
              <circle cx="32" cy="41" r="5" fill="#38bdf8" />
              <path d="M42 48C42 42 48 38 48 38C48 44 42 48 42 48Z" fill="#10b981" />
              <path d="M42 48C38 46 36 40 36 40C40 40 42 48 42 48Z" fill="#34d399" />
            </svg>
          ) : (
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
              <path d="M12 28L32 14L52 28V52H12V28Z" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
              <rect x="22" y="34" width="20" height="18" rx="2" fill="#0284c7" fillOpacity="0.5" stroke="#38bdf8" strokeWidth="1.5" />
              <circle cx="32" cy="42" r="3" fill="#10b981" />
              <path d="M8 28H56L52 22H12L8 28Z" fill="#10b981" fillOpacity="0.7" />
              <circle cx="16" cy="52" r="6" fill="#10b981" fillOpacity="0.4" />
              <circle cx="48" cy="52" r="6" fill="#10b981" fillOpacity="0.4" />
            </svg>
          )}
        </div>

        {role === 'ADMIN' && (
          <>
            <h4>Your Feedback Builds a Better Tomorrow</h4>
            <p>Trusted Reviews. Stronger Communities.</p>
          </>
        )}

        {role === 'USER' && (
          <>
            <h4>Your Ratings Make a Difference</h4>
            <p>Support great stores. Build stronger communities.</p>
          </>
        )}

        {role === 'STORE_OWNER' && (
          <>
            <h4>Happy Customers Stronger Tomorrow</h4>
            <p>Your Store. Their Feedback. A Brighter Future.</p>
          </>
        )}
      </div>
    </aside>
  );
}
