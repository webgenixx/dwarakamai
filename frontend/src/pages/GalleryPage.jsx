import { useState, useEffect } from 'react';
import { X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const GalleryPage = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedImage, setSelectedImage] = useState(null);
  const [categories, setCategories] = useState(['All', 'Gifts', 'T-Shirts', 'Frames', 'Studio Work']);

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/gallery`);
      if (response.ok) {
        const data = await response.json();
        if (data.images && data.images.length > 0) {
          setImages(data.images);
          const uniqueCategories = ['All', ...new Set(data.images.map(img => img.category))];
          setCategories(uniqueCategories);
        }
      }
    } catch (error) {
      console.error('Failed to fetch gallery images:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = selectedCategory === 'All'
    ? images
    : images.filter(img => img.category === selectedCategory);

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="py-4">
        <div className="container-custom">
          <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-[0.3em] mb-6">OUR PORTFOLIO</p>
          <h1 className="text-5xl md:text-7xl font-display font-bold text-gray-900 leading-tight tracking-tight max-w-4xl">
            Curating your most <br />
            <span className="italic font-serif font-medium text-[var(--color-primary)]">cherished</span> moments.
          </h1>
        </div>
      </div>

      <div className="container-custom pb-4">
        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-3 mb-16">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-8 py-3 rounded-full font-body font-bold text-[10px] uppercase tracking-widest transition-all ${
                selectedCategory === category
                  ? 'bg-[var(--color-primary)] text-white shadow-lg shadow-purple-100'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Infinite Sliding Gallery */}
        <div className="w-full bg-black relative overflow-hidden flex items-center justify-center rounded-[40px] my-12">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-black via-black/90 to-black z-0" />
          
          {/* Scrolling images container */}
          <div className="relative z-10 w-full flex items-center justify-center py-16">
            <div className="scroll-container w-full">
              <div className="infinite-scroll flex gap-6 w-max">
                {loading ? (
                  <div className="flex justify-center w-full py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                  </div>
                ) : [...filteredImages, ...filteredImages].map((image, index) => (
                  <div
                    key={`${image.id}-${index}`}
                    onClick={() => setSelectedImage(image)}
                    className="image-item flex-shrink-0 w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-xl overflow-hidden shadow-2xl cursor-pointer"
                  >
                    <img
                      src={image.image_url?.startsWith('http') ? image.image_url : `${import.meta.env.VITE_API_URL}${image.image_url}`}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Bottom gradient overlay */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent z-20" />
        </div>

        {/* CTA Section */}
        <div className="mt-32 relative bg-[#FCE4EC] rounded-[40px] overflow-hidden flex flex-col lg:flex-row items-center">
          <div className="flex-1 p-12 lg:p-20 z-10">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-8 leading-tight">
              Ready to create your own masterpiece?
            </h2>
            <p className="text-gray-600 font-body text-lg mb-12 max-w-md">
              Whether it's a personalized gift or a professional studio session, we bring your vision to life with artisanal care.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/services" className="px-10 py-5 bg-[var(--color-primary)] text-white rounded-2xl font-body font-bold text-sm uppercase tracking-widest hover:shadow-xl transition-all active:scale-95">
                Start Your Project
              </Link>
              <Link to="/services" className="px-10 py-5 bg-white/50 backdrop-blur-md text-gray-900 rounded-2xl font-body font-bold text-sm uppercase tracking-widest hover:bg-white transition-all active:scale-95">
                View Pricing
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 h-full min-h-[400px] relative">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop" 
              className="absolute inset-0 w-full h-full object-cover lg:rounded-l-[100px] grayscale hover:grayscale-0 transition-all duration-1000"
              alt="Artisan"
            />
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-white/90 backdrop-blur-xl"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-8 right-8 p-4 bg-gray-100 rounded-full hover:bg-gray-200 transition-all"
          >
            <X className="w-6 h-6 text-gray-900" />
          </button>

          <div className="max-w-6xl w-full flex flex-col md:flex-row gap-12" onClick={(e) => e.stopPropagation()}>
            <img
              src={selectedImage.image_url?.startsWith('http') ? selectedImage.image_url : `${import.meta.env.VITE_API_URL}${selectedImage.image_url}`}
              alt={selectedImage.title}
              className="flex-1 max-h-[80vh] object-contain rounded-[40px] shadow-2xl"
            />
            <div className="md:w-80 flex flex-col justify-center">
              <p className="text-[10px] font-body font-bold text-gray-400 uppercase tracking-[0.3em] mb-4">
                {selectedImage.category}
              </p>
              <h3 className="text-4xl font-display font-bold text-gray-900 mb-6">
                {selectedImage.title}
              </h3>
              <p className="text-gray-500 font-body leading-relaxed mb-8">
                {selectedImage.description || "A meticulously curated moment preserved through our studio's artistic lens."}
              </p>
              <Link to="/shop" className="group flex items-center gap-3 text-sm font-body font-bold text-[var(--color-primary)] uppercase tracking-widest">
                <span>Inquire About Similar Work</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-2" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryPage;

