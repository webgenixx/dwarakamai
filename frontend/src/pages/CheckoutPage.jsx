import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ChevronRight, MapPin, User, Mail, MessageCircle, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PhoneInput from '../components/PhoneInput';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { cart, getCartSubtotal, getServiceCharge, getFinalTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || '',
    address: '',
    landmark: '',
    city: '',
    pincode: '',
  });

  useEffect(() => {
    if (cart.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  const handleWhatsAppOrder = () => {
    // Validate form
    if (!formData.name || !formData.phone || !formData.address) {
      alert('Please fill in your basic details first.');
      return;
    }

    const itemsText = cart.map(item => `- ${item.name} (x${item.quantity}) - ₹${item.price}`).join('\n');
    const message = `New Order Inquiry!\n\n*Customer Details:*\nName: ${formData.name}\nPhone: ${formData.phone}\nEmail: ${formData.email}\nAddress: ${formData.address}, ${formData.landmark}, ${formData.city} - ${formData.pincode}\n\n*Order Summary:*\n${itemsText}\n\n*Total Amount: ₹${getFinalTotal()}*`;
    
    const whatsappUrl = `https://wa.me/919492686421?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="py-8 border-b border-gray-50">
        <div className="container-custom">
          <div className="flex items-center gap-3 text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">
            <Link to="/cart" className="hover:text-gray-900 transition-colors">Cart</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900">Checkout</span>
          </div>
        </div>
      </div>

      <div className="container-custom py-20">
        <div className="flex flex-col lg:flex-row gap-20">
          {/* Form Side */}
          <div className="flex-[1.5] space-y-16">
            <div>
              <h1 className="text-6xl font-display font-bold text-gray-900 mb-6">
                Secure <span className="italic font-serif font-medium text-[var(--color-primary)]">Checkout</span>
              </h1>
              <p className="text-gray-400 font-body text-lg">Please provide your details to finalize your curated selection.</p>
            </div>

            <div className="space-y-12">
              {/* Section 1: Customer Info */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <User className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-gray-900">Customer Information</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">Full Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 font-body text-sm text-gray-700 focus:ring-2 focus:ring-purple-100 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">Phone Number</label>
                    <PhoneInput
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-body text-sm text-gray-700 focus:ring-2 focus:ring-purple-100 transition-all"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              {/* Section 2: Shipping Address */}
              <div className="space-y-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <h3 className="text-2xl font-display font-bold text-gray-900">Shipping Address</h3>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">Street Address</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-4 font-body text-sm text-gray-700 focus:ring-2 focus:ring-purple-100 transition-all"
                    placeholder="Flat / House No. / Building Name"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">City</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 font-body text-sm text-gray-700 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest ml-4">Pincode</label>
                    <input
                      type="text"
                      value={formData.pincode}
                      onChange={(e) => setFormData({...formData, pincode: e.target.value})}
                      className="w-full bg-gray-50 border-none rounded-2xl p-4 font-body text-sm text-gray-700 focus:ring-2 focus:ring-purple-100 transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Side */}
          <div className="flex-1">
            <div className="bg-gray-50 rounded-[40px] p-10 md:p-12 sticky top-32">
              <div className="flex items-center gap-3 mb-10">
                <ShoppingBag className="w-6 h-6 text-gray-900" />
                <h3 className="text-2xl font-display font-bold text-gray-900">Summary</h3>
              </div>

              <div className="space-y-6 mb-10 max-h-60 overflow-y-auto pr-4 scrollbar-thin">
                {cart.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-white shrink-0">
                      <img src={item.image} className="w-full h-full object-cover" alt={item.name} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-body font-bold text-gray-900 leading-tight mb-1">{item.name}</h4>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-gray-400 font-body uppercase tracking-widest">Qty: {item.quantity}</span>
                        <span className="text-sm font-display font-bold text-gray-900">₹{item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-4 pt-10 border-t border-gray-200">
                <div className="flex justify-between text-gray-400 font-body text-sm">
                  <span>Subtotal</span>
                  <span>₹{getCartSubtotal()}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-body text-sm">
                  <span>Service Charge</span>
                  <span>₹{getServiceCharge()}</span>
                </div>
                <div className="flex justify-between text-gray-400 font-body text-sm">
                  <span>Shipping</span>
                  <span className="text-green-600 font-bold">FREE</span>
                </div>
                <div className="flex justify-between text-gray-900 font-display font-bold text-2xl pt-4">
                  <span>Total</span>
                  <span>₹{getFinalTotal()}</span>
                </div>
              </div>

              <div className="mt-12 space-y-4">
                <button
                  onClick={handleWhatsAppOrder}
                  className="w-full py-5 bg-[#8E447E] text-white rounded-2xl font-body font-bold text-sm uppercase tracking-widest hover:bg-[#7A3B6D] transition-all shadow-xl active:scale-95 flex items-center justify-center gap-3"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Order via WhatsApp</span>
                </button>
                <div className="flex items-center justify-center gap-2 text-gray-400 font-body text-[10px] uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-green-500" />
                  <span>100% Encrypted & Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;

