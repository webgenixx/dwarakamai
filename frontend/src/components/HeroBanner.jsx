import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const CAROUSEL_IMAGES = [
  '/assets/wedding-1.png',
  '/assets/wedding-2.png',
  '/assets/wedding-3.png',
];

const HeroBanner = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  const goTo = useCallback((index) => {
    setCurrent(index);
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % CAROUSEL_IMAGES.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className="relative w-full h-[85vh] min-h-[500px] overflow-hidden">

      {/* Full-width background image */}
      {CAROUSEL_IMAGES.map((img, i) => (
        <div
          key={img}
          className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={img}
            alt={`Hero slide ${i + 1}`}
            className="w-full h-full object-cover object-center"
          />
        </div>
      ))}

      {/* White fade overlay — bottom fade like the screenshot */}
      <div className="absolute inset-0 bg-white/40" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />

      {/* Centered text content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4">

        {/* Badge */}
        <span className="text-[var(--color-primary)] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-m sm:text-sm md:text-base font-semibold mb-4 block">
          Premium Digital Studio
        </span>

        {/* Headline */}
        <h1 className="font-display text-3x1 sm:text-6xl md:text-6xl lg:text-7xl font-bold text-black max-w-5xl leading-tight mb-8">
          Capture Memories.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFEDD5] via-[#EA580C] to-[#C2410C]">
            Create Emotions.
          </span>{' '}<br />
          Celebrate Every Moment.
        </h1>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <button
            onClick={() => navigate('/shop')}
            className="btn-primary group"
          >
            Shop Now
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <button
            onClick={() => navigate('/services')}
            className="flex items-center gap-2 px-8 py-3 rounded-xl font-body font-bold text-sm border border-gray-300 bg-white/70 text-gray-800 hover:bg-white transition-all backdrop-blur-sm"
          >
            <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            Explore Services
          </button>
        </div>
      </div>

      {/* Carousel dots only */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {CAROUSEL_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Go to slide ${i + 1}`}
            className="rounded-full transition-all duration-500"
            style={{
              width: i === current ? '24px' : '8px',
              height: '8px',
              background: i === current ? '#EA580C' : '#D1D5DB',
            }}
          />
        ))}
      </div>

    </section>
  );
};

export default HeroBanner;
