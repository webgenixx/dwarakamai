import { useNavigate } from 'react-router-dom';

const SimpleProductCard = ({ product, onClick }) => {
  const navigate = useNavigate();

  const imageUrl = product.image_url?.startsWith('http')
    ? product.image_url
    : `${import.meta.env.VITE_API_URL}${product.image_url}`;

  return (
    <div 
      className="card-premium trending-product-card group cursor-pointer h-full flex flex-col"
      onClick={onClick}
    >
      {/* Image Container */}
      <div className="aspect-square overflow-hidden relative bg-gray-50">
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&h=400&fit=crop'}
          alt={product.name || "Gift product"}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        
        {/* Badge (Optional) */}
        <div className="absolute top-2 left-2">
          <span className="bg-[var(--color-primary)] text-white text-[8px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-tighter">New</span>
        </div>
      </div>
 
      {/* Content */}
      <div className="p-2 flex flex-col flex-grow">
        <h3 className="font-display font-bold text-sm text-gray-900 mb-1 group-hover:text-[var(--color-primary)] transition-colors line-clamp-1">
          {product.name || "Custom Gift Item"}
        </h3>
        <p className="text-gray-500 font-body text-[10px] line-clamp-1 mb-2 leading-tight">
          {product.short_description || "Personalized gifts crafted with love."}
        </p>
        
        <div className="mt-auto flex items-center justify-between gap-1">
          <p className="font-display font-bold text-sm text-[var(--color-primary)]">
            ₹{Math.round(product.price)}
          </p>
          <button
            className="bg-[var(--color-primary)] text-white px-2 py-1 text-[9px] rounded-sm whitespace-nowrap hover:bg-[var(--color-primary-dark)] transition-colors"
            onClick={(e) => { e.stopPropagation(); onClick && onClick(); }}
          >
            Customize
          </button>
        </div>
      </div>
    </div>
  );
};
 
export default SimpleProductCard;
