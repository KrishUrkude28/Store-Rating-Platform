import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, ChevronDown, Lock, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function TopBar({ searchPlaceholder = 'Search stores, locations, or reviews...', onSearch }) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  const getRoleDisplayName = (r) => {
    if (r === 'ADMIN') return 'Admin';
    if (r === 'STORE_OWNER') return 'Store Owner';
    return 'Normal User';
  };

  // Extract clean initials
  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const notificationCount = user?.role === 'ADMIN' ? 3 : user?.role === 'STORE_OWNER' ? 3 : 2;

  return (
    <header className="top-bar">
      {/* Search Input */}
      <div className="top-bar-search">
        <Search size={18} className="top-bar-search-icon" />
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </div>

      {/* Right Actions */}
      <div className="top-bar-actions">
        {/* Notification Bell */}
        <button className="notification-bell-btn" title="Notifications">
          <Bell size={19} />
          <span className="notification-badge">{notificationCount}</span>
        </button>

        {/* User Profile Pill */}
        <div 
          className="user-profile-pill" 
          ref={dropdownRef}
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          <div className="user-avatar-circle">
            {initials}
          </div>
          <div className="user-profile-info">
            <span className="user-profile-name">{user?.name?.split(' ')[0] || 'User'}</span>
            <span className="user-profile-role">{getRoleDisplayName(user?.role)}</span>
          </div>
          <ChevronDown size={15} color="#94a3b8" />

          {/* Dropdown Menu */}
          {dropdownOpen && (
            <div className="user-dropdown-menu">
              <a href="/change-password" className="user-dropdown-item">
                <Lock size={16} />
                <span>Change Password</span>
              </a>
              <button onClick={logout} className="user-dropdown-item danger">
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
