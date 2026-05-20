import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronDown, Search } from 'lucide-react';
import ProductCard from '../components/ProductCard';

const SORT_OPTIONS = [
  { value: 'popularity', label: 'Popularity' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest Arrivals' },
];

const ShopPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState(category || 'all');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('popularity');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy]);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
    } else {
      setSelectedCategory('all');
    }
  }, [category]);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `${import.meta.env.VITE_API_URL}/api/products?`;
      if (selectedCategory !== 'all') {
        url += `category=${selectedCategory}&`;
      }

      const response = await fetch(url);
      const data = await response.json();
      let fetchedProducts = data.products || [];

      // Manual sorting if needed (usually handled by backend, but for completeness)
      if (sortBy === 'price_asc') fetchedProducts.sort((a, b) => a.price - b.price);
      if (sortBy === 'price_desc') fetchedProducts.sort((a, b) => b.price - a.price);

      setProducts(fetchedProducts);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (catId) => {
    if (catId === 'all') {
      navigate('/shop');
    } else {
      navigate(`/shop/${catId}`);
    }
  };

  const SHOP_CATEGORIES = [
    { id: 'all', name: 'All Products' },
    { id: 'cakes', name: 'Cakes' },
    { id: 'chocolate-bouquets', name: 'Chocolate Bouquets' },
    { id: 'couple-gifts', name: 'Couple Gifts' },
    { id: 'event-needs', name: 'Event Needs' },
    { id: 'flower-bouquets', name: 'Flower Bouquets' },
    { id: 'interior-gifts-decor', name: 'Interior Gifts & Decor' },
    { id: 'mugs', name: 'Mugs' },
    { id: 'personalised-gifts', name: 'Personalised Gifts' },
    { id: 'photo-frames', name: 'Photo Frames' },
    { id: 'plants', name: 'Plants' },
    { id: 'printing-works', name: 'Printing Works' },
    { id: 't-shirts', name: 'T-Shirts' },
  ];

  return (
    <div className="min-h-screen bg-white">

      {/* Page Title & Filter Bar */}
      {/* Filter & Category Bar */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-100 py-6">
        <div className="container-custom">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Category Dropdown */}
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-widest hidden sm:inline">Collection:</span>
              <div className="relative group min-w-[240px]">
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full appearance-none bg-white border-2 border-gray-50 rounded-2xl px-6 py-3.5 pr-12 font-body text-sm font-bold text-gray-900 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-purple-50 outline-none transition-all cursor-pointer shadow-sm hover:border-gray-100"
                >
                  {SHOP_CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-[var(--color-primary)] transition-colors" />
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center justify-between lg:justify-end gap-6 border-t lg:border-t-0 pt-4 lg:pt-0">
              <p className="text-gray-400 font-body text-sm italic">
                Showing {products.length} treasures
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <div className="py-4 bg-[#FAFAFA]">
        <div className="container-custom">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-40">
              <div className="w-16 h-16 border-4 border-gray-100 border-t-[var(--color-primary)] rounded-full animate-spin mb-4" />
              <p className="text-gray-400 font-body animate-pulse">Gathering gifts...</p>
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-slide-up"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <ProductCard product={product} showWishlist={true} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-40">
              <Search className="w-16 h-16 text-gray-200 mx-auto mb-6" />
              <h3 className="text-2xl font-display font-bold text-gray-900 mb-2">No Gifts Found</h3>
              <p className="text-gray-500 font-body mb-8">We couldn't find any treasures matching your selection.</p>
              <button
                onClick={() => handleCategoryChange('all')}
                className="btn-primary"
              >
                View All Collection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShopPage;

