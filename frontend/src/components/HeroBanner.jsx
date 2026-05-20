import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HeroBanner = () => {
  const navigate = useNavigate();
  const [bgImage, setBgImage] = useState('/assets/hero-bg.png');

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/homepage/content`);
        const data = await response.json();
        if (data.success && data.content?.hero_banner?.image_url) {
          const imgUrl = data.content.hero_banner.image_url;
          setBgImage(imgUrl.startsWith('http') ? imgUrl : `${import.meta.env.VITE_API_URL}${imgUrl}`);
        }
      } catch (error) {
        console.error('Failed to fetch hero banner:', error);
      }
    };
    fetchBanner();
  }, []);

  return (
    <section className="relative w-full h-[60vh] overflow-hidden">
      {/* === MOBILE / TABLET: image as full centered background === */}
      <div className="absolute inset-0 lg:hidden z-0">
        <img 
          src={bgImage} 
          alt="Hero Background"
          className="w-full h-full object-cover object-[75%_center]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
      </div>

      {/* === DESKTOP: side-by-side layout === */}
      <div className="hidden lg:flex absolute inset-0">
        {/* Left spacer for text (handled by content below) */}
        <div className="w-[50%] bg-white" />
        {/* Right image */}
        <div className="relative w-[50%]">
          <img 
            src={bgImage} 
            alt="Hero Background"
            className="w-full h-full object-cover object-center"
          />
          {/* Soft left-edge blend */}
          <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-white to-transparent" />
        </div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full h-full flex items-end sm:items-center container-custom pb-4 sm:pb-4 sm:pt-4">
        <div className="lg:max-w-xl md:max-w-2xl max-w-full animate-slide-up text-left">
          {/* Badge */}
          <span className="badge-yellow mb-1 inline-block">Suitable for all occasions</span>

          {/* Headline */}
          <h1 className="text-[20px] leading-[1.1] md:text-7xl font-display font-bold mb-0 text-gray-900">
            Turn Your <span className="italic text-[var(--color-primary)]">Memories</span> <br className="hidden sm:block" />
            into <span className="text-gray-900">Beautiful Gifts</span>
          </h1>

          <p className="text-base md:text-xl text-gray-600 mb-0 max-w-lg font-body leading-relaxed">
            Customize T-shirts, Photo Frames, Mugs, and Premium Gifts crafted just for your special moments. Crafted in Eluru, delivered with care.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => navigate('/shop')}
              className="btn-primary flex items-center justify-center group"
            >
              Customize Now
              <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
            <button 
              onClick={() => navigate('/shop/personalised-gifts')}
              className="px-8 py-4 sm:py-3 rounded-md font-medium text-sm border border-gray-400 text-gray-700 hover:bg-gray-50 transition-all shadow-sm text-center"
            >
              Explore Gifts
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
