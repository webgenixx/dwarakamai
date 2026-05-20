import { Pencil, Lightbulb, Truck } from 'lucide-react';

const FeaturesSection = () => {
  const features = [
    {
      icon: Pencil,
      title: 'Personalized Designs',
      description: 'Expert designers helping you create something truly unique and personal.',
      color: '#9D4E8D'
    },
    {
      icon: Lightbulb,
      title: 'High Quality Materials',
      description: 'We use premium canvases, fabrics, and inks for products that last a lifetime.',
      color: '#F7D060'
    },
    {
      icon: Truck,
      title: 'Fast Delivery',
      description: 'Swift production and reliable shipping, so your gift is ready for your special day.',
      color: '#10B981'
    }
  ];

  return (
    <section className="py-4 bg-white border-b border-gray-50">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 mb-6 transition-all duration-300 group-hover:bg-[var(--color-primary-light)] group-hover:scale-110">
                  <Icon className="w-8 h-8 text-gray-700 group-hover:text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-500 font-body max-w-xs mx-auto text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
