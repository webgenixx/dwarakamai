import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const GalleryHomeSection = () => {
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fallbackImages = [
    { id: 1, url: 'https://images.unsplash.com/photo-1544144433-d50aff500b91?w=600&h=600&fit=crop' },
    { id: 2, url: 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=600&h=600&fit=crop' },
    { id: 3, url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=600&h=600&fit=crop' },
    { id: 4, url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?w=1000&h=600&fit=crop' },
    { id: 5, url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&h=600&fit=crop' },
  ];

  useEffect(() => {
    fetchGalleryImages();
  }, []);

  const fetchGalleryImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/gallery?limit=5`);
      if (response.ok) {
        const data = await response.json();
        setImages(data.images?.length > 0 ? data.images : fallbackImages);
      } else {
        setImages(fallbackImages);
      }
    } catch (error) {
      console.error('Failed to fetch gallery images:', error);
      setImages(fallbackImages);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-4 bg-white">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="section-title">Gallery of Smiles</h2>
          <p className="section-subtitle">Visual tales of the rich moments we've shared with our clients.</p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top Row */}
          <div className="md:col-span-1 h-[300px] overflow-hidden rounded-lg group">
            <img src={images[0]?.url || images[0]?.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" />
          </div>
          <div className="md:col-span-1 h-[300px] overflow-hidden rounded-lg group">
            <img src={images[1]?.url || images[1]?.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" />
          </div>
          <div className="md:col-span-1 h-[300px] overflow-hidden rounded-lg group">
            <img src={images[2]?.url || images[2]?.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" />
          </div>
          
          {/* Bottom Row */}
          <div className="md:col-span-2 h-[400px] overflow-hidden rounded-lg group">
            <img src={images[3]?.url || images[3]?.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" />
          </div>
          <div className="md:col-span-1 h-[400px] overflow-hidden rounded-lg group">
            <img src={images[4]?.url || images[4]?.image_url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" />
          </div>
        </div>

        {/* View All */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate('/gallery')}
            className="group inline-flex items-center gap-2 font-body font-semibold text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors"
          >
            <span>Explore Full Gallery</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default GalleryHomeSection;
