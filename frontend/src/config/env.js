// Environment configuration
// All Vite env variables must be prefixed with VITE_

export const env = {
  // API Configuration
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',

  // Razorpay
  razorpayKeyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_demo',

  // WhatsApp
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER || '919492686421',

  // App
  appName: import.meta.env.VITE_APP_NAME || 'Dwarakamai digital photo studio',
  appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5174',

  // Feature Flags
  enablePayment: import.meta.env.VITE_ENABLE_PAYMENT === 'true',
  enableEmailVerification: import.meta.env.VITE_ENABLE_EMAIL_VERIFICATION === 'true',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',

  // Environment
  isDevelopment: import.meta.env.VITE_NODE_ENV === 'development' || import.meta.env.DEV,
  isProduction: import.meta.env.VITE_NODE_ENV === 'production' || import.meta.env.PROD,
};

// API endpoints helper
export const api = {
  auth: {
    login: `${env.apiBaseUrl}/auth/login`,
    register: `${env.apiBaseUrl}/auth/register`,
    forgotPassword: `${env.apiBaseUrl}/auth/forgot-password`,
    resetPassword: `${env.apiBaseUrl}/auth/reset-password`,
  },
  products: {
    list: `${env.apiBaseUrl}/products`,
    detail: (id) => `${env.apiBaseUrl}/products/${id}`,
    create: `${env.apiBaseUrl}/products`,
    update: (id) => `${env.apiBaseUrl}/products/${id}`,
    delete: (id) => `${env.apiBaseUrl}/products/${id}`,
  },
  services: {
    list: `${env.apiBaseUrl}/services`,
    detail: (id) => `${env.apiBaseUrl}/services/${id}`,
    create: `${env.apiBaseUrl}/services`,
    update: (id) => `${env.apiBaseUrl}/services/${id}`,
    delete: (id) => `${env.apiBaseUrl}/services/${id}`,
  },
  orders: {
    list: `${env.apiBaseUrl}/orders`,
    detail: (id) => `${env.apiBaseUrl}/orders/${id}`,
    create: `${env.apiBaseUrl}/orders`,
    updateStatus: (id) => `${env.apiBaseUrl}/orders/${id}/status`,
    updatePayment: (id) => `${env.apiBaseUrl}/orders/${id}/payment`,
  },
  categories: {
    list: `${env.apiBaseUrl}/categories`,
  },
  admin: {
    stats: `${env.apiBaseUrl}/admin/stats`,
    salesReport: `${env.apiBaseUrl}/admin/sales-report`,
    topProducts: `${env.apiBaseUrl}/admin/top-products`,
    customers: `${env.apiBaseUrl}/admin/customers`,
  },
};

// Helper to get WhatsApp URL
export const getWhatsAppUrl = (message = '') => {
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${env.whatsappNumber}?text=${encodedMessage}`;
};

// Helper to check if feature is enabled
export const isFeatureEnabled = (feature) => {
  const features = {
    payment: env.enablePayment,
    emailVerification: env.enableEmailVerification,
    analytics: env.enableAnalytics,
  };
  return features[feature] || false;
};

export default env;
