import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowLeft, MessageCircle, ShieldCheck, AlertCircle, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, getCartSubtotal, getFinalTotal } = useCart();
  const { isAuthenticated } = useAuth();
  const [missingImageItems, setMissingImageItems] = useState([]);

  const subtotal = getCartSubtotal();
  const shipping = 99;
  const tax = Math.round(subtotal * 0.18);
  const grandTotal = subtotal + shipping + tax;

  const handleProceedToCheckout = () => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    // Block checkout if any customizable item is missing its photo upload
    const itemsMissingImage = cart.filter(item =>
      item.customization &&
      typeof item.customization === 'object' &&
      !item.customization.image
    );

    if (itemsMissingImage.length > 0) {
      setMissingImageItems(itemsMissingImage);
      return;
    }

    navigate('/checkout');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-8">
        <h2 className="text-4xl font-display font-bold text-gray-900 mb-4">Your Selection is Empty</h2>
        <p className="text-gray-400 font-body mb-8">Begin your curation journey in our studio shop.</p>
        <button 
          onClick={() => navigate('/shop')} 
          className="px-12 py-4 bg-gray-900 text-white font-body font-bold uppercase tracking-widest text-sm rounded-full hover:bg-[var(--color-primary)] transition-all"
        >
          Explore Shop
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/50 pt-12 pb-24">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-4 tracking-tight">Your Selection</h1>
          <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-[0.3em]">
            A COLLECTION OF YOUR CURATED SENTIMENTS
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-12 items-start">
          {/* Cart Items */}
          <div className="space-y-6">
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-8 md:p-12 space-y-12">
              {cart.map((item, idx) => (
                <div key={item.id} className={`flex flex-col md:flex-row gap-8 pb-12 ${idx !== cart.length - 1 ? 'border-b border-gray-50' : ''}`}>
                  {/* Image */}
                  <div className="w-full md:w-48 h-48 rounded-[30px] overflow-hidden bg-gray-100 flex-shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between py-2">
                    <div>
                      <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">{item.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.size && (
                          <span className="px-3 py-1 bg-pink-50 text-[10px] font-body font-bold text-pink-600 uppercase tracking-widest rounded-full">
                            SIZE: {item.size}
                          </span>
                        )}
                        {item.customization?.image && (
                          <span className="px-3 py-1 bg-purple-50 text-[10px] font-body font-bold text-purple-600 uppercase tracking-widest rounded-full">
                            PHOTO: UPLOADED
                          </span>
                        )}
                        {Object.entries(item.customization?.textInputs || {}).map(([key, value]) => (
                          <span key={key} className="px-3 py-1 bg-gray-100 text-[10px] font-body font-bold text-gray-600 uppercase tracking-widest rounded-full">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm italic font-serif text-gray-400">Hand-finished with premium oil</p>
                    </div>

                    <div className="flex items-center justify-between mt-8 md:mt-0">
                      <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 gap-6">
                        <button 
                          onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                          className="text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-body font-bold text-gray-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="text-gray-400 hover:text-gray-900 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-8">
                        <span className="text-2xl font-display font-bold text-gray-900">₹{(item.finalPrice * item.quantity).toLocaleString()}</span>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <Link to="/shop" className="flex items-center gap-3 text-sm font-body font-bold text-[var(--color-primary)] uppercase tracking-widest group">
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-2" />
                <span>Continue Shopping</span>
              </Link>

              <div className="w-full md:w-auto bg-[#FFF9E5] border border-[#F7D060] rounded-2xl px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#B18C2D]">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <p className="text-xs font-body font-bold text-[#866D23]">
                  Need help with customization? <a href="https://wa.me/yournumber" className="underline decoration-2 underline-offset-4">Order via WhatsApp</a>
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="sticky top-32 space-y-6">
            <div className="bg-white rounded-[40px] shadow-sm border border-gray-100 p-10">
              <h2 className="text-3xl font-display font-bold text-gray-900 mb-10">Order Summary</h2>
              
              <div className="space-y-6 mb-10 pb-10 border-b border-gray-50">
                <div className="flex justify-between font-body text-gray-500">
                  <span>Subtotal</span>
                  <span className="text-gray-900 font-bold">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-body text-gray-500">
                  <span>Shipping</span>
                  <span className="text-gray-900 font-bold">₹{shipping}</span>
                </div>
                <div className="flex justify-between font-body text-gray-500">
                  <span>Tax (GST 18%)</span>
                  <span className="text-gray-900 font-bold">₹{tax.toLocaleString()}</span>
                </div>
              </div>

              <div className="mb-10">
                <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-[0.3em] mb-2">GRAND TOTAL</p>
                <p className="text-6xl font-display font-bold text-[var(--color-primary)]">₹{grandTotal.toLocaleString()}</p>
              </div>

              <button 
                onClick={handleProceedToCheckout}
                className="w-full py-6 bg-[var(--color-primary)] text-white rounded-3xl font-body font-bold text-lg hover:shadow-2xl hover:shadow-purple-200 transition-all active:scale-95"
              >
                Proceed to Checkout
              </button>
              <p className="text-center text-[10px] font-body font-bold text-gray-300 uppercase tracking-widest mt-4">
                SECURE ENCRYPTED TRANSACTIONS ONLY
              </p>
            </div>

            {/* Satisfaction Card */}
            <div className="bg-white rounded-[30px] border border-gray-100 p-8 flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-900">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-[10px] font-body font-bold text-gray-900 uppercase tracking-widest mb-2">SATISFACTION GUARANTEED</h4>
                <p className="text-[10px] font-body leading-relaxed text-gray-400 uppercase tracking-wider">
                  Each item is individually crafted by our boutique studio artists. We ensure every detail matches your memory.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Missing image warning modal */}
      {missingImageItems.length > 0 && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slide-up">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="text-xl font-display font-bold text-gray-900">Photo Required</h3>
              </div>
              <button
                onClick={() => setMissingImageItems([])}
                className="text-gray-300 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm font-body text-gray-500 mb-6 leading-relaxed">
              The following customizable product{missingImageItems.length > 1 ? 's require' : ' requires'} a photo upload before you can proceed to checkout:
            </p>

            <div className="space-y-3 mb-8">
              {missingImageItems.map((item, i) => (
                <div key={i} className="flex items-center gap-4 p-3 bg-amber-50 border border-amber-100 rounded-2xl">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    onError={e => { e.target.src = '/images/image.png'; }}
                  />
                  <div>
                    <p className="text-sm font-body font-bold text-gray-900">{item.name}</p>
                    <p className="text-xs text-amber-600 font-body mt-0.5">📸 Photo not uploaded</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setMissingImageItems([]);
                  // Navigate to the product page of the first missing item
                  navigate(`/product/${missingImageItems[0].id}`);
                }}
                className="flex-1 py-3 bg-[var(--color-primary)] text-white rounded-2xl font-body font-bold text-sm hover:bg-[#7A3B6D] transition-all"
              >
                Upload Photo
              </button>
              <button
                onClick={() => setMissingImageItems([])}
                className="flex-1 py-3 border border-gray-200 text-gray-600 rounded-2xl font-body font-bold text-sm hover:bg-gray-50 transition-all"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;

