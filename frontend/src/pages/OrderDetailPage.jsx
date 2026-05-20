import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard, Clock, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// ── Inline review form (same logic as MyOrdersPage) ─────────────────────────
const ProductReviewForm = ({ productId, productName }) => {
  const [status, setStatus] = useState('loading');
  const [existingReview, setExistingReview] = useState(null);
  const [form, setForm] = useState({ rating: 0, title: '', comment: '' });
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!productId) return;
    const token = localStorage.getItem('token');
    if (!token) { setStatus('can'); return; }

    fetch(`${import.meta.env.VITE_API_URL}/api/products/${productId}/reviews`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const userId = payload.id || payload._id;
          const mine = (data.reviews || []).find(
            r => r.user_id === userId || r.user_id?.toString() === userId?.toString()
          );
          if (mine) { setExistingReview(mine); setStatus('done'); }
          else setStatus('can');
        } catch { setStatus('can'); }
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
      if (res.ok) { setExistingReview(data.review); setStatus('done'); setOpen(false); }
      else alert(data.error || 'Failed to submit review');
    } catch { alert('Failed to submit review'); }
    finally { setSubmitting(false); }
  };

  if (status === 'loading') return <div className="mt-2 h-4 w-28 bg-gray-100 rounded animate-pulse" />;

  if (status === 'done') return (
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
                <button key={s} type="button"
                  onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
                  onClick={() => setForm(f => ({ ...f, rating: s }))}>
                  <Star className={`w-6 h-6 transition-colors ${s <= (hover || form.rating) ? 'fill-[#F7D060] text-[#F7D060]' : 'text-gray-300'}`} />
                </button>
              ))}
            </div>
            <input type="text" placeholder="Title (optional)" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8E447E]/30" />
            <textarea required placeholder="Share your experience..." value={form.comment}
              onChange={e => setForm(f => ({ ...f, comment: e.target.value }))}
              rows={3} className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#8E447E]/30 resize-none" />
            <div className="flex gap-2">
              <button type="submit" disabled={submitting}
                className="px-4 py-1.5 bg-[#8E447E] text-white text-xs font-bold rounded-lg hover:bg-[#7A3B6D] transition-colors disabled:opacity-50">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button type="button" onClick={() => setOpen(false)}
                className="px-4 py-1.5 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
