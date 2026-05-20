import { useNavigate } from 'react-router-dom';
import { Camera, Scissors, CheckCircle2 } from 'lucide-react';

const ProfessionalServicesSection = () => {
  const navigate = useNavigate();

  const services = [
    {
      icon: Camera,
      title: 'Portrait & Event Photography',
      description: 'Professional memory of weddings, birthdays, and individual portraits.'
    },
    {
      icon: Scissors,
      title: 'Expert Photo Editing',
      description: 'Transforming your raw photos into beautiful, high-end digital masterpieces.'
    },
    {
      icon: CheckCircle2,
      title: 'Premium Photo Albums',
      description: 'Custom-designed and high-quality photo albums made with professional perfection.'
    }
  ];

  return (
    <section className="py-4 bg-[#EFEBE9] overflow-hidden">
      <div className="container-custom">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          {/* Left: Text Content */}
          <div className="animate-slide-up">
            <h2 className="text-5xl md:text-6xl font-display font-semibold mb-6 text-gray-900 leading-tight">
              Professional <span className="italic text-[var(--color-primary)]">Studio <br /> Services</span>
            </h2>
            <p className="text-gray-600 font-body mb-10 text-lg leading-relaxed max-w-lg">
              Capture life's most precious moments with our professional photography and post-production studio. We don't just take photos, we preserve feelings.
            </p>

            <ul className="space-y-6 mb-12">
              {services.map((item, idx) => (
                <li key={idx} className="flex items-start group">
                  <div className="mt-1 w-10 h-10 rounded-full bg-white flex items-center justify-center text-[var(--color-primary)] shadow-sm group-hover:bg-[var(--color-primary)] group-hover:text-white transition-all duration-300">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div className="ml-4">
                    <h4 className="font-display font-bold text-lg text-gray-800">{item.title}</h4>
                    <p className="font-body text-sm text-gray-500">{item.description}</p>
                  </div>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => navigate('/services')}
              className="btn-primary"
            >
              Book a Shoot
            </button>
          </div>

          {/* Right: Images Grid */}
          <div className="relative h-[500px] md:h-[600px] animate-fade-in">
            {/* Background pattern or subtle shape */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[80%] bg-[var(--color-primary)]/5 rounded-[30% 70% 70% 30% / 30% 30% 70% 70%] blur-3xl -z-10 animate-float" />
            
            <div className="absolute top-0 right-0 w-[70%] h-[70%] rounded-2xl overflow-hidden shadow-2xl z-20 transition-transform duration-700 hover:scale-105">
              <img 
                src="/assets/service-1.png" 
                alt="Photographer at work" 
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="absolute bottom-0 left-0 w-[65%] h-[65%] rounded-2xl overflow-hidden shadow-2xl z-10 transition-transform duration-700 hover:scale-105">
              <img 
                src="/assets/service-2.png" 
                alt="Photo albums" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ProfessionalServicesSection;
