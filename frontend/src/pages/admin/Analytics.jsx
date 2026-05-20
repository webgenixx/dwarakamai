import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Calendar, Package } from 'lucide-react';
import api from '../../utils/api';

const Analytics = () => {
  const [stats, setStats] = useState({
    total_orders: 0,
    total_products: 0,
    total_customers: 0,
    total_revenue: 0,
    monthly_revenue: 0,
    daily_revenue: 0,
    pending_orders: 0,
    completed_orders: 0
  });
  const [salesData, setSalesData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch stats
      const statsData = await api.get('/api/admin/stats');
      setStats(statsData);
      
      // Fetch sales report
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - dateRange * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const salesReport = await api.get(`/api/admin/sales-report?start_date=${startDate}&end_date=${endDate}&group_by=day`);
      setSalesData(salesReport.sales || []);
      
      // Fetch top products
      const productsData = await api.get('/api/products');
      setTopProducts((productsData.products || []).slice(0, 5));
      
      // Fetch recent orders
      const ordersData = await api.get('/api/admin/orders?limit=5');
      setRecentOrders(ordersData.orders || []);
      
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      label: 'Total Revenue',
      value: `₹${parseFloat(stats.total_revenue || 0).toLocaleString('en-IN')}`,
      icon: DollarSign,
      color: 'bg-green-500',
      change: '+12.5%'
    },
    {
      label: 'Monthly Revenue',
      value: `₹${parseFloat(stats.monthly_revenue || 0).toLocaleString('en-IN')}`,
      icon: TrendingUp,
      color: 'bg-blue-500',
      change: '+8.2%'
    },
    {
      label: 'Total Orders',
      value: stats.total_orders || 0,
      icon: ShoppingBag,
      color: 'bg-purple-500',
      change: '+15.3%'
    },
    {
      label: 'Total Customers',
      value: stats.total_customers || 0,
      icon: Users,
      color: 'bg-orange-500',
      change: '+5.7%'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Reports</h1>
          <p className="text-gray-600 mt-2">Track your business performance</p>
        </div>
        <div className="flex gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-semibold text-green-600">{stat.change}</span>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Sales Overview</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : salesData.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No sales data available</div>
          ) : (
            <div className="space-y-3">
              {salesData.slice(0, 10).map((sale, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {new Date(sale.period).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ₹{parseFloat(sale.total_sales || 0).toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-gray-500">{sale.order_count} orders</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pending_orders || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <ShoppingBag className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Completed Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completed_orders || 0}</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Today's Revenue</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{parseFloat(stats.daily_revenue || 0).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Top Products</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : topProducts.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No products available</div>
          ) : (
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                    <Package className="w-6 h-6 text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{product.price}</p>
                    <p className="text-xs text-gray-500">Stock: {product.stock_quantity}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Orders</h2>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No recent orders</div>
          ) : (
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold text-gray-900">Order #{order.id}</p>
                    <p className="text-sm text-gray-500">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">₹{parseFloat(order.total).toLocaleString('en-IN')}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      order.payment_status === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.payment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
