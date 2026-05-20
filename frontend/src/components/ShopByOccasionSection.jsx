import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ShopByOccasionSection = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackCategories = [
    { id: 1, name: 'Birthday', slug: 'birthday', image: 'https://images.unsplash.com/photo-1530103862676-fa390d4073b0?w=200&h=200&fit=crop' },
    { id: 2, name: 'Anniversary', slug: 'anniversary', image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=200&h=200&fit=crop' },
    { id: 3, name: 'Friendship', slug: 'friendship', image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop' },
    { id: 4, name: 'Family', slug: 'family', image: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=200&h=200&fit=crop' },
    { id: 5, name: 'Special Day', slug: 'special-day', image: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=200&h=200&fit=crop' },
  ];

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`);
      if (response.ok) {
        const data = await response.json();
        const allCats = data.categories || [];
        
        // Filter occasions and sort by order
        let occasions = allCats
          .filter(c => c.is_occasion)
          .sort((a, b) => (a.occasion_order || 0) - (b.occasion_order || 0));
        
        // If no occasions marked, fallback to first 5 categories or fallback list
        if (occasions.length === 0) {
          occasions = allCats.length > 0 ? allCats.slice(0, 5) : fallbackCategories;
        }
        
        setCategories(occasions);
      } else {
        setCategories(fallbackCategories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories(fallbackCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categorySlug) => {
    navigate(`/shop/${categorySlug}`);
  };

  return (
    <section className="py-4 bg-white">
      <div className="container-custom">
        {/* Section Title */}
        <div className="text-center mb-16">
          <p className="text-xs tracking-[0.3em] text-gray-400 font-bold mb-4">Find the perfect gift</p>
          <h2 className="section-title">Shop by Occasion</h2>
        </div>

        {/* Circular Category Cards */}
        <div className="flex flex-wrap justify-center gap-8 md:gap-16">
          {categories.map((category, index) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.slug || category.id)}
              className="group flex flex-col items-center gap-4 transition-all duration-500 hover:-translate-y-2 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Circular Image Container */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg shadow-gray-200 transition-all duration-500 group-hover:shadow-[var(--color-primary-light)] group-hover:border-[var(--color-primary-light)]">
                <img
                  src={
                    category.image_url
                      ? (category.image_url.startsWith('http') ? category.image_url : `${import.meta.env.VITE_API_URL}${category.image_url}`)
                      : (category.image || `https://via.placeholder.com/200`)
                  }
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
                />
              </div>
              {/* Category Name */}
              <p className="font-body text-sm font-semibold text-gray-700 transition-colors group-hover:text-[var(--color-primary)]">
                {category.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ShopByOccasionSection;
