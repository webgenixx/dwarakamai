import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import CategoryCard from './CategoryCard';

const CategoriesSection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categorySlug) => {
    navigate(`/shop/${categorySlug}`);
  };

  const displayCategories = categories.slice(0, 6);

  return (
    <section className="py-4 relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-hero)' }}>
      {/* Subtle orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(91,163,163,0.12)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(61,138,138,0.10)' }} />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Title */}
        <div className="text-center mb-10 md:mb-14 animate-slide-up">
          <p className="font-body text-xs uppercase tracking-[0.25em] font-semibold mb-3" style={{ color: 'var(--color-navy-800)' }}>
            Browse & Discover
          </p>
          <h2 className="section-title text-2xl xs:text-3xl sm:text-4xl md:text-5xl">
            Shop by Categories
          </h2>
          <div className="mt-4 flex justify-center">
            <div className="h-0.5 w-14 rounded" style={{ backgroundColor: 'var(--color-teal-400)' }}></div>
          </div>
          <p className="font-body mt-5 text-xs xs:text-sm sm:text-base md:text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-mid)' }}>
            Find the perfect gift for your loved one from our curated collection
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
          {loading ? (
            [...Array(6)].map((_, index) => (
              <div key={index} className="animate-pulse rounded-xl h-48"
                style={{ backgroundColor: 'rgba(168,213,213,0.3)' }}></div>
            ))
          ) : (
            displayCategories.map((category, index) => (
              <div
                key={category.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CategoryCard
                  image={
                    category.image_url
                      ? (category.image_url.startsWith('http') ? category.image_url : `${import.meta.env.VITE_API_URL}${category.image_url}`)
                      : (category.image || `/images/image.png`)
                  }
                  title={category.name}
                  onClick={() => handleCategoryClick(category.slug || category.id)}
                />
              </div>
            ))
          )}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/shop')}
            className="btn-primary inline-flex items-center gap-2"
          >
            View All Categories
            <span>→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
