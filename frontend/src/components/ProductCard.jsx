import { useNavigate } from 'react-router-dom';
import { Star, Edit3, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

const getImageSrc = (url, apiUrl) => {
  if (!url) return 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop';
  return url.startsWith('http') ? url : `${apiUrl}${url}`;
};

const ProductCard = ({ product, showWishlist = false }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const apiUrl = import.meta.env.VITE_API_URL;

  // Only show the main image (first image) on the card
  const mainImage = (() => {
    if (product.images && product.images.length > 0) return product.images[0].url || product.images[0];
    return product.image_url || product.image || null;
  })();

  const handleCardClick = () => navigate(`/product/${product.id}`);

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) { navigate('/login'); return; }
    toggleWishlist(product);
  };

  const handleCustomize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated()) { navigate('/login'); } else { navigate(`/product/${product.id}`); }
  };

  const rating = product.rating || 5;
  const reviewCount = product.reviews_count || Math.floor(Math.random() * 50) + 10;

  return (
    <div
      onClick={handleCardClick}
      className="group bg-white rounded-2xl p-4 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-100 cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square rounded-xl overflow-hidden mb-5 bg-gray-50">

        {/* Main image only */}
        <img
          src={getImageSrc(mainImage, apiUrl)}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop';
          }}
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.is_trending && (
            <span className="bg-[#F7D060] text-gray-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Trending
            </span>
          )}
          {product.is_handmade && (
            <span className="bg-[#FCE4EC] text-[#9D4E8D] text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              Handmade
            </span>
          )}
          {!product.is_trending && !product.is_handmade && product.discount > 0 && (
            <span className="bg-[var(--color-primary)] text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
              {product.discount}% Off
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        {showWishlist && (
          <button
            onClick={handleWishlist}
            className="absolute top-3 right-3 z-10 bg-white/80 backdrop-blur-md p-2 rounded-full shadow-sm hover:bg-white transition-all duration-300 group/wishlist"
          >
            <Heart
              className={`w-4 h-4 transition-all duration-300 ${
                isInWishlist(product.id)
                  ? 'fill-[var(--color-primary)] text-[var(--color-primary)] scale-110'
                  : 'text-gray-400 group-hover/wishlist:text-[var(--color-primary)]'
              }`}
            />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-1">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-display font-bold text-lg text-gray-900 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
            {product.name}
          </h3>
          <span className="font-display font-bold text-lg text-[var(--color-primary)] whitespace-nowrap">
            ₹{product.price}
          </span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-6">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${i < rating ? 'fill-[#F7D060] text-[#F7D060]' : 'text-gray-200'}`}
              />
            ))}
          </div>
          <span className="text-[10px] text-gray-400 font-body font-medium">({reviewCount})</span>
        </div>

        {/* Action Button */}
        <button
          onClick={handleCustomize}
          className="w-full py-3 bg-[#8E447E] hover:bg-[#7A3B6D] text-white rounded-xl font-body font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
        >
          <Edit3 className="w-4 h-4" />
          <span>Customize</span>
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
