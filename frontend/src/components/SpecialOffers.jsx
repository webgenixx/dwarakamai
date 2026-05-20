import { Gift, Camera, Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

const SpecialOffers = () => {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const defaultOffers = [
    {
      icon: Heart,
      title: 'Special Offers',
      description: 'Flat 20% OFF on all couple gifts',
      image: '/images/image.png',
      action: () => navigate('/shop/couple-gifts')
    },
    {
      icon: Gift,
      title: 'Personalized Gifts',
      description: 'Free customization on orders above ₹999',
      image: '/images/image%20copy.png',
      action: () => navigate('/shop/personalised-gifts')
    },
    {
      icon: Camera,
      title: 'Photo Sessions',
      description: 'Book now & get 15% OFF on couple shoots',
      image: '/images/image%20copy%202.png',
      action: () => navigate('/services')
    },
    {
      icon: Sparkles,
      title: 'Premium Combos',
      description: 'Save up to 30% on gift combos',
      image: '/images/image%20copy%203.png',
      action: () => navigate('/shop')
    }
  ];

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/homepage/content`);
        const data = await response.json();

        if (data.success && data.content && data.content.offers && data.content.offers.length > 0) {
          const apiOffers = data.content.offers.map((offer, index) => {
            let Icon = Gift;
            if (index === 0) Icon = Heart;
            else if (index === 2) Icon = Camera;
            else if (index === 3) Icon = Sparkles;

            return {
              icon: Icon,
              title: offer.title,
              description: offer.description,
              image: offer.image_url
                ? (offer.image_url.startsWith('http') ? offer.image_url : `${import.meta.env.VITE_API_URL}${offer.image_url}`)
                : defaultOffers[index % 4].image,
              action: () => navigate(offer.link_url || '/shop')
            };
          });
          setOffers(apiOffers);
        } else {
          setOffers(defaultOffers);
        }
      } catch (error) {
        console.error('Error fetching special offers:', error);
        setOffers(defaultOffers);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, []);

  return (
    <section className="py-4 relative overflow-hidden" style={{ backgroundColor: 'var(--color-bg-white)' }}>
      {/* Subtle teal orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-48 h-48 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(168,213,213,0.15)' }} />
        <div className="absolute bottom-0 right-1/4 w-48 h-48 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(91,163,163,0.10)' }} />
      </div>

      <div className="container mx-auto px-3 xs:px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-8 md:mb-14">
          <p className="font-body text-xs uppercase tracking-[0.25em] font-semibold mb-3" style={{ color: 'var(--color-teal-400)' }}>
            Curated For You
          </p>
          <h2 className="section-title text-2xl xs:text-3xl sm:text-4xl md:text-5xl">
            Special Offers
          </h2>
          <div className="mt-4 flex justify-center">
            <div className="h-0.5 w-14 rounded" style={{ backgroundColor: 'var(--color-teal-400)' }}></div>
          </div>
          <p className="font-body mt-5 text-xs xs:text-sm sm:text-base max-w-xl mx-auto" style={{ color: 'var(--color-text-mid)' }}>
            Exclusive deals on our most-loved items
          </p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {loading ? (
            [...Array(4)].map((_, index) => (
              <div key={index} className="animate-pulse rounded-xl h-64 border" style={{ backgroundColor: 'var(--color-teal-50)', borderColor: 'rgba(168,213,213,0.3)' }}></div>
            ))
          ) : (
            offers.map((offer, index) => {
              const Icon = offer.icon;
              return (
                <div
                  key={index}
                  className="group relative overflow-hidden rounded-xl cursor-pointer transition-all duration-300 bg-white border"
                  style={{ borderColor: 'rgba(168,213,213,0.35)', boxShadow: '0 2px 12px rgba(26,43,53,0.05)' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(61,138,138,0.15)'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 2px 12px rgba(26,43,53,0.05)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  onClick={offer.action}
                >
                  {/* Image */}
                  <div className="relative aspect-[16/9] overflow-hidden" style={{ backgroundColor: 'var(--color-teal-50)' }}>
                    <img
                      src={offer.image}
                      alt={offer.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextElementSibling.style.display = 'flex';
                      }}
                    />
                    {/* Fallback */}
                    <div
                      className="absolute inset-0 hidden items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, var(--color-teal-200), var(--color-teal-400))' }}
                    >
                      <Icon className="w-12 h-12 text-white opacity-60" />
                    </div>
                    {/* Teal overlay on hover */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ background: 'linear-gradient(to top, rgba(18,42,60,0.3), transparent)' }} />

                    {/* Icon badge */}
                    <div className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center shadow-lg border"
                      style={{ backgroundColor: 'white', borderColor: 'rgba(168,213,213,0.5)' }}>
                      <Icon className="w-4 h-4" style={{ color: 'var(--color-teal-500)' }} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-display font-semibold text-base sm:text-lg mb-1 line-clamp-1" style={{ color: 'var(--color-text-dark)' }}>
                      {offer.title}
                    </h3>
                    <p className="font-body text-xs sm:text-sm mb-3 line-clamp-2" style={{ color: 'var(--color-text-mid)' }}>
                      {offer.description}
                    </p>
                    <div className="inline-flex items-center gap-1 font-body font-semibold text-xs group-hover:gap-2 transition-all" style={{ color: 'var(--color-teal-500)' }}>
                      <span>Shop Now</span>
                      <span className="group-hover:ml-1 transition-all">→</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
};

export default SpecialOffers;
