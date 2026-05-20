import { ArrowRight } from 'lucide-react';

const CategoryCard = ({ image, title, onClick }) => {
  return (
    <div
      className="group cursor-pointer relative rounded-xl overflow-hidden border transition-all duration-300 hover:-translate-y-1"
      style={{ backgroundColor: 'white', borderColor: 'rgba(168,213,213,0.35)', boxShadow: '0 2px 10px rgba(26,43,53,0.06)' }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 12px 32px rgba(61,138,138,0.15)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 10px rgba(26,43,53,0.06)'}
      onClick={onClick}
    >
      <div className="aspect-square overflow-hidden relative" style={{ backgroundColor: 'var(--color-teal-50)' }}>
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
          style={{ '--tw-scale-x': '1.08', '--tw-scale-y': '1.08' }}
        />
        {/* Teal overlay on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4"
          style={{ background: 'linear-gradient(to top, rgba(18,42,60,0.55), transparent)' }}>
          <div className="flex items-center gap-1 text-white font-body font-semibold text-xs tracking-widest uppercase">
            <span>Shop Now</span>
            <ArrowRight className="w-3 h-3 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>
      <div className="p-3 text-center">
        <h3 className="font-body text-xs md:text-sm font-semibold tracking-wide transition-colors group-hover:opacity-70"
          style={{ color: 'var(--color-text-dark)' }}>
          {title}
        </h3>
      </div>
    </div>
  );
};

export default CategoryCard;
