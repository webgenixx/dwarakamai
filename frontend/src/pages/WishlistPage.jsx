import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, Share2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useState } from 'react';

const WishlistPage = () => {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState({});

  const handleAddToCart = (product) => {
    const cartItem = {
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || product.image,
      quantity: 1,
    };

    addToCart(cartItem);
    setAddedToCart(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedToCart(prev => ({ ...prev, [product.id]: false }));
    }, 2000);
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-white py-4">
        <div className="container-custom text-center">
          <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-8">
            <Heart className="w-10 h-10 text-gray-200" />
          </div>
          <h1 className="text-4xl font-display font-bold text-gray-900 mb-4">Your collection is waiting.</h1>
          <p className="text-gray-400 font-body mb-10 max-w-md mx-auto">
            You haven't saved any treasures yet. Explore our shop to find items that speak to you.
          </p>
          <Link to="/shop" className="btn-primary">
            Explore Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="py-4 border-b border-gray-50">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="max-w-2xl">
              <span className="bg-[#FCE4EC] text-[#9D4E8D] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                Your Selection
              </span>
              <h1 className="text-6xl font-display font-bold text-gray-900 mb-6">Saved Treasures</h1>
              <p className="text-gray-400 font-body text-lg leading-relaxed">
                A curated collection of your most cherished digital finds and physical dreams, waiting for their moment.
              </p>
            </div>
            <div className="flex items-center gap-6 text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">
              <span>{wishlist.length} Items Saved</span>
              <span className="w-1 h-1 bg-gray-200 rounded-full" />
              <button onClick={clearWishlist} className="hover:text-red-500 transition-colors">Clear All</button>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="py-4">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {wishlist.map((product) => (
              <div key={product.id} className="group">
                <div className="relative aspect-square rounded-2xl overflow-hidden mb-6 bg-gray-50">
                  <img
                    src={product.image_url || product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {product.is_bestseller && (
                    <div className="absolute bottom-4 left-4">
                      <span className="bg-[#F7D060] text-gray-900 text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                        Bestseller
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-display font-bold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-xs text-gray-400 font-body">
                      {product.description || "Premium quality custom item."}
                    </p>
                  </div>
                  <span className="text-lg font-display font-bold text-gray-900">₹{product.price}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="flex-1 py-3 bg-[#8E447E] text-white rounded-xl font-body font-bold text-xs hover:bg-[#7A3B6D] transition-all shadow-md active:scale-95"
                  >
                    {addedToCart[product.id] ? 'Added!' : 'Move to Cart'}
                  </button>
                  <button 
                    onClick={() => removeFromWishlist(product.id)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl border border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inspirational Section */}
      <div className="py-4 bg-white">
        <div className="container-custom">
          <div className="relative rounded-[40px] overflow-hidden bg-gray-900 p-12 md:p-24 flex flex-col md:flex-row items-center gap-16">
            {/* Pink border effect */}
            <div className="absolute inset-4 border-2 border-pink-500/10 rounded-[32px] pointer-events-none" />
            
            <div className="relative z-10 flex-1 text-center md:text-left">
              <span className="text-[10px] font-body font-bold text-pink-400 uppercase tracking-widest mb-6 block">Curated Pick</span>
              <h2 className="text-5xl md:text-6xl font-display font-bold text-white mb-8 leading-tight">
                Designed to inspire your daily ritual.
              </h2>
              <p className="text-gray-400 font-body text-lg leading-relaxed mb-10 max-w-lg">
                Our newest collection of digital textures and tangible goods are crafted to blend seamlessly into your curated lifestyle.
              </p>
              <Link to="/shop" className="inline-flex items-center gap-2 text-pink-400 text-sm font-body font-bold hover:gap-4 transition-all">
                <span>Explore the Collection</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="relative flex-1 w-full max-w-xl aspect-video md:aspect-[4/3] rounded-2xl overflow-hidden group">
              <img 
                src="https://images.unsplash.com/photo-1493121590231-20e4fbc07b27?w=1000&h=800&fit=crop" 
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                alt="Inspirational" 
              />
              {/* Quote overlay */}
              <div className="absolute bottom-6 -right-6 md:-right-12 bg-white p-8 md:p-10 rounded-2xl shadow-2xl max-w-xs md:max-w-sm">
                <div className="w-8 h-8 bg-pink-50 rounded-lg flex items-center justify-center mb-6">
                  <div className="grid grid-cols-2 gap-1">
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
                    <div className="w-1.5 h-1.5 bg-pink-200 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-pink-200 rounded-full" />
                    <div className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-pulse" />
                  </div>
                </div>
                <p className="text-gray-800 font-serif italic text-lg leading-relaxed">
                  "The most beautiful thing we can experience is the mysterious. It is the source of all true art and all science."
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;

