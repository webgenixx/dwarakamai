/**
 * API Utility Functions
 * Handles authentication and API requests with automatic token management
 */

// API Base URL - automatically uses environment variable or falls back to localhost
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get authentication headers
 */
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.warn('No authentication token found');
    return {};
  }

  return {
    'Authorization': `Bearer ${token}`
  };
};

/**
 * Make authenticated API request
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      ...options.headers,
      ...getAuthHeaders()
    }
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized
    if (response.status === 401) {
      console.error('Authentication failed - redirecting to login');
      localStorage.clear();
      window.location.href = '/admin/login';
      throw new Error('Authentication required');
    }

    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

/**
 * Check if user is admin
 */
export const isAdmin = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) return false;
    
    const user = JSON.parse(userStr);
    return user.role === 'admin' || user.role === 'super_admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * HTTP Methods
 */
const get = async (endpoint) => {
  const response = await apiRequest(endpoint, {
    method: 'GET'
  });
  return response.json();
};

const post = async (endpoint, data) => {
  const response = await apiRequest(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

const put = async (endpoint, data) => {
  const response = await apiRequest(endpoint, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

const del = async (endpoint) => {
  const response = await apiRequest(endpoint, {
    method: 'DELETE'
  });
  return response.json();
};

export default {
  apiRequest,
  getAuthHeaders,
  isAuthenticated,
  isAdmin,
  getCurrentUser,
  get,
  post,
  put,
  delete: del
};
