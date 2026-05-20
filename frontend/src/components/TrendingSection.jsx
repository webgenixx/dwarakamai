import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SimpleProductCard from './SimpleProductCard';

const FADE_MS = 200;

const TrendingSection = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [gridVisible, setGridVisible] = useState(true);
  const hasLoadedOnce = useRef(false);
  const [activeTab, setActiveTab] = useState('All');

  const categories = ['All', 'Mugs', 'T-Shirts', 'Frames', 'Gifts'];

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const run = async () => {
      const isTabChange = hasLoadedOnce.current;

      if (isTabChange) {
        setGridVisible(false);
        await new Promise((r) => setTimeout(r, FADE_MS));
        if (cancelled) return;
      } else {
        setInitialLoading(true);
      }

      try {
        let url = `${import.meta.env.VITE_API_URL}/api/products?limit=8`;
        if (activeTab !== 'All') {
          let categorySlug = activeTab.toLowerCase();
          if (activeTab === 'Frames') categorySlug = 'photo-frames';
          if (activeTab === 'Gifts') categorySlug = 'personalised-gifts';
          url += `&category=${categorySlug}`;
        }

        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();
        if (cancelled) return;
        setProducts(data.products || []);
      } catch (error) {
        if (error.name === 'AbortError') return;
        console.error('Failed to fetch products:', error);
        if (!cancelled) setProducts([]);
      } finally {
        if (cancelled) return;
        setInitialLoading(false);
        hasLoadedOnce.current = true;
        requestAnimationFrame(() => {
          if (!cancelled) setGridVisible(true);
        });
      }
    };

    run();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [activeTab]);

  return (
    <section className="py-4 bg-[#F9F9F9]">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <h2 className="section-title">Curated for Your Special Moments</h2>
          
          {/* Tabs */}
          <div className="flex flex-wrap justify-center gap-3 mt-4 md:mt-6 lg:mt-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveTab(cat)}
                className={`px-6 py-2 rounded-full font-body text-sm font-medium transition-all duration-300 ${
                  activeTab === cat 
                    ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-purple-200' 
                    : 'bg-white text-gray-500 border border-gray-100 hover:border-purple-200 hover:text-[var(--color-primary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="min-h-[280px] md:min-h-[360px] lg:min-h-[420px]">
          {initialLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-[var(--color-primary)] rounded-full animate-spin" />
            </div>
          ) : (
            <div
              className={`transition-all duration-300 ease-out motion-reduce:transition-none ${
                gridVisible
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2 pointer-events-none'
              }`}
            >
              {products.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8 lg:gap-14 px-4 md:px-10 lg:px-20">
                  {products.map((product, index) => (
                    <div
                      key={product.id}
                      className="animate-slide-up motion-reduce:animate-none"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <SimpleProductCard
                        product={product}
                        onClick={() => navigate(`/product/${product.id}`)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-400 font-body">No products found in this category.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* View All */}
        <div className="text-center mt-8 md:mt-12 lg:mt-16">
          <button
            onClick={() => navigate('/shop')}
            className="btn-outline"
          >
            Explore All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
