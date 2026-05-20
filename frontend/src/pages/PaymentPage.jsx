import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, MapPin, User, ShieldCheck, Wallet, Landmark, CheckCircle2, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '../utils/api';
import PhoneInput from '../components/PhoneInput';

const PaymentPage = () => {
  const navigate = useNavigate();
  const { cart, getCartSubtotal, getServiceCharge, getFinalTotal, clearCart } = useCart();
  const { user } = useAuth();
  
  const [step, setStep] = useState(1); // 1: Details, 2: Payment
  const [loading, setLoading] = useState(false);
  const [useTestMode, setUseTestMode] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    landmark: '',
    city: '',
    state: '',
    pincode: '',
  });

  // Pre-fill shipping details from account (signup / profile address)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data = await res.json();
        const u = data.user;
        if (!u) return;
        const a = u.address || {};
        setFormData((prev) => ({
          ...prev,
          name: u.name || prev.name,
          phone: u.phone || prev.phone,
          email: u.email ?? prev.email,
          address: (a.line1 && String(a.line1).trim()) || prev.address,
          landmark: (a.landmark && String(a.landmark).trim()) || prev.landmark,
          city: (a.city && String(a.city).trim()) || prev.city,
          state: (a.state && String(a.state).trim()) || prev.state,
          pincode: (a.pincode && String(a.pincode).trim()) || prev.pincode,
        }));
      } catch (e) {
        console.error('Failed to load profile for checkout:', e);
      }
    })();
  }, []);

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/profile?tab=cart');
    }
  }, [cart, navigate]);

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.address || !formData.city || !formData.pincode || !formData.state) {
      alert('Please complete your shipping information first.');
      return;
    }
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handlePaytmPayment = async (createdOrder) => {
    try {
      // Get Paytm parameters
      const paytmResponse = await fetch(`${API_BASE_URL}/api/orders/create-paytm-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: getFinalTotal(),
          orderId: createdOrder.id,
          orderNumber: createdOrder.order_number, // Use order_number instead of MongoDB ID
        })
      });

      const paytmData = await paytmResponse.json();
      if (!paytmResponse.ok) throw new Error('Failed to create Paytm order');

      console.log('Paytm params:', paytmData.paytmParams);

      // Create and submit Paytm form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = paytmData.paytmGatewayUrl;
      form.style.display = 'none';

      // Add all parameters to form
      Object.keys(paytmData.paytmParams).forEach(key => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = paytmData.paytmParams[key];
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
    } catch (error) {
      console.error('Paytm payment error:', error);
      alert('Failed to initialize Paytm payment');
      setLoading(false);
    }
  };

  const handleTestPayment = async (createdOrder) => {
    try {
      const testResponse = await fetch(`${API_BASE_URL}/api/orders/test-payment/${createdOrder.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const testData = await testResponse.json();
      if (testResponse.ok && testData.success) {
        clearCart();
        navigate('/profile?tab=orders');
      } else {
        alert('Test payment failed: ' + testData.error);
        setLoading(false);
      }
    } catch (error) {
      console.error('Test payment error:', error);
      alert('Test payment error: ' + error.message);
      setLoading(false);
    }
  };

  const handleProcessPayment = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // 1. Create order in our backend
      const orderResponse = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          customer_name: formData.name,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: `${formData.address}, ${formData.landmark ? formData.landmark + ', ' : ''}${formData.city}${formData.state ? `, ${formData.state}` : ''} - ${formData.pincode}`,
          items: cart,
          subtotal: getCartSubtotal(),
          service_charge: getServiceCharge(),
          total: getFinalTotal(),
          payment_method: 'paytm',
          shipping_info: {
            address: formData.address,
            landmark: formData.landmark,
            city: formData.city,
            pincode: formData.pincode,
            state: formData.state || 'Andhra Pradesh',
          }
        })
      });

      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create order');

      const { order: createdOrder } = orderData;

      // 2. Process payment
      if (useTestMode) {
        await handleTestPayment(createdOrder);
      } else {
        await handlePaytmPayment(createdOrder);
      }
    } catch (error) {
      console.error('Payment initialization failed:', error);
      alert(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-24">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-40">
        <div className="container-custom py-6">
          <div className="flex items-center justify-center gap-4 md:gap-12">
            <div className={`flex items-center gap-3 transition-colors ${step >= 1 ? 'text-[var(--color-primary)]' : 'text-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-body font-bold text-xs ${step >= 1 ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100'}`}>1</div>
              <span className="text-[10px] font-body font-bold uppercase tracking-widest hidden sm:inline">Information</span>
            </div>
            <div className="w-12 h-px bg-gray-100" />
            <div className={`flex items-center gap-3 transition-colors ${step >= 2 ? 'text-[var(--color-primary)]' : 'text-gray-300'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-body font-bold text-xs ${step >= 2 ? 'bg-[var(--color-primary)] text-white' : 'bg-gray-100'}`}>2</div>
              <span className="text-[10px] font-body font-bold uppercase tracking-widest hidden sm:inline">Payment Selection</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom pt-16">
        <div className="flex flex-col lg:flex-row gap-16">
          {/* Main Content */}
          <div className="flex-[1.5] space-y-12">
            {step === 1 ? (
              <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12 animate-fade-in">
                <div className="mb-12">
                  <h2 className="text-4xl font-display font-bold text-gray-900 mb-4 tracking-tight">Shipping Details</h2>
                  <p className="text-gray-400 font-body">Where should we deliver your curated masterpiece?</p>
                </div>
                
                <form onSubmit={handleNextStep} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-body text-sm text-gray-900 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                      <PhoneInput
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-1">Street Address</label>
                    <textarea
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({...formData, address: e.target.value})}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-body text-sm text-gray-900 focus:ring-2 focus:ring-purple-100 outline-none transition-all h-32 resize-none"
                      placeholder="House / Flat / Building Name & Street"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-1">Landmark <span className="font-normal normal-case text-gray-400">(optional)</span></label>
                    <input
                      type="text"
                      value={formData.landmark}
                      onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-body text-sm text-gray-900 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                      placeholder="Near school, temple, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-1">City</label>
                      <input
                        type="text"
                        required
                        value={formData.city}
                        onChange={(e) => setFormData({...formData, city: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-body text-sm text-gray-900 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-1">Pincode</label>
                      <input
                        type="text"
                        required
                        value={formData.pincode}
                        onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                        className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-body text-sm text-gray-900 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-1">State</label>
                    <input
                      type="text"
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl font-body text-sm text-gray-900 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
                      placeholder="State"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-5 bg-gray-900 text-white rounded-2xl font-body font-bold text-sm uppercase tracking-widest hover:bg-[var(--color-primary)] transition-all flex items-center justify-center gap-3 group"
                  >
                    <span>Continue to Payment</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
                  </button>
                </form>
              </div>
            ) : (
              <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12 animate-fade-in">
                <div className="mb-12 flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-display font-bold text-gray-900 mb-4 tracking-tight">Paytm Payment</h2>
                    <p className="text-gray-400 font-body">Complete your purchase securely via Paytm.</p>
                  </div>
                  <button onClick={() => setStep(1)} className="text-[10px] font-body font-bold text-[var(--color-primary)] uppercase tracking-widest hover:underline underline-offset-4">Back to info</button>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-[30px] border-2 border-blue-100 mb-12">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 rounded-2xl bg-[var(--color-primary)] flex items-center justify-center">
                      <Wallet className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-display font-bold text-lg text-gray-900">Paytm Secure Checkout</h4>
                      <p className="text-xs font-body text-gray-600 uppercase tracking-widest">UPI, Wallet, NetBanking, Cards & More</p>
                    </div>
                  </div>
                </div>

                {(import.meta.env.MODE === 'development' || process.env.NODE_ENV === 'development') && (
                  <div className="mb-8 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useTestMode}
                        onChange={(e) => setUseTestMode(e.target.checked)}
                        className="w-5 h-5 rounded"
                      />
                      <span className="text-xs font-body font-bold text-yellow-700 uppercase tracking-widest">
                        🧪 Test Mode - Skip Payment Gateway
                      </span>
                    </label>
                    <p className="text-xs text-yellow-600 mt-2 ml-8">Order will be marked as paid immediately for testing purposes</p>
                  </div>
                )}

                <button
                  onClick={handleProcessPayment}
                  disabled={loading}
                  className="w-full py-6 bg-[var(--color-primary)] text-white rounded-3xl font-body font-bold text-lg uppercase tracking-widest hover:shadow-2xl hover:shadow-purple-200 transition-all active:scale-95 flex items-center justify-center gap-4"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="w-6 h-6" />
                      <span>Pay Securely with Paytm</span>
                    </>
                  )}
                </button>
              </div>
            )}

            <div className="flex items-center justify-center gap-8 py-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-green-500" />
                <span className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">256-bit SSL Secure</span>
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">Encrypted Checkout</span>
              </div>
            </div>
          </div>

          {/* Sidebar Summary */}
          <div className="flex-1">
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10 md:p-12 sticky top-40 h-fit">
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-10 flex items-center gap-4">
                <ShoppingBag className="w-6 h-6" />
                Your Selection
              </h3>

              <div className="space-y-6 mb-10 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                      <img src={item.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={item.name} />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-sm font-body font-bold text-gray-900 truncate max-w-[150px]">{item.name}</h4>
                      <p className="text-[10px] font-body text-gray-400 uppercase tracking-widest">Qty: {item.quantity}{item.size ? ` • Size: ${item.size}` : ''}</p>
                    </div>
                    <div className="flex items-center font-display font-bold text-gray-900">
                      ₹{item.price * item.quantity}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-10 border-t border-gray-50">
                <div className="flex justify-between text-xs font-body text-gray-400 uppercase tracking-widest">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-bold">₹{getCartSubtotal()}</span>
                </div>
                <div className="flex justify-between text-xs font-body text-gray-400 uppercase tracking-widest">
                  <span>Service Fee</span>
                  <span className="text-gray-900 font-bold">₹{getServiceCharge()}</span>
                </div>
                <div className="flex justify-between text-xs font-body text-gray-400 uppercase tracking-widest">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="pt-8 flex flex-col">
                  <span className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-[0.3em] mb-2 text-center">GRAND TOTAL</span>
                  <span className="text-5xl font-display font-bold text-[var(--color-primary)] text-center tracking-tight">₹{getFinalTotal()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
