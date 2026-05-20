import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ShoppingCart, Upload, Star, ChevronRight, Minus, Plus, MessageSquare, Truck, ShieldCheck, ArrowRight, Edit3, Pencil, Trash2, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [customization, setCustomization] = useState({
    image: null,
    imagePreview: null,
    message: '',
    uploadingImage: false,
  });

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState({ total: 0, avg: 0, breakdown: {} });
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 0, title: '', comment: '' });
  const [hoverRating, setHoverRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null); // review object being edited
  const [userReview, setUserReview] = useState(null); // current user's existing review
  const [canReview, setCanReview] = useState(false); // whether user is eligible to review

  useEffect(() => {
    fetchProduct();
    fetchRelatedProducts();
    fetchReviews();
    window.scrollTo(0, 0);
    setSelectedImage(0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`);
      if (!response.ok) throw new Error('Product not found');
      const data = await response.json();
      setProduct(data);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      setProduct(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products?limit=4`);
      if (response.ok) {
        const data = await response.json();
        setRelatedProducts(data.products.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to fetch related products:', error);
    }
  };

  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      const token = localStorage.getItem('token');

      // Fetch reviews (public)
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data.reviews);
        setReviewStats({ total: data.total, avg: data.avg, breakdown: data.breakdown });

        // Find current user's own review
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const mine = data.reviews.find(r => r.user_id === payload.id);
            setUserReview(mine || null);
          } catch {}
        }
      }

      // Check review eligibility (only if logged in)
      if (token) {
        try {
          const eligRes = await fetch(
            `${import.meta.env.VITE_API_URL}/api/products/${id}/reviews/can-review`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (eligRes.ok) {
            const eligData = await eligRes.json();
            setCanReview(eligData.canReview);
            // If already reviewed, populate userReview from eligibility response too
            if (eligData.review) setUserReview(eligData.review);
          }
        } catch {}
      }
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (reviewForm.rating === 0) { alert('Please select a star rating.'); return; }
    if (!isAuthenticated()) { navigate('/login', { state: { from: { pathname: `/product/${id}` } } }); return; }

    setSubmittingReview(true);
    try {
      const token = localStorage.getItem('token');
      const isEdit = !!editingReview;
      const url = isEdit
        ? `${import.meta.env.VITE_API_URL}/api/products/${id}/reviews/${editingReview._id}`
        : `${import.meta.env.VITE_API_URL}/api/products/${id}/reviews`;

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(reviewForm),
      });
      const data = await res.json();
      if (res.ok) {
        setReviewForm({ rating: 0, title: '', comment: '' });
        setEditingReview(null);
        fetchReviews();
      } else {
        alert(data.error || 'Failed to submit review');
      }
    } catch (error) {
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('Delete your review?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchReviews();
    } catch (error) {
      alert('Failed to delete review');
    }
  };

  const startEditReview = (review) => {
    setEditingReview(review);
    setReviewForm({ rating: review.rating, title: review.title || '', comment: review.comment });
    document.getElementById('review-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setCustomization({
        ...customization,
        uploadingImage: true,
      });

      try {
        const formData = new FormData();
        formData.append('customizationImage', file);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/designs/upload-customization`, {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();
        if (response.ok && data.imageUrl) {
          setCustomization({
            ...customization,
            image: data.imageUrl,
            imagePreview: data.imageUrl,
            uploadingImage: false,
          });
        } else {
          alert(`Failed to upload image: ${data.error || 'Unknown error'}`);
          setCustomization(prev => ({ ...prev, uploadingImage: false }));
        }
      } catch (error) {
        console.error('Error uploading customization image:', error);
        alert('Error uploading image: ' + error.message);
        setCustomization(prev => ({ ...prev, uploadingImage: false }));
      }
    }
  };

  const buildCartItem = () => {
    const selectedSize = product.customization_options?.sizes?.length > 0
      ? product.customization_options.sizes[selectedSizeIndex]
      : null;

    return {
      id: product.id,
      name: product.name,
      image: product.image_url || product.image,
      price: selectedSize ? selectedSize.price : product.price,
      quantity,
      size: selectedSize ? selectedSize.name : null,
      customization: product.customizable
        ? {
            image: customization.image,
            message: customization.message,
          }
        : null,
    };
  };

  const handleAddToCart = () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: `/product/${product.id}` } } });
      return;
    }

    addToCart(buildCartItem());
    navigate('/cart');
  };

  const handleBuyNow = () => {
    if (!isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: `/product/${product.id}` } } });
      return;
    }

    const cartItem = buildCartItem();
    if (
      cartItem.customization &&
      typeof cartItem.customization === 'object' &&
      !cartItem.customization.image
    ) {
      alert('Please upload a photo for this customizable product before checkout.');
      return;
    }

    addToCart(cartItem);
    navigate('/checkout');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-gray-100 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <h2 className="text-2xl font-display font-bold mb-4">Product not found</h2>
        <button onClick={() => navigate('/shop')} className="btn-primary">Back to Shop</button>
      </div>
    </div>
  );

  // Build the images array from real product data
  const images = (() => {
    if (product.images && product.images.length > 0) {
      return product.images.map(img => img.url).filter(Boolean);
    }
    if (product.image_url) return [product.image_url];
    return [];
  })();

  return (
    <div className="min-h-screen bg-white">
      {/* Breadcrumbs */}
      <div className="bg-white py-4">
        <div className="container-custom">
          <nav className="flex items-center gap-2 text-xs font-body font-bold tracking-widest text-gray-400 uppercase">
            <Link to="/shop" className="hover:text-[var(--color-primary)] transition-colors">Shop</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to={`/shop/${product.category_slug || 'all'}`} className="hover:text-[var(--color-primary)] transition-colors">
              {product.category_name || 'Custom Gifts'}
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-900">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-custom py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
          {/* Product Media */}
          <div className="flex gap-6 items-start">
            {/* Thumbnails — only shown when there are additional images */}
            {images.length > 1 && (
              <div className="hidden md:flex flex-col gap-3">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-20 h-20 rounded-xl overflow-hidden border-2 transition-all flex-shrink-0 ${
                      selectedImage === idx
                        ? 'border-[var(--color-primary)] shadow-md'
                        : 'border-gray-100 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-contain" alt={`Product view ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image Viewer */}
            <div className="relative flex-1 aspect-square max-w-sm rounded-2xl overflow-hidden bg-gray-50 shadow-2xl shadow-gray-200 border-2 border-gray-300">
              {images.length > 0 ? (
                <img
                  src={images[selectedImage]}
                  className="w-full h-full object-contain transition-opacity duration-300"
                  alt={product.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">No image</div>
              )}
              <div className="absolute top-6 left-6">
                <span className="bg-gray-900 text-white text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest">
                  Best Seller
                </span>
              </div>

              {/* Mobile thumbnail dots — only when multiple images */}
              {images.length > 1 && (
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 md:hidden">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        selectedImage === idx ? 'bg-white scale-125 shadow' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="animate-slide-up">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-gray-900 mb-4 leading-tight">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mb-8">
              <span className="text-3xl font-display font-bold text-[var(--color-primary)]">
                ₹{product.customization_options?.sizes?.length > 0 
                    ? product.customization_options.sizes[selectedSizeIndex]?.price || product.price
                    : product.price}
              </span>
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3 h-3 ${i < Math.round(reviewStats.avg) ? 'fill-[#F7D060] text-[#F7D060]' : 'text-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-body font-bold">
                  {reviewStats.total > 0 ? `(${reviewStats.total} Review${reviewStats.total !== 1 ? 's' : ''})` : '(No reviews yet)'}
                </span>
              </div>
            </div>

            <p className="text-gray-500 font-body text-lg leading-relaxed mb-12">
              {product.description || "A high-quality personalized item crafted just for you. The perfect way to preserve your favorite memories and share them with the world."}
            </p>

            {/* Customization */}
            {product.customizable && (
              <div className="space-y-10 mb-12">
                {/* 1. Image Upload */}
                <div>
                  <h4 className="text-xs font-body font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">1. Personalize with image</h4>
                  <div className="border-2 border-dashed border-gray-100 rounded-2xl p-8 bg-gray-50/50 hover:bg-gray-50 hover:border-purple-200 transition-all text-center">
                    {customization.imagePreview ? (
                      <div className="relative group inline-block">
                        <img src={customization.imagePreview} className="max-h-40 rounded-xl shadow-lg" alt="Upload preview" />
                        <button 
                          onClick={() => setCustomization({...customization, image: null, imagePreview: null})}
                          className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md"
                        >
                          <Plus className="w-4 h-4 rotate-45" />
                        </button>
                      </div>
                    ) : customization.uploadingImage ? (
                      <div className="cursor-not-allowed block">
                        <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                          <div className="w-6 h-6 border-2 border-gray-200 border-t-[var(--color-primary)] rounded-full animate-spin"></div>
                        </div>
                        <p className="text-sm font-body font-bold text-gray-700 mb-1">Uploading...</p>
                        <p className="text-[10px] text-gray-400 font-body">Please wait while we upload your image</p>
                      </div>
                    ) : (
                      <label className="cursor-pointer block group">
                        <div className="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                          <Upload className="w-6 h-6 text-[var(--color-primary)]" />
                        </div>
                        <p className="text-sm font-body font-bold text-gray-700 mb-1">Upload Photo</p>
                        <p className="text-[10px] text-gray-400 font-body">High resolution JPG or PNG recommended</p>
                        <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" disabled={customization.uploadingImage} />
                      </label>
                    )}
                  </div>
                </div>

                {/* 2. Custom Message */}
                <div>
                  <h4 className="text-xs font-body font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">2. Add a custom message</h4>
                  <textarea
                    placeholder="Write your heartfelt note here..."
                    value={customization.message}
                    onChange={(e) => setCustomization({...customization, message: e.target.value})}
                    className="w-full bg-gray-50 border-none rounded-2xl p-6 font-body text-sm text-gray-700 focus:ring-2 focus:ring-purple-100 h-32 resize-none transition-all"
                  />
                </div>
              </div>
            )}

            {/* Size Options */}
            {product.customization_options?.sizes?.length > 0 && (
              <div className="mb-10 animate-fade-in">
                <h4 className="text-xs font-body font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">Select Size</h4>
                <div className="flex flex-wrap gap-4">
                  {product.customization_options.sizes.map((size, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedSizeIndex(index)}
                      className={`px-6 py-3 rounded-xl border-2 font-body font-bold transition-all ${
                        selectedSizeIndex === index 
                          ? 'border-[var(--color-primary)] bg-purple-50 text-[var(--color-primary)] shadow-md' 
                          : 'border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-10">
              <h4 className="text-xs font-body font-bold tracking-[0.2em] text-gray-400 uppercase mb-4">Quantity</h4>
              <div className="inline-flex items-center bg-gray-50 rounded-full px-2 py-1">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 text-center font-body font-bold text-gray-900">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center text-gray-500 hover:text-gray-900"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              <button 
                onClick={handleAddToCart}
                className="py-4 bg-[#8E447E] text-white rounded-xl font-body font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#7A3B6D] transition-all shadow-lg active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button 
                type="button"
                onClick={handleBuyNow}
                className="py-4 bg-[#F7D060] text-gray-900 rounded-xl font-body font-bold text-sm flex items-center justify-center hover:bg-[#EAB308] transition-all shadow-lg active:scale-95"
              >
                <span>Buy</span>
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-8 text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#10B981]" />
                <span>Ships in 2-3 days</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[var(--color-primary)]" />
                <span>Quality Guarantee</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-24">
          <div className="flex gap-12 border-b border-gray-100 mb-12">
            {[
              { id: 'description', label: 'Product Description' },
            { id: 'reviews', label: `Customer Reviews (${reviewStats.total})` },
              { id: 'shipping', label: 'Shipping & Returns' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 text-[10px] font-body font-bold tracking-widest uppercase transition-all relative ${activeTab === tab.id ? 'text-[var(--color-primary)]' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-primary)]" />}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-20">
            <div className="lg:col-span-2">
              {activeTab === 'description' && (
                <div className="animate-fade-in">
                  <h3 className="text-3xl font-display font-bold text-gray-900 mb-6 italic">Unveil the Magic of Memories</h3>
                  <p className="text-gray-500 font-body leading-relaxed mb-10">
                    Our {product.name} is crafted from premium grade materials with a specialized finish. When at room temperature, the item appears as a sleek, matte vessel—perfectly inconspicuous. As you interact with it, the coating becomes transparent, revealing a vibrant, high-definition photo of your choice.
                  </p>
                  <div className="grid grid-cols-2 gap-y-10">
                    {product.material && (
                      <div>
                        <h5 className="text-[10px] font-body font-bold tracking-widest text-gray-400 uppercase mb-2">Material</h5>
                        <p className="text-sm font-body text-gray-700">{product.material}</p>
                      </div>
                    )}
                    {product.sizes && product.sizes.length > 0 && (
                      <div>
                        <h5 className="text-[10px] font-body font-bold tracking-widest text-gray-400 uppercase mb-2">Available Sizes</h5>
                        <div className="flex flex-wrap gap-2">
                          {product.sizes.map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm font-body rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <h5 className="text-[10px] font-body font-bold tracking-widest text-gray-400 uppercase mb-2">Care</h5>
                      <p className="text-sm font-body text-gray-700">Handwash recommended to preserve coating</p>
                    </div>
                    <div>
                      <h5 className="text-[10px] font-body font-bold tracking-widest text-gray-400 uppercase mb-2">Print Tech</h5>
                      <p className="text-sm font-body text-gray-700">Thermodynamic Sublimation</p>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'reviews' && (
                <div className="animate-fade-in space-y-10">

                  {/* Stats summary */}
                  {reviewStats.total > 0 && (
                    <div className="flex flex-col sm:flex-row gap-8 p-6 bg-gray-50 rounded-2xl">
                      {/* Average score */}
                      <div className="flex flex-col items-center justify-center min-w-[100px]">
                        <span className="text-5xl font-display font-bold text-gray-900">{reviewStats.avg}</span>
                        <div className="flex mt-1">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`w-4 h-4 ${s <= Math.round(reviewStats.avg) ? 'fill-[#F7D060] text-[#F7D060]' : 'text-gray-200'}`} />
                          ))}
                        </div>
                        <span className="text-xs text-gray-400 mt-1">{reviewStats.total} review{reviewStats.total !== 1 ? 's' : ''}</span>
                      </div>
                      {/* Breakdown bars */}
                      <div className="flex-1 space-y-2">
                        {[5,4,3,2,1].map(star => {
                          const count = reviewStats.breakdown[star] || 0;
                          const pct = reviewStats.total > 0 ? Math.round((count / reviewStats.total) * 100) : 0;
                          return (
                            <div key={star} className="flex items-center gap-3">
                              <span className="text-xs font-body font-bold text-gray-500 w-4">{star}</span>
                              <Star className="w-3 h-3 fill-[#F7D060] text-[#F7D060] flex-shrink-0" />
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-[#F7D060] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Write / Edit review form — only for eligible users */}
                  {isAuthenticated() && canReview && !userReview && !editingReview && (
                    <div id="review-form" className="border border-gray-100 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="w-2 h-2 rounded-full bg-green-400"></span>
                        <h4 className="text-sm font-body font-bold text-gray-900">Write a Review</h4>
                      </div>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        {/* Star picker */}
                        <div>
                          <label className="text-xs font-body font-bold tracking-widest text-gray-400 uppercase mb-2 block">Your Rating</label>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(s => (
                              <button
                                key={s}
                                type="button"
                                onMouseEnter={() => setHoverRating(s)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                                className="focus:outline-none"
                              >
                                <Star className={`w-7 h-7 transition-colors ${
                                  s <= (hoverRating || reviewForm.rating)
                                    ? 'fill-[#F7D060] text-[#F7D060]'
                                    : 'text-gray-200'
                                }`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-body font-bold tracking-widest text-gray-400 uppercase mb-1 block">Title (optional)</label>
                          <input
                            type="text"
                            placeholder="Summarise your experience"
                            value={reviewForm.title}
                            onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-body font-bold tracking-widest text-gray-400 uppercase mb-1 block">Review</label>
                          <textarea
                            required
                            placeholder="Share your experience with this product..."
                            value={reviewForm.comment}
                            onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                            rows={4}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-none"
                          />
                        </div>
                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="px-6 py-2.5 bg-[#8E447E] text-white rounded-xl font-body font-bold text-sm hover:bg-[#7A3B6D] transition-all disabled:opacity-50"
                        >
                          {submittingReview ? 'Submitting...' : 'Submit Review'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* Edit form — shown when user clicks Edit on their review */}
                  {editingReview && (
                    <div id="review-form" className="border border-[var(--color-primary)]/30 rounded-2xl p-6 bg-purple-50/30">
                      <h4 className="text-sm font-body font-bold text-gray-900 mb-4">Edit Your Review</h4>
                      <form onSubmit={handleSubmitReview} className="space-y-4">
                        <div>
                          <label className="text-xs font-body font-bold tracking-widest text-gray-400 uppercase mb-2 block">Your Rating</label>
                          <div className="flex gap-1">
                            {[1,2,3,4,5].map(s => (
                              <button
                                key={s}
                                type="button"
                                onMouseEnter={() => setHoverRating(s)}
                                onMouseLeave={() => setHoverRating(0)}
                                onClick={() => setReviewForm(f => ({ ...f, rating: s }))}
                                className="focus:outline-none"
                              >
                                <Star className={`w-7 h-7 transition-colors ${
                                  s <= (hoverRating || reviewForm.rating)
                                    ? 'fill-[#F7D060] text-[#F7D060]'
                                    : 'text-gray-200'
                                }`} />
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs font-body font-bold tracking-widest text-gray-400 uppercase mb-1 block">Title (optional)</label>
                          <input
                            type="text"
                            placeholder="Summarise your experience"
                            value={reviewForm.title}
                            onChange={e => setReviewForm(f => ({ ...f, title: e.target.value }))}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-body font-bold tracking-widest text-gray-400 uppercase mb-1 block">Review</label>
                          <textarea
                            required
                            placeholder="Share your experience with this product..."
                            value={reviewForm.comment}
                            onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                            rows={4}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30 resize-none"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            type="submit"
                            disabled={submittingReview}
                            className="px-6 py-2.5 bg-[#8E447E] text-white rounded-xl font-body font-bold text-sm hover:bg-[#7A3B6D] transition-all disabled:opacity-50"
                          >
                            {submittingReview ? 'Updating...' : 'Update Review'}
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditingReview(null); setReviewForm({ rating: 0, title: '', comment: '' }); }}
                            className="px-6 py-2.5 border border-gray-200 text-gray-600 rounded-xl font-body font-bold text-sm hover:bg-gray-50 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Already reviewed banner */}
                  {isAuthenticated() && userReview && !editingReview && (
                    <div className="bg-green-50 border border-green-100 rounded-2xl px-6 py-4 flex items-center justify-between">
                      <p className="text-sm font-body text-green-700">You've already reviewed this product.</p>
                      <button onClick={() => startEditReview(userReview)} className="text-xs font-bold text-green-700 underline">Edit</button>
                    </div>
                  )}

                  {/* Not eligible — not logged in */}
                  {!isAuthenticated() && (
                    <div className="bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 text-center">
                      <p className="text-sm font-body text-gray-500">
                        <button onClick={() => navigate('/login', { state: { from: { pathname: `/product/${id}` } } })} className="text-[var(--color-primary)] font-bold underline">Login</button>
                        {' '}to leave a review after receiving your order.
                      </p>
                    </div>
                  )}

                  {/* Not eligible — logged in but no delivered order */}
                  {isAuthenticated() && !canReview && !userReview && (
                    <div className="bg-amber-50 border border-amber-100 rounded-2xl px-6 py-5 flex items-start gap-3">
                      <span className="text-lg">📦</span>
                      <p className="text-sm font-body text-amber-700">
                        You can write a review once your order for this product has been delivered.
                      </p>
                    </div>
                  )}

                  {/* Reviews list */}
                  {reviewsLoading ? (
                    <div className="space-y-4">
                      {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
                    </div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 rounded-2xl">
                      <MessageSquare className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                      <p className="text-gray-400 font-body text-sm">No reviews yet. Be the first!</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {reviews.map(review => {
                        const token = localStorage.getItem('token');
                        let isOwner = false;
                        try { const p = JSON.parse(atob(token.split('.')[1])); isOwner = p.id === review.user_id; } catch {}
                        return (
                          <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center flex-shrink-0">
                                  <span className="text-sm font-bold text-[var(--color-primary)]">
                                    {review.user_name?.[0]?.toUpperCase() || 'U'}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-body font-bold text-gray-900">{review.user_name}</p>
                                  <p className="text-[10px] text-gray-400">{new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex">
                                  {[1,2,3,4,5].map(s => (
                                    <Star key={s} className={`w-3.5 h-3.5 ${s <= review.rating ? 'fill-[#F7D060] text-[#F7D060]' : 'text-gray-200'}`} />
                                  ))}
                                </div>
                                {isOwner && (
                                  <div className="flex gap-1 ml-2">
                                    <button onClick={() => startEditReview(review)} className="p-1 text-gray-400 hover:text-blue-500 transition-colors">
                                      <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleDeleteReview(review._id)} className="p-1 text-gray-400 hover:text-red-500 transition-colors">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                            {review.title && (
                              <p className="mt-3 text-sm font-body font-bold text-gray-800">{review.title}</p>
                            )}
                            <p className="mt-2 text-sm font-body text-gray-500 leading-relaxed">{review.comment}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'shipping' && (
                <div className="animate-fade-in text-gray-500 font-body leading-relaxed">
                  <h3 className="text-2xl font-display font-bold text-gray-900 mb-4">Fast & Secure Shipping</h3>
                  <p className="mb-4">We ship worldwide from our Eluru studio. Orders are typically processed within 24-48 hours.</p>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Domestic (India): 3-5 business days</li>
                    <li>International: 7-14 business days</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar — Rating Summary */}
            <div className="bg-[#F9FAFB] rounded-2xl p-10">
              <h4 className="text-xl font-display font-bold text-gray-900 mb-6">Customer Ratings</h4>
              {reviewStats.total === 0 ? (
                <p className="text-sm text-gray-400 font-body">No ratings yet.</p>
              ) : (
                <>
                  <div className="flex items-end gap-3 mb-6">
                    <span className="text-6xl font-display font-bold text-gray-900 leading-none">{reviewStats.avg}</span>
                    <div className="pb-1">
                      <div className="flex mb-1">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-4 h-4 ${s <= Math.round(reviewStats.avg) ? 'fill-[#F7D060] text-[#F7D060]' : 'text-gray-200'}`} />
                        ))}
                      </div>
                      <p className="text-xs text-gray-400 font-body">{reviewStats.total} review{reviewStats.total !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="space-y-2 mb-8">
                    {[5,4,3,2,1].map(star => {
                      const count = reviewStats.breakdown[star] || 0;
                      const pct = reviewStats.total > 0 ? Math.round((count / reviewStats.total) * 100) : 0;
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-xs font-body text-gray-500 w-3">{star}</span>
                          <Star className="w-3 h-3 fill-[#F7D060] text-[#F7D060] flex-shrink-0" />
                          <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#F7D060] rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-6 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className="text-[10px] font-body font-bold tracking-widest text-[var(--color-primary)] uppercase hover:underline"
                  >
                    Read All {reviewStats.total} Review{reviewStats.total !== 1 ? 's' : ''}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* You May Also Love */}
        <div>
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-display font-bold text-gray-900 mb-2">You May Also Love</h2>
              <p className="text-gray-400 font-body text-sm">Curated sentimental gifts to complete your collection.</p>
            </div>
            <Link to="/shop" className="group flex items-center gap-2 text-xs font-body font-bold tracking-widest text-[var(--color-primary)] uppercase">
              <span>View Entire Shop</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {relatedProducts.length > 0 ? (
              relatedProducts.map(p => (
                <ProductCard key={p.id} product={p} />
              ))
            ) : (
              // Fallback cards if no related products
              [1, 2, 3, 4].map(i => (
                <div key={i} className="bg-gray-50 aspect-square rounded-2xl animate-pulse" />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

