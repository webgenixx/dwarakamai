import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Clock, CheckCircle, XCircle, Eye, ShoppingBag, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ── Per-product inline review form ──────────────────────────────────────────
// productId, productName, orderId — orderId proves delivery, skip can-review check
const ProductReviewForm = ({ productId, productName }) => {
  const [status, setStatus] = useState('idle'); // idle | loading | can | done
  const [existingReview, setExistingReview] = useState(null);
  const [form, setForm] = useState({ rating: 0, title: '', comment: '' });
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const token = localStorage.getItem('token');
    if (!token) { setStatus('can'); return; } // show form, submit will fail gracefully

    // Only check if already reviewed — we already know order is delivered
    setStatus('loading');
    fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}/reviews`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        // Find if current user already reviewed this product
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.id || payload._id;
          const mine = (data.reviews || []).find(
            r => r.user_id === userId || r.user_id?.toString() === userId?.toString()
          );
          if (mine) {
            setExistingReview(mine);
            setStatus('done');
          } else {
            setStatus('can');
          }
        } catch {
          setStatus('can');
        }
      })
      .catch(() => setStatus('can'));
  }, [productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.rating === 0) { alert('Please select a star rating.'); return; }
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setExistingReview(data.review);
        setStatus('done');
        setOpen(false);
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch {
      alert('Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return <div className="mt-2 h-4 w-24 bg-gray-100 rounded animate-pulse" />;
  }

  if (status === 'done') {
    return (
      <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-semibold">
        <CheckCircle className="w-4 h-4" />
        <span>You reviewed this product</span>
        <div className="flex ml-1">
          {[1,2,3,4,5].map(s => (
            <Star key={s} className={`w-3 h-3 ${s <= (existingReview?.rating || 0) ? 'fill-[#F7D060] text-[#F7D060]' : 'text-gray-200'}`} />
          ))}
        </div>
      </div>
    );
  }

  // status === 'can' — show write review button / form
  return (
    <div className="mt-3">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#8E447E] border border-[#8E447E]/30 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full transition-colors"
        >
          <Star className="w-3.5 h-3.5" />
          Write a Review
        </button>
      ) : (
        <div className="mt-2 border border-gray-200 rounded-xl p-4 bg-gray-50">
          <p className="text-xs font-bold text-gray-700 mb-3">Review: {productName}</p>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-1">
              {[1,2,3,4,5].map(s => (
                <button
                  key={s}
                  type="button"
                  onMouseEnter={() => setHover(s)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setForm(f => ({ ...f, rating: s }))}
                >
                  <Star className={`w-6 h-6 transition-colors ${s <= (hover || form.rating) ? 'fill-[#F7D060] text-[#F7D060]' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Title (optional)"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8E447E]/30"
            />
            <textarea
              required
              placeholder="Share your experience..."
              value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              rows={3}
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8E447E]/30 resize-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-1.5 bg-[#8E447E] text-white text-xs font-bold rounded-lg hover:bg-[#7A3B6D] transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-1.5 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
// ────────────────────────────────────────────────────────────────────────────

const MyOrdersPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: '/my-orders' } } });
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      default:
        return <Package className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      case 'processing':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    const orderStatus = (order.order_status || order.status || '').toLowerCase();
    return orderStatus === filter;
  });

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    
    const day = String(date.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    hours = hours % 12 || 12;
    
    return `${day}-${month}-${year} ${hours}:${minutes}${ampm}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-valentine-red"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Filter Tabs - Directly below navbar */}
      <div className="bg-white border-b sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-2 py-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-valentine-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Orders ({orders.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'pending'
                  ? 'bg-valentine-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pending ({orders.filter(o => o.status?.toLowerCase() === 'pending').length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'completed'
                  ? 'bg-valentine-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completed ({orders.filter(o => o.status?.toLowerCase() === 'completed').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'cancelled'
                  ? 'bg-valentine-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Cancelled ({orders.filter(o => o.status?.toLowerCase() === 'cancelled').length})
            </button>
          </div>
        </div>
      </div>

      {/* Orders Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <ShoppingBag className="w-24 h-24 mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold mb-2">No Orders Found</h2>
            <p className="text-gray-600 mb-6">
              {filter === 'all' 
                ? "You haven't placed any successful orders yet. Complete your payment to see orders here."
                : `You don't have any ${filter} orders with successful payment.`}
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="btn-primary"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Order ID</p>
                      <p className="font-bold text-lg">#{order.id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Order Date</p>
                      <p className="font-semibold">{formatDate(order.created_at)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Amount</p>
                      <p className="font-bold text-xl text-valentine-red">₹{order.total || order.total_amount || 0}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.order_status || order.status)}
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.order_status || order.status)} capitalize`}>
                        {order.order_status || order.status || 'Pending'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {order.items?.map((item, index) => {
                      const isDelivered = ['delivered', 'completed'].includes(
                        (order.order_status || order.status || '').toLowerCase()
                      );
                      const productId = item.product_id
                        ? (typeof item.product_id === 'object' ? item.product_id.$oid || item.product_id.toString() : item.product_id)
                        : null;
                      return (
                        <div key={index} className="pb-4 border-b last:border-b-0">
                          <div className="flex gap-4">
                            <img
                              src={
                                item.product_image?.startsWith('http')
                                  ? item.product_image
                                  : (item.product_image || item.product_image_url || item.image_url
                                      ? `${import.meta.env.VITE_API_URL}${item.product_image || item.product_image_url || item.image_url}`
                                      : '/images/image.png')
                              }
                              alt={item.product_name}
                              className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                            />
                            <div className="flex-1">
                              <h4 className="font-semibold">{item.product_name}</h4>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                              {item.customization && (
                                <p className="text-xs text-gray-500 mt-1">✨ Customized</p>
                              )}
                              {/* Review form — only for delivered orders with a known product_id */}
                              {isDelivered && productId && (
                                <ProductReviewForm
                                  productId={productId}
                                  productName={item.product_name}
                                />
                              )}
                            </div>
                            <div className="text-right flex-shrink-0">
                              <p className="font-bold text-valentine-red">₹{item.price}</p>
                              <p className="text-sm text-gray-600">× {item.quantity}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Shipping Address */}
                  {(order.shipping_info || order.shipping_address) && (
                    <div className="mt-6 pt-6 border-t">
                      <h4 className="font-bold mb-2">Shipping Address</h4>
                      {order.shipping_info ? (
                        <>
                          <p className="text-gray-700">{order.shipping_info.name}</p>
                          <p className="text-gray-600 text-sm">
                            {order.shipping_info.address}, {order.shipping_info.city}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {order.shipping_info.state} - {order.shipping_info.pincode}
                          </p>
                          <p className="text-gray-600 text-sm">
                            <span className="font-medium">Phone:</span> {order.shipping_info.phone}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-700">{order.customer_name}</p>
                          <p className="text-gray-600 text-sm">{order.shipping_address}</p>
                          <p className="text-gray-600 text-sm">
                            <span className="font-medium">Phone:</span> {order.customer_phone}
                          </p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Payment Info */}
                  <div className="mt-6 pt-6 border-t flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-600">Payment Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="font-semibold text-green-600">Payment Successful</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Method: {order.payment_method || 'Online Payment'}
                      </p>
                      {order.razorpay_payment_id && (
                        <p className="text-xs text-gray-500">Payment ID: {order.razorpay_payment_id}</p>
                      )}
                    </div>
                    <button
                      onClick={() => navigate(`/order/${order.id}`)}
                      className="flex items-center gap-2 px-4 py-2 border-2 border-valentine-red text-valentine-red rounded-lg hover:bg-valentine-red hover:text-white transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersPage;
