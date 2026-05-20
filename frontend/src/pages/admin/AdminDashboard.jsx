import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  Camera, 
  Users, 
  TrendingUp,
  DollarSign,
  Image as ImageIcon,
  Shield,
  MessageCircle
} from 'lucide-react';
import api from '../../utils/api';

const AdminDashboard = () => {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [stats, setStats] = useState({
    total_orders: 0,
    total_products: 0,
    total_customers: 0,
    total_revenue: 0,
    pending_orders: 0,
    completed_orders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is super admin
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setIsSuperAdmin(payload.role === 'super_admin');
      } catch (error) {
        console.error('Token parse error:', error);
      }
    }
    
    // Fetch dashboard stats
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await api.get('/api/admin/stats');
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    { 
      label: 'Total Orders', 
      value: loading ? '...' : stats.total_orders || 0, 
      icon: ShoppingBag, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Total Products', 
      value: loading ? '...' : stats.total_products || 0, 
      icon: Package, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Service Bookings', 
      value: loading ? '...' : '0', 
      icon: Camera, 
      color: 'bg-purple-500' 
    },
    { 
      label: 'Total Revenue', 
      value: loading ? '...' : `₹${parseFloat(stats.total_revenue || 0).toLocaleString('en-IN')}`, 
      icon: DollarSign, 
      color: 'bg-yellow-500' 
    },
  ];

  const quickLinks = [
    { 
      title: 'Product Management', 
      description: 'Add, edit, or remove products',
      icon: Package,
      link: '/admin/products',
      color: 'from-blue-500 to-blue-600'
    },
    { 
      title: 'Order Management', 
      description: 'View and manage customer orders',
      icon: ShoppingBag,
      link: '/admin/orders',
      color: 'from-green-500 to-green-600'
    },
    { 
      title: 'Service Management', 
      description: 'Manage services and bookings',
      icon: Camera,
      link: '/admin/services',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      title: 'WhatsApp Messaging', 
      description: 'Send WhatsApp messages to customers',
      icon: MessageCircle,
      link: '/admin/whatsapp',
      color: 'from-green-400 to-green-500'
    },
    { 
      title: 'Gallery Management', 
      description: 'Upload and manage gallery images',
      icon: ImageIcon,
      link: '/admin/gallery',
      color: 'from-pink-500 to-pink-600'
    },
    { 
      title: 'Homepage Management', 
      description: 'Manage homepage images and content',
      icon: ImageIcon,
      link: '/admin/homepage',
      color: 'from-rose-500 to-rose-600'
    },
    { 
      title: 'Customer Management', 
      description: 'View customer information',
      icon: Users,
      link: '/admin/customers',
      color: 'from-indigo-500 to-indigo-600'
    },
    { 
      title: 'Analytics', 
      description: 'View sales reports and analytics',
      icon: TrendingUp,
      link: '/admin/analytics',
      color: 'from-orange-500 to-orange-600'
    },
  ];

  // Add Admin Management for super admins
  const superAdminLinks = isSuperAdmin ? [
    { 
      title: 'Admin Management', 
      description: 'Manage admin users and permissions',
      icon: Shield,
      link: '/admin/admin-management',
      color: 'from-red-500 to-red-600'
    },
  ] : [];

  const allQuickLinks = [...quickLinks, ...superAdminLinks];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Welcome back! Here's what's happening with your store.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{stat.label}</p>
                    <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 truncate">{stat.value}</p>
                  </div>
                  <div className={`${stat.color} p-2 sm:p-3 rounded-lg flex-shrink-0 ml-2`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {allQuickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Link
                  key={index}
                  to={link.link}
                  className="group bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                >
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${link.color} rounded-lg flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 sm:mb-2">{link.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{link.description}</p>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-4 sm:p-6 border border-gray-200">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Recent Activity</h2>
          <div className="text-center py-6 sm:py-8 text-gray-500">
            <p className="text-sm sm:text-base">No recent activity to display</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
