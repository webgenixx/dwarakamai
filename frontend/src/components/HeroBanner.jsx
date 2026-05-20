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
    <section className="relative w-full overflow-hidden" style={{ height: 'calc(65svh - 64px)', minHeight: '480px', maxHeight: '800px' }}>

      {/* Background images */}
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

      {/* Dark overlay for text contrast */}
      <div className="absolute inset-0 bg-black/45" />

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white to-transparent" />

      {/* Glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-orange-500/20 blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-amber-400/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-40 rounded-full bg-orange-600/20 blur-[80px] pointer-events-none" />

      {/* Centered text content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center text-center px-4 pb-10">

        {/* Badge */}
        <span className="uppercase tracking-[0.2em] text-xs sm:text-sm md:text-base font-extrabold mb-3 sm:mb-5 block text-orange-300 drop-shadow-[0_0_12px_rgba(251,146,60,0.8)]">
          ✦ Premium Digital Studio ✦
        </span>

        {/* Headline */}
        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white max-w-5xl leading-[1.1] mb-2 sm:mb-4 drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)]">
          Capture Memories.
        </h1>
        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black max-w-5xl leading-[1.1] mb-2 sm:mb-4">
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-500 to-red-500"
            style={{ filter: 'drop-shadow(0 0 20px rgba(251,146,60,0.7))' }}
          >
            Create Emotions.
          </span>
        </h1>
        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white max-w-5xl leading-[1.1] mb-6 sm:mb-10 drop-shadow-[0_2px_24px_rgba(0,0,0,0.6)]">
          Celebrate Every Moment.
        </h1>

        {/* Buttons */}
        <div className="flex flex-row gap-3 items-center justify-center flex-wrap">
          <button
            onClick={() => navigate('/shop')}
            className="btn-primary group shadow-[0_0_24px_rgba(234,88,12,0.6)] hover:shadow-[0_0_36px_rgba(234,88,12,0.9)] transition-shadow text-sm px-6 py-2.5 sm:px-8 sm:py-3"
          >
            Shop Now
            <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>

          <button
            onClick={() => navigate('/services')}
            className="flex items-center gap-2 px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl font-body font-bold text-sm border border-white/30 bg-white/10 text-white hover:bg-white/20 transition-all backdrop-blur-sm shadow-[0_0_16px_rgba(255,255,255,0.1)]"
          >
            <span className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(234,88,12,0.8)]">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
            Explore Services
          </button>
        </div>
      </div>

      {/* Carousel dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
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
              boxShadow: i === current ? '0 0 8px rgba(234,88,12,0.8)' : 'none',
            }}
          />
        ))}
      </div>

    </section>
  );
};

export default HeroBanner;
