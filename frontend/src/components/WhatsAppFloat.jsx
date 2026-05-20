import { FaWhatsapp } from 'react-icons/fa';
import { useLocation } from 'react-router-dom';

const WhatsAppFloat = () => {
  const location = useLocation();
  const phoneNumber = '919492686421'; // WhatsApp Business Number
  const message = 'Hi! I want to book a photoshoot or order customized products.';

  // Don't render on admin pages
  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 bg-green-500 text-white p-3.5 rounded-full shadow-xl hover:bg-green-600 transition-all duration-300 hover:scale-110 z-50 group animate-pulse-soft"
      aria-label="Chat on WhatsApp"
      style={{ boxShadow: '0 2px 10px rgba(34, 197, 94, 0.2)' }}
    >
      <FaWhatsapp className="w-6 h-6" />
      <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg">
        Chat with us!
      </span>
    </button>
  );
};

export default WhatsAppFloat;
