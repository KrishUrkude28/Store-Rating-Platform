import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Star, Shield, Store, Users, KeyRound, LogOut, LayoutDashboard, UserCheck } from 'lucide-react';

export default function Navbar({ currentPath, onNavigate }) {
  const { user, isAuthenticated, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    onNavigate('/login');
  };

  const roleClassMap = {
    ADMIN: 'role-admin',
    USER: 'role-user',
    STORE_OWNER: 'role-owner'
  };

  const roleLabelMap = {
    ADMIN: 'Administrator',
    USER: 'Normal User',
    STORE_OWNER: 'Store Owner'
  };

  return (
    <nav className="navbar" id="app-navbar">
      <div className="navbar-inner">
        <a
          href="#home"
          className="navbar-brand"
          onClick={(e) => {
            e.preventDefault();
            if (isAuthenticated) {
              if (user.role === 'ADMIN') onNavigate('/admin/dashboard');
              else if (user.role === 'STORE_OWNER') onNavigate('/owner/dashboard');
              else onNavigate('/user/stores');
            } else {
              onNavigate('/login');
            }
          }}
        >
          <div className="navbar-brand-icon">
            <Star size={20} fill="#ffffff" />
          </div>
          <span>StoreRating</span>
        </a>

        <div className="navbar-nav">
          {isAuthenticated ? (
            <>
              {/* ADMIN Navigation */}
              {user.role === 'ADMIN' && (
                <>
                  <a
                    href="#dashboard"
                    className={`nav-link ${currentPath === '/admin/dashboard' ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onNavigate('/admin/dashboard'); }}
                    id="nav-admin-dashboard"
                  >
                    <LayoutDashboard size={17} />
                    <span>Dashboard</span>
                  </a>
                  <a
                    href="#users"
                    className={`nav-link ${currentPath.startsWith('/admin/users') ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onNavigate('/admin/users'); }}
                    id="nav-admin-users"
                  >
                    <Users size={17} />
                    <span>Users</span>
                  </a>
                  <a
                    href="#stores"
                    className={`nav-link ${currentPath.startsWith('/admin/stores') ? 'active' : ''}`}
                    onClick={(e) => { e.preventDefault(); onNavigate('/admin/stores'); }}
                    id="nav-admin-stores"
                  >
                    <Store size={17} />
                    <span>Stores</span>
                  </a>
                </>
              )}

              {/* USER Navigation */}
              {user.role === 'USER' && (
                <a
                  href="#stores"
                  className={`nav-link ${currentPath === '/user/stores' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate('/user/stores'); }}
                  id="nav-user-stores"
                >
                  <Store size={17} />
                  <span>Browse Stores</span>
                </a>
              )}

              {/* STORE_OWNER Navigation */}
              {user.role === 'STORE_OWNER' && (
                <a
                  href="#owner-dashboard"
                  className={`nav-link ${currentPath === '/owner/dashboard' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); onNavigate('/owner/dashboard'); }}
                  id="nav-owner-dashboard"
                >
                  <LayoutDashboard size={17} />
                  <span>Store Dashboard</span>
                </a>
              )}

              {/* Universal Change Password */}
              <a
                href="#change-password"
                className={`nav-link ${currentPath === '/change-password' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); onNavigate('/change-password'); }}
                id="nav-change-password"
              >
                <KeyRound size={17} />
                <span>Password</span>
              </a>

              {/* User profile & Role Badge */}
              <div className="user-profile-badge" title={user.email}>
                <span className={`user-role-tag ${roleClassMap[user.role] || ''}`}>
                  {roleLabelMap[user.role] || user.role}
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#e5e7eb' }}>
                  {user.name.split(' ')[0]}
                </span>
              </div>

              {/* Logout Button */}
              <button
                className="btn btn-secondary btn-sm"
                onClick={handleLogout}
                id="btn-logout"
                title="Log out of system"
              >
                <LogOut size={15} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <a
                href="#login"
                className={`nav-link ${currentPath === '/login' ? 'active' : ''}`}
                onClick={(e) => { e.preventDefault(); onNavigate('/login'); }}
                id="nav-login"
              >
                <span>Login</span>
              </a>
              <a
                href="#register"
                className={`btn btn-primary btn-sm`}
                onClick={(e) => { e.preventDefault(); onNavigate('/register'); }}
                id="nav-register"
              >
                <UserCheck size={16} />
                <span>Register</span>
              </a>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
