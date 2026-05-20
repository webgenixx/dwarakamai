import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent browser back button from leaving admin area
    if (requireAdmin && user && (user.role === 'admin' || user.role === 'super_admin')) {
      // Push a state to prevent going back to non-admin pages
      window.history.pushState(null, '', window.location.href);
      
      const handlePopState = (e) => {
        // If trying to navigate away from admin area, stay in admin
        if (location.pathname.startsWith('/admin')) {
          window.history.pushState(null, '', window.location.href);
          // Redirect to admin dashboard if trying to go back
          if (location.pathname === '/admin/login') {
            navigate('/admin/dashboard', { replace: true });
          }
        }
      };

      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    }
  }, [requireAdmin, user, location, navigate]);

  // Redirect admin users away from customer pages
  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'super_admin')) {
      // If admin is on a non-admin page, redirect to admin dashboard
      if (!location.pathname.startsWith('/admin') && !requireAdmin) {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [user, location, navigate, requireAdmin]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-valentine-red mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={requireAdmin ? "/admin/login" : "/login"} replace />;
  }

  if (requireAdmin && user.role !== 'admin' && user.role !== 'super_admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <a href="/admin/login" className="text-valentine-red hover:underline">Go to Admin Login</a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
