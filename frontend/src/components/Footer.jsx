import { Link, useLocation } from 'react-router-dom';
import { ArrowRight, Share2, Globe } from 'lucide-react';

const Footer = () => {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-white pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-16 mb-12">
          
          {/* Brand */}
          <div className="space-y-3">
            <Link to="/" className="flex flex-col gap-2 group">
              <span className="text-[28px] font-display font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">
                Dwarakamai digital photo studio
              </span>
              <p className="text-[10px] font-body font-bold text-gray-300 uppercase tracking-[0.3em]">
                PRESERVING YOUR MOMENTS
              </p>
            </Link>
            <p className="font-body text-gray-400 text-sm leading-relaxed max-w-xs italic">
              Preserving your most cherished moments through digital artistry and premium craftsmanship.
            </p>
          </div>

          {/* Curated Studio */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-body font-bold text-gray-900 uppercase tracking-[0.3em]">
              CURATED STUDIO
            </h4>
            <ul className="space-y-2">
              <li><Link to="/services" className="text-xs font-body font-bold text-gray-400 uppercase tracking-widest hover:text-[var(--color-primary)] transition-colors">Services</Link></li>
              <li><Link to="/gallery" className="text-xs font-body font-bold text-gray-400 uppercase tracking-widest hover:text-[var(--color-primary)] transition-colors">Gallery</Link></li>
              <li><Link to="/shop" className="text-xs font-body font-bold text-gray-400 uppercase tracking-widest hover:text-[var(--color-primary)] transition-colors">Shop</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-body font-bold text-gray-900 uppercase tracking-[0.3em]">
              SUPPORT
            </h4>
            <ul className="space-y-2">
              <li><Link to="/shipping-info" className="text-xs font-body font-bold text-gray-400 uppercase tracking-widest hover:text-[var(--color-primary)] transition-colors">Shipping Info</Link></li>
              <li><Link to="/contact" className="text-xs font-body font-bold text-gray-400 uppercase tracking-widest hover:text-[var(--color-primary)] transition-colors">Contact Us</Link></li>
              <li><Link to="/privacy-policy" className="text-xs font-body font-bold text-gray-400 uppercase tracking-widest hover:text-[var(--color-primary)] transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-body font-bold text-gray-900 uppercase tracking-[0.3em]">
            </h4>
            <div className="relative group max-w-xs">
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] text-gray-400 font-body font-bold tracking-[0.2em] uppercase">
            © {new Date().getFullYear()} Dwarakamai digital photo studio. Crafted with sentiment.
          </p>
          
          <div className="flex items-center gap-8">
            <a href="#" className="text-gray-300 hover:text-gray-900 transition-colors">
              <Share2 className="w-4 h-4" />
            </a>
            <a href="#" className="text-gray-300 hover:text-gray-900 transition-colors">
              <Globe className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;


