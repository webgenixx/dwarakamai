import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Save, ArrowLeft, Camera, ShieldCheck, ShoppingBag, Heart, Package, Trash2, Plus, Minus, MessageCircle, ChevronRight, Clock, CheckCircle, XCircle, Eye, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { API_BASE_URL } from '../utils/api';
import PhoneInput from '../components/PhoneInput';

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, login, logout } = useAuth();
  const { cart, removeFromCart, updateQuantity, getCartSubtotal } = useCart();
  const { wishlist, removeFromWishlist } = useWishlist();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [designs, setDesigns] = useState({});

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: '/profile' } } });
      return;
    }
    
    // Set initial tab from URL if present
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['profile', 'orders', 'cart', 'wishlist'].includes(tabParam)) {
      setActiveTab(tabParam);
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
    }

    if (activeTab === 'orders') {
      fetchOrders();
    }
  }, [user, location.search, activeTab]);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/my-orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const fetchedOrders = data.orders || [];
        setOrders(fetchedOrders);
        
        // Fetch designs for customized items
        fetchedOrders.forEach(order => {
          order.items?.forEach(async (item) => {
            if (item.customization) {
              try {
                const itemId = item._id || item.id;
                if (!itemId) return;
                const designRes = await fetch(`${import.meta.env.VITE_API_URL}/api/designs/order-item/${itemId}`, {
                  headers: { 'Authorization': `Bearer ${token}` }
                });
                if (designRes.ok) {
                  const designData = await designRes.json();
                  if (designData.design?.admin_designed_image) {
                    setDesigns(prev => ({ ...prev, [itemId]: designData.design }));
                  }
                }
              } catch (e) {
                console.error("Failed to fetch design:", e);
              }
            }
          });
        });
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (message.text) setMessage({ type: '', text: '' });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ name: formData.name, phone: formData.phone })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to update profile');
      login({ ...user, name: data.user.name, fullName: data.user.name, phone: data.user.phone });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Edit Profile', icon: User },
    { id: 'orders', label: 'My Orders', icon: Package },
    { id: 'cart', label: 'Cart', icon: ShoppingBag, count: cart.length },
    { id: 'wishlist', label: 'Favorites', icon: Heart, count: wishlist.length },
  ];

  const subtotal = getCartSubtotal();
  const shipping = 99;
  const tax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50/50 pt-12 pb-24">
      <div className="container-custom">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">CURATOR DASHBOARD</p>
            <div className="flex items-center gap-4">
              <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 tracking-tight">
                {activeTab === 'profile' ? 'Studio Profile' : tabs.find(t => t.id === activeTab).label}
              </h1>
              <div className="flex items-center gap-1.5 bg-green-50 text-green-700 px-3 py-1 rounded-full text-[10px] font-body font-bold uppercase tracking-wider border border-green-100">
                <ShieldCheck className="w-3 h-3" />
                <span>Verified Curator</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex items-center gap-4 bg-white p-3 pr-8 rounded-full shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center text-[var(--color-primary)]">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">MEMBER SINCE</p>
                <p className="font-body font-bold text-gray-900">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '2024'}
                </p>
              </div>
            </div>
            <button onClick={logout} className="p-4 bg-white border border-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors shadow-sm">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex overflow-x-auto gap-8 border-b border-gray-200 mb-12 no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                navigate(`/profile?tab=${tab.id}`, { replace: true });
              }}
              className={`pb-4 flex items-center gap-3 text-xs font-body font-bold tracking-widest uppercase transition-all relative whitespace-nowrap ${activeTab === tab.id ? 'text-[var(--color-primary)]' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-[8px] ${activeTab === tab.id ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {tab.count}
                </span>
              )}
              {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-primary)]" />}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Edit Profile Logic (Same as before but integrated) */}
              <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900">
                    <User className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-gray-900">Information</h2>
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-3">Email Address</label>
                      <input type="email" value={formData.email} disabled className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-400 font-body text-sm cursor-not-allowed" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-3">Full Name</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-gray-900 font-body text-sm focus:ring-2 focus:ring-purple-100 transition-all outline-none" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-3">Phone Number</label>
                      <PhoneInput name="phone" value={formData.phone} onChange={handleChange} />
                    </div>
                  </div>
                  <button type="submit" disabled={loading} className="w-full py-5 bg-gray-900 text-white rounded-2xl font-body font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all active:scale-95">
                    {loading ? 'Saving...' : 'Save Profile Changes'}
                  </button>
                </form>
              </div>
              <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900">
                    <Lock className="w-6 h-6" />
                  </div>
                  <h2 className="text-3xl font-display font-bold text-gray-900">Security</h2>
                </div>
                <p className="text-sm text-gray-400 font-body leading-relaxed mb-8">
                  Update your studio credentials to keep your curated sessions and selections secure.
                </p>
                <button className="w-full py-5 bg-white border border-gray-100 text-gray-900 rounded-2xl font-body font-bold text-sm uppercase tracking-widest hover:bg-gray-50 transition-all">
                  Change Access Password
                </button>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-6">
              {ordersLoading ? (
                <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-gray-100 border-t-[var(--color-primary)] rounded-full animate-spin mx-auto"></div></div>
              ) : orders.length === 0 ? (
                <div className="bg-white rounded-[40px] p-20 text-center border border-gray-100">
                  <Package className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">No history yet.</h3>
                  <p className="text-gray-400 font-body mb-8">Your curated orders will appear here once placed.</p>
                  <Link to="/shop" className="btn-primary inline-block">Explore Shop</Link>
                </div>
              ) : (
                <div className="grid gap-6">
                  {orders.map(order => (
                    <div key={order.id} className="bg-gradient-to-br from-white to-purple-50/30 rounded-[30px] border border-gray-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300 group">
                      <div className="flex flex-wrap justify-between items-center gap-6 mb-8">
                        <div>
                          <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-1">ORDER ID</p>
                          <p className="font-display font-bold text-xl text-gray-900">#{order.id || order._id}</p>
                        </div>
                        <div className="flex items-center gap-6 sm:gap-12 flex-wrap">
                          <div>
                            <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-1">DATE</p>
                            <p className="font-body font-bold text-sm text-gray-900">
                              {new Date(order.createdAt || order.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-1">TOTAL</p>
                            <p className="font-display font-bold text-xl text-[var(--color-primary)]">
                              ₹{parseFloat(order.total || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className={`px-4 py-1.5 rounded-full text-[10px] font-body font-bold uppercase tracking-widest ${
                            (order.order_status || order.status) === 'delivered' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.order_status || order.status || 'Pending'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                        <div className="flex -space-x-4">
                          {order.items?.slice(0, 4).map((item, i) => {
                            const designImg = designs[item._id || item.id]?.admin_designed_image;
                            const imageSrc = designImg 
                              ? (designImg.startsWith('http') ? designImg : `${import.meta.env.VITE_API_URL}${designImg}`)
                              : (item.product_image?.startsWith('http') 
                                  ? item.product_image 
                                  : (item.product_image ? `${import.meta.env.VITE_API_URL}${item.product_image}` : '/images/image.png'));

                            return (
                              <img 
                                key={i} 
                                src={imageSrc} 
                                className={`w-12 h-12 rounded-full border-2 ${designImg ? 'border-[var(--color-primary)]' : 'border-white'} object-cover shadow-sm relative z-[${10 - i}]`} 
                                alt={item.product_name || "Product"} 
                                title={designImg ? "Admin Designed Image" : ""}
                              />
                            );
                          })}
                          {order.items?.length > 4 && (
                            <div className="w-12 h-12 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shadow-sm z-10">
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>
                        <Link to={`/order/${order.id || order._id}`} className="flex items-center gap-2 text-[10px] font-body font-bold text-white bg-gray-900 px-5 py-2.5 rounded-full uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all shadow-md group-hover:shadow-lg">
                          <span>View Details</span>
                          <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'cart' && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-12">
              {cart.length === 0 ? (
                <div className="lg:col-span-2 bg-white rounded-[40px] p-20 text-center border border-gray-100">
                  <ShoppingBag className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">Your Selection is Empty</h3>
                  <p className="text-gray-400 font-body mb-8">Begin your curation journey in our studio shop.</p>
                  <Link to="/shop" className="btn-primary inline-block">Start Shopping</Link>
                </div>
              ) : (
                <>
                  <div className="space-y-6">
                    <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12">
                      {cart.map((item, idx) => (
                        <div key={item.id} className={`flex gap-8 pb-10 mb-10 ${idx !== cart.length - 1 ? 'border-b border-gray-50' : ''}`}>
                          <img src={item.image} className="w-32 h-32 rounded-3xl object-cover bg-gray-50" alt={item.name} />
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between">
                              <div>
                                <h4 className="text-xl font-display font-bold text-gray-900 mb-2">{item.name}</h4>
                                <p className="text-xs text-gray-400 font-body">Custom Handmade Gift</p>
                              </div>
                              <span className="text-xl font-display font-bold text-gray-900">₹{(item.price || 0) * (item.quantity || 1)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center bg-gray-50 rounded-full px-4 py-1.5 gap-4">
                                <button onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}><Minus className="w-3 h-3 text-gray-400" /></button>
                                <span className="font-body font-bold text-sm text-gray-900">{item.quantity || 1}</span>
                                <button onClick={() => updateQuantity(item.id, (item.quantity || 1) + 1)}><Plus className="w-3 h-3 text-gray-400" /></button>
                              </div>
                              <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white rounded-[40px] border border-gray-100 p-10 h-fit sticky top-32">
                    <h3 className="text-2xl font-display font-bold text-gray-900 mb-8">Summary</h3>
                    <div className="space-y-4 mb-8">
                      <div className="flex justify-between text-sm font-body text-gray-500"><span>Subtotal</span><span className="text-gray-900 font-bold">₹{subtotal}</span></div>
                      <div className="flex justify-between text-sm font-body text-gray-500"><span>Estimated Tax</span><span className="text-gray-900 font-bold">₹{tax}</span></div>
                    </div>
                    <div className="pt-6 border-t border-gray-50 mb-8">
                      <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest mb-1">TOTAL TO PAY</p>
                      <p className="text-4xl font-display font-bold text-[var(--color-primary)]">₹{grandTotal}</p>
                    </div>
                    <button onClick={() => navigate('/payment')} className="w-full py-5 bg-[var(--color-primary)] text-white rounded-2xl font-body font-bold text-sm uppercase tracking-widest hover:shadow-xl transition-all">Proceed to Checkout</button>
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {wishlist.length === 0 ? (
                <div className="col-span-full bg-white rounded-[40px] p-20 text-center border border-gray-100">
                  <Heart className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">No Favorites Yet</h3>
                  <p className="text-gray-400 font-body mb-8">Save items you love to curate your dream collection.</p>
                  <Link to="/shop" className="btn-primary inline-block">Explore Shop</Link>
                </div>
              ) : (
                wishlist.map(item => (
                  <div key={item.id} className="bg-white rounded-[35px] border border-gray-100 p-6 hover:shadow-xl transition-all group">
                    <div className="relative aspect-square rounded-[25px] overflow-hidden mb-6 bg-gray-50">
                      <img src={item.image_url || item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                      <button onClick={() => removeFromWishlist(item.id)} className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center text-red-500 shadow-md">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <h4 className="text-xl font-display font-bold text-gray-900 mb-1">{item.name}</h4>
                    <p className="text-lg font-display font-bold text-[var(--color-primary)] mb-6">₹{item.price}</p>
                    <button onClick={() => navigate(`/product/${item.id}`)} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-body font-bold text-xs uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all">View & Personalize</button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;