// ─────────────────────────────────────────────────────────────────────────────

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [designs, setDesigns] = useState({});
  const [feedbackText, setFeedbackText] = useState({});
  const [submittingAction, setSubmittingAction] = useState(null);

  const handleApproveDesign = async (itemId) => {
    try {
      setSubmittingAction(itemId);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/designs/approve/${itemId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDesigns(prev => ({ ...prev, [itemId]: data.design }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleRequestRevision = async (itemId) => {
    try {
      setSubmittingAction(itemId);
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/designs/request-revision/${itemId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ feedback: feedbackText[itemId] || '' })
      });
      if (res.ok) {
        const data = await res.json();
        setDesigns(prev => ({ ...prev, [itemId]: data.design }));
        setFeedbackText(prev => ({ ...prev, [itemId]: '' }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingAction(null);
    }
  };

  useEffect(() => {
    if (order?.items) {
      order.items.forEach(async (item) => {
        // Fetch design if customization exists
        try {
          const token = localStorage.getItem('token');
          const itemId = item._id || item.id;
          if (!itemId) return;
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/designs/order-item/${itemId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          if (response.ok) {
            const data = await response.json();
            if (data.design) {
              setDesigns(prev => ({ ...prev, [itemId]: data.design }));
            }
          }
        } catch (error) {
          console.error('Failed to fetch design for item:', error);
        }
      });
    }
  }, [order]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: `/order/${id}` } } });
      return;
    }
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch order details');
      }

      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Failed to fetch order details:', error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

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

  const getStatusSteps = () => {
    const currentStatus = (order?.order_status || order?.status || 'pending').toLowerCase();
    
    const statuses = ['pending', 'processing', 'shipped', 'delivered'];
    const currentIndex = statuses.indexOf(currentStatus) !== -1 ? statuses.indexOf(currentStatus) : 0;
    
    return [
      { label: 'Order Placed', status: 'completed' },
      { label: 'Pending', status: currentIndex >= 0 ? (currentIndex === 0 ? 'current' : 'completed') : 'pending' },
      { label: 'Processing', status: currentIndex >= 1 ? (currentIndex === 1 ? 'current' : 'completed') : 'pending' },
      { label: 'Shipped', status: currentIndex >= 2 ? (currentIndex === 2 ? 'current' : 'completed') : 'pending' },
      { label: 'Delivered', status: currentIndex >= 3 ? 'completed' : 'pending' }
    ];
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-valentine-red"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="w-24 h-24 mx-auto text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <button onClick={() => navigate('/my-orders')} className="btn-primary">
            Back to My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary)] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate('/my-orders')}
            className="flex items-center gap-2 mb-4 hover:underline text-gray-200 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to My Orders
          </button>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4 text-white">
            Order Details
          </h1>
          <p className="text-lg text-gray-200">Order ID: #{order.id}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status Timeline */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-6">Order Status</h2>
              <div className="relative">
                <div className="flex justify-between">
                  {getStatusSteps().map((step, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        step.status === 'completed' 
                          ? 'bg-green-500 text-white' 
                          : step.status === 'current'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}>
                        {step.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <Clock className="w-6 h-6" />
                        )}
                      </div>
                      <p className="text-xs mt-2 text-center font-semibold">{step.label}</p>
                    </div>
                  ))}
                </div>
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 -z-10" />
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-2xl font-bold mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.items?.map((item, index) => {
                  const isDelivered = ['delivered', 'completed'].includes(
                    (order.order_status || order.status || '').toLowerCase()
                  );
                  const productId = item.product_id
                    ? (typeof item.product_id === 'object'
                        ? (item.product_id.$oid || item.product_id.toString())
                        : item.product_id)
                    : null;

                  return (
                  <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0">
                    <img
                      src={
                        item.product_image?.startsWith('http')
                          ? item.product_image
                          : (item.product_image || item.product_image_url || item.image_url 
                              ? `${import.meta.env.VITE_API_URL}${item.product_image || item.product_image_url || item.image_url}` 
                              : '/images/image.png')
                      }
                      alt={item.product_name}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{item.product_name}</h3>
                      <p className="text-gray-600">Quantity: {item.quantity}</p>
                      {item.customization && (
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-semibold text-valentine-red">✨ Customized</p>
                          {item.customization.size && (
                            <p>Size: {item.customization.size}</p>
                          )}
                          {Object.entries(item.customization.textInputs || {}).map(([key, value]) => (
                            <p key={key}>{key}: {value}</p>
                          ))}
                        </div>
                      )}
                      
                      {/* Admin Designed Image Display */}
                      {designs[item._id || item.id]?.admin_designed_image && (
                        <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="font-semibold text-purple-800 mb-2">🎨 Designed Image from Admin</p>
                          <img 
                            src={
                              designs[item._id || item.id].admin_designed_image.startsWith('http') 
                                ? designs[item._id || item.id].admin_designed_image 
                                : `${import.meta.env.VITE_API_URL}${designs[item._id || item.id].admin_designed_image}`
                            } 
                            alt="Admin Design"
                            className="w-full max-w-sm rounded-lg shadow-sm border border-gray-200"
                          />
                          <p className="text-sm mt-2 font-medium capitalize text-purple-700">
                            Status: {designs[item._id || item.id].status.replace('_', ' ')}
                          </p>
                          
                          {designs[item._id || item.id].status === 'pending_approval' && (
                            <div className="mt-4 space-y-3 bg-white p-4 rounded-lg shadow-sm border border-purple-100">
                              <h4 className="font-bold text-gray-900 mb-2">Review Design</h4>
                              <p className="text-sm text-gray-600 mb-3">Please approve this design to proceed, or let us know if you need any changes.</p>
                              
                              <button
                                onClick={() => handleApproveDesign(item._id || item.id)}
                                disabled={submittingAction === (item._id || item.id)}
                                className="w-full sm:w-auto px-6 py-2.5 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors shadow-sm"
                              >
                                {submittingAction === (item._id || item.id) ? 'Processing...' : 'Yes, Approve Design'}
                              </button>
                              
                              <div className="mt-4 border-t border-gray-100 pt-4">
                                <p className="text-sm font-semibold text-gray-700 mb-2">Need Changes?</p>
                                <textarea
                                  placeholder="Type your feedback or revision requests here..."
                                  className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-[var(--color-primary)] transition-all bg-gray-50 outline-none"
                                  rows="3"
                                  value={feedbackText[item._id || item.id] || ''}
                                  onChange={(e) => setFeedbackText(prev => ({ ...prev, [item._id || item.id]: e.target.value }))}
                                />
                                <button
                                  onClick={() => handleRequestRevision(item._id || item.id)}
                                  disabled={submittingAction === (item._id || item.id) || !feedbackText[item._id || item.id]}
                                  className="mt-3 w-full sm:w-auto px-6 py-2 bg-gray-900 text-white font-semibold rounded-lg hover:bg-[var(--color-primary)] disabled:opacity-50 transition-colors text-sm"
                                >
                                  Request Revision
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Review form — only for delivered orders */}
                      {isDelivered && productId && (
                        <ProductReviewForm productId={productId} productName={item.product_name} />
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-xl text-valentine-red">₹{item.price}</p>
                      <p className="text-sm text-gray-600">× {item.quantity}</p>
                      <p className="text-sm font-semibold mt-1">
                        Total: ₹{item.price * item.quantity}
                      </p>
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Date</span>
                  <span className="font-semibold">{formatDate(order.createdAt || order.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-semibold capitalize">{order.order_status || order.status || 'Pending'}</span>
                </div>
                <div className="border-t pt-3 flex justify-between">
                  <span className="text-lg font-bold">Total Amount</span>
                  <span className="text-2xl font-bold text-valentine-red">
                    ₹{order.total || order.total_amount || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            {(order.shipping_info || order.shipping_address) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-valentine-red" />
                  <h2 className="text-xl font-bold">Shipping Address</h2>
                </div>
                <div className="text-gray-700 space-y-1">
                  {order.shipping_info ? (
                    <>
                      <p className="font-semibold">{order.shipping_info.name}</p>
                      <p>{order.shipping_info.address}</p>
                      <p>{order.shipping_info.city}, {order.shipping_info.state}</p>
                      <p><span className="font-medium">PIN:</span> {order.shipping_info.pincode}</p>
                      <p><span className="font-medium">Phone:</span> {order.shipping_info.phone}</p>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold">{order.customer_name}</p>
                      <p>{order.shipping_address}</p>
                      <p><span className="font-medium">Phone:</span> {order.customer_phone}</p>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-valentine-red" />
                <h2 className="text-xl font-bold">Payment Information</h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method</span>
                  <span className="font-semibold">{order.payment_method || 'Online Payment'}</span>
                </div>
                {order.razorpay_order_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Transaction ID</span>
                    <span className="text-xs font-mono">{order.razorpay_order_id}</span>
                  </div>
                )}
                {order.razorpay_payment_id && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payment ID</span>
                    <span className="text-xs font-mono">{order.razorpay_payment_id}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-valentine-pink/10 rounded-xl p-6 border border-valentine-pink/20">
              <h3 className="font-bold mb-2">Need Help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Contact us for any queries regarding your order
              </p>
              <button
                onClick={() => navigate('/contact')}
                className="w-full btn-primary text-sm"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
