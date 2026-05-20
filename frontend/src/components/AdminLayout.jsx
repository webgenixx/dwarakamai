import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag,
  TrendingUp, LogOut, Menu, X, Shield, FileText, MessageSquare, Send, Image, Bell
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AdminLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/admin/login';
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/categories', icon: Tag, label: 'Categories' },
    { path: '/admin/products', icon: Package, label: 'Products' },
    { path: '/admin/services', icon: Package, label: 'Services' },
    { path: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/admin/customers', icon: Users, label: 'Customers' },
    { path: '/admin/gallery', icon: Image, label: 'Gallery' },
    { path: '/admin/homepage', icon: Image, label: 'Homepage' },
    { path: '/admin/sales-report', icon: TrendingUp, label: 'Sales Report' },
    { path: '/admin/whatsapp-templates', icon: MessageSquare, label: 'WhatsApp Templates' },
    { path: '/admin/whatsapp-campaigns', icon: Send, label: 'WhatsApp Campaigns' },
    { path: '/admin/send-notifications', icon: Bell, label: 'Send Notifications' }
  ];

  // Add super admin only menu items
  if (user?.role === 'super_admin') {
    menuItems.push(
      { path: '/admin/admin-management', icon: Shield, label: 'Admin Management' },
      { path: '/admin/audit-log', icon: FileText, label: 'Audit Log' }
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="bg-white p-2 rounded-lg shadow-lg"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-40 transform transition-transform duration-300 flex flex-col
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
      `}>
        <div className="p-6 border-b flex-shrink-0">
          <h1 className="text-2xl font-bold text-orange-primary">Admin Panel</h1>
          <p className="text-sm text-gray-600 mt-1">Dwarakamai digital photo studio</p>
        </div>

        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2 pb-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive
                        ? 'bg-orange-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t flex-shrink-0">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex-1 lg:hidden"></div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  Logged in as: <span className="font-semibold text-orange-primary">{user?.name || user?.email || 'Admin'}</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main>
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
