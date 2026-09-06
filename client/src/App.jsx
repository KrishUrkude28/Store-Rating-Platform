import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth, getRoleHomePath } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminAddUserPage from './pages/admin/AdminAddUserPage';
import AdminUserDetailsPage from './pages/admin/AdminUserDetailsPage';
import AdminStoresPage from './pages/admin/AdminStoresPage';
import AdminAddStorePage from './pages/admin/AdminAddStorePage';
import UserStoresPage from './pages/user/UserStoresPage';
import OwnerDashboard from './pages/owner/OwnerDashboard';

function MainRouter() {
  const { user, isAuthenticated, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname || '/');

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname || '/');
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Route matching logic
  const renderRoute = () => {
    // 1. Landing Page (Default route / or /home)
    if (currentPath === '/' || currentPath === '' || currentPath === '/home') {
      return <LandingPage onNavigate={navigate} />;
    }

    // 2. Authentication Routes
    if (currentPath === '/login') {
      if (isAuthenticated && user) {
        navigate(getRoleHomePath(user.role));
        return null;
      }
      return <LoginPage onNavigate={navigate} />;
    }

    if (currentPath === '/register') {
      if (isAuthenticated && user) {
        navigate(getRoleHomePath(user.role));
        return null;
      }
      return <RegisterPage onNavigate={navigate} />;
    }

    // 3. Change Password
    if (currentPath === '/change-password') {
      return (
        <ProtectedRoute allowedRoles={['ADMIN', 'USER', 'STORE_OWNER']} onNavigate={navigate}>
          <ChangePasswordPage onNavigate={navigate} />
        </ProtectedRoute>
      );
    }

    // 4. Administrator Routes
    if (currentPath === '/admin' || currentPath === '/admin/dashboard') {
      return (
        <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
          <AdminDashboard onNavigate={navigate} />
        </ProtectedRoute>
      );
    }

    if (currentPath === '/admin/users') {
      return (
        <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
          <AdminUsersPage onNavigate={navigate} />
        </ProtectedRoute>
      );
    }

    if (currentPath === '/admin/users/create') {
      return (
        <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
          <AdminAddUserPage onNavigate={navigate} />
        </ProtectedRoute>
      );
    }

    if (currentPath.startsWith('/admin/users/')) {
      const parts = currentPath.split('/');
      const userId = parts[parts.length - 1];
      return (
        <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
          <AdminUserDetailsPage userId={userId} onNavigate={navigate} />
        </ProtectedRoute>
      );
    }

    if (currentPath === '/admin/stores') {
      return (
        <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
          <AdminStoresPage onNavigate={navigate} />
        </ProtectedRoute>
      );
    }

    if (currentPath === '/admin/stores/create') {
      return (
        <ProtectedRoute allowedRoles={['ADMIN']} onNavigate={navigate}>
          <AdminAddStorePage onNavigate={navigate} />
        </ProtectedRoute>
      );
    }

    // 5. Normal User Routes
    if (currentPath === '/user/stores' || currentPath === '/user' || currentPath === '/stores') {
      return (
        <ProtectedRoute allowedRoles={['USER']} onNavigate={navigate}>
          <UserStoresPage onNavigate={navigate} />
        </ProtectedRoute>
      );
    }

    // 6. Store Owner Routes
    if (currentPath === '/owner' || currentPath === '/owner/dashboard') {
      return (
        <ProtectedRoute allowedRoles={['STORE_OWNER']} onNavigate={navigate}>
          <OwnerDashboard onNavigate={navigate} />
        </ProtectedRoute>
      );
    }

    // 404 Fallback
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '20px' }}>
        <div className="auth-card" style={{ maxWidth: '400px' }}>
          <h2>Page Not Found</h2>
          <p style={{ margin: '12px 0 20px', color: '#64748b' }}>
            The requested path "{currentPath}" does not exist.
          </p>
          <button
            className="auth-submit-btn"
            onClick={() => navigate(isAuthenticated && user ? getRoleHomePath(user.role) : '/')}
          >
            Return to Safety
          </button>
        </div>
      </div>
    );
  };

  return <main>{renderRoute()}</main>;
}

export default function App() {
  return (
    <AuthProvider>
      <MainRouter />
    </AuthProvider>
  );
}
