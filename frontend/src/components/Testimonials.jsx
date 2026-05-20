import { useState, useEffect } from 'react';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';

const Testimonials = () => {
  const testimonials = [
    {
      name: 'Anita Sharma',
      location: 'BHIMAVARAM',
      rating: 5,
      text: "The customized photo frame I ordered for my parents' 25th anniversary was stunning. They were so happy to have the party in a big frame."
    },
    {
      name: 'Rahul Verma',
      location: 'VIJAYAWADA',
      rating: 5,
      text: "I needed high-quality prints and a customized t-shirt fast. Dwarakamai digital photo studio provided them with perfect quality and on time!"
    },
    {
      name: 'Priya Das',
      location: 'ELURU',
      rating: 5,
      text: "Their studio services are top-notch. The photo album they designed for our baby's first birthday is a treasure we'll keep forever."
    },
    {
      name: 'Kiran Kumar',
      location: 'HYDERABAD',
      rating: 5,
      text: "Absolutely loved the personalized mugs! The print quality is fantastic and it made for the perfect corporate gift."
    },
    {
      name: 'Sneha Reddy',
      location: 'RAJAHMUNDRY',
      rating: 5,
      text: "The team is very professional. They covered our wedding beautifully and delivered the album ahead of schedule."
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCardsToShow(1);
      } else if (window.innerWidth < 1024) {
        setCardsToShow(2);
      } else {
        setCardsToShow(3);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = testimonials.length - cardsToShow;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === maxIndex ? 0 : prev + 1));
  };

  // Auto play
  useEffect(() => {
    const timer = setInterval(() => {
      handleNext();
    }, 4000); // Change slide every 4 seconds
    return () => clearInterval(timer);
  }, [currentIndex, maxIndex]); // Reset timer when manually changed

  return (
    <section className="py-4 bg-[#F9FAFB]">
      <div className="container-custom overflow-hidden">
        {/* Section Header */}
        <div className="flex justify-between items-end mb-16">
          <div className="text-left">
            <h2 className="section-title !text-left mb-2">Voices of Joy</h2>
            <p className="section-subtitle !text-left !ml-0 uppercase tracking-widest text-xs font-bold text-gray-400">WHAT OUR WONDERFUL CUSTOMERS HAVE TO SAY.</p>
          </div>
          
          <div className="flex gap-2">
            <button 
              onClick={handlePrev}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all bg-white shadow-sm"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button 
              onClick={handleNext}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all bg-white shadow-sm"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="relative -mx-4">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)` }}
          >
            {testimonials.map((t, idx) => (
              <div 
                key={idx}
                className="w-full md:w-1/2 lg:w-1/3 flex-shrink-0 px-4"
              >
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative group transition-all duration-300 hover:shadow-xl h-full flex flex-col">
                  <div className="flex gap-1 mb-6">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#F7D060] text-[#F7D060]" />
                    ))}
                  </div>

                  <p className="text-gray-600 font-body mb-8 italic leading-relaxed text-sm flex-grow">
                    "{t.text}"
                  </p>

                  <div className="flex items-center gap-4 mt-auto">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-[var(--color-primary)] font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-display font-bold text-gray-900">{t.name}</h4>
                      <p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase">{t.location}</p>
                    </div>
                    <Quote className="ml-auto w-8 h-8 text-gray-50 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
