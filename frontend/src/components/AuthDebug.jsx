import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react';

/**
 * AuthDebug Component
 * 
 * Temporary debugging component to help diagnose authentication issues.
 * Add this to any admin page to see authentication status.
 * 
 * Usage:
 * import AuthDebug from '../components/AuthDebug';
 * 
 * Then add to your component:
 * <AuthDebug />
 * 
 * Remove this component once authentication is working.
 */
const AuthDebug = () => {
  const [authInfo, setAuthInfo] = useState({
    hasToken: false,
    hasUser: false,
    userRole: null,
    tokenPreview: null,
    userEmail: null
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    let user = null;

    try {
      user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      console.error('Error parsing user:', e);
    }

    setAuthInfo({
      hasToken: !!token,
      hasUser: !!user,
      userRole: user?.role || null,
      tokenPreview: token ? token.substring(0, 20) + '...' : null,
      userEmail: user?.email || null
    });
  }, []);

  const isAdmin = authInfo.userRole === 'admin';
  const isAuthenticated = authInfo.hasToken && authInfo.hasUser;

  return (
    <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-4 max-w-sm border-2 border-gray-200 z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-gray-900">Auth Debug</h3>
        <button
          onClick={() => document.querySelector('[data-auth-debug]').remove()}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex items-center space-x-2">
          {authInfo.hasToken ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span className="text-gray-700">
            Token: {authInfo.hasToken ? 'Present' : 'Missing'}
          </span>
        </div>

        {authInfo.hasToken && (
          <div className="pl-6 text-xs text-gray-500 font-mono">
            {authInfo.tokenPreview}
          </div>
        )}

        <div className="flex items-center space-x-2">
          {authInfo.hasUser ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span className="text-gray-700">
            User: {authInfo.hasUser ? 'Present' : 'Missing'}
          </span>
        </div>

        {authInfo.hasUser && (
          <div className="pl-6 text-xs text-gray-500">
            {authInfo.userEmail}
          </div>
        )}

        <div className="flex items-center space-x-2">
          {isAdmin ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <XCircle className="w-4 h-4 text-red-600" />
          )}
          <span className="text-gray-700">
            Role: {authInfo.userRole || 'None'}
          </span>
        </div>

        <div className="pt-2 border-t border-gray-200 mt-3">
          <div className="flex items-center space-x-2">
            {isAuthenticated && isAdmin ? (
              <>
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-green-700 font-semibold">
                  ✓ Authenticated as Admin
                </span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-red-700 font-semibold">
                  ✗ Not Authenticated
                </span>
              </>
            )}
          </div>
        </div>

        {!isAuthenticated || !isAdmin ? (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
            <p className="text-yellow-800 font-semibold mb-1">Action Required:</p>
            <p className="text-yellow-700">
              Go to <a href="/admin/login" className="underline">/admin/login</a> and login with admin credentials.
            </p>
          </div>
        ) : null}
      </div>

      <div className="mt-3 pt-3 border-t border-gray-200">
        <button
          onClick={() => {
            localStorage.clear();
            window.location.href = '/admin/login';
          }}
          className="w-full text-xs bg-red-50 text-red-700 px-3 py-2 rounded hover:bg-red-100 transition-colors"
        >
          Clear & Re-login
        </button>
      </div>
    </div>
  );
};

// Wrap in a div with data attribute for easy removal
const AuthDebugWrapper = () => (
  <div data-auth-debug>
    <AuthDebug />
  </div>
);

export default AuthDebugWrapper;
