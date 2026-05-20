import FlashRibbon from '../components/FlashRibbon';
import HeroBanner from '../components/HeroBanner';
import FeaturesSection from '../components/FeaturesSection';
import TrendingSection from '../components/TrendingSection';
import ShopByOccasionSection from '../components/ShopByOccasionSection';
import ProfessionalServicesSection from '../components/ProfessionalServicesSection';

import Testimonials from '../components/Testimonials';

const HomePage = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg-light)' }}>
      <FlashRibbon />
      <HeroBanner />
      <FeaturesSection />
      <TrendingSection />
      <ShopByOccasionSection />
      <ProfessionalServicesSection />

      <Testimonials />
    </div>
  );
};

export default HomePage;
