import { useNavigate } from 'react-router-dom';

const CTASection = () => {
  const navigate = useNavigate();

  return (
    <section className="py-4 bg-white">
      <div className="container-custom">
        <div className="relative overflow-hidden rounded-[2rem] bg-[var(--color-primary)] py-4 px-8 text-center shadow-2xl">
          {/* Decorative Pattern / Texture */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          
          {/* Orbs */}
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />

          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Create Your Personalized Gift Today!
            </h2>
            <p className="text-purple-100 font-body text-lg md:text-xl mb-10 leading-relaxed max-w-2xl mx-auto opacity-90">
              Craft the perfect gift with your own memories and personalized touch with Dwarakamai digital photo studio.
            </p>
            
            <button
              onClick={() => navigate('/shop')}
              className="btn-accent !px-12 !py-4 shadow-xl hover:scale-105 active:scale-95"
            >
              Start Customizing
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
