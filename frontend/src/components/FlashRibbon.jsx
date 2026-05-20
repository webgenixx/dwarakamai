import React from 'react';

const FlashRibbon = () => {
  const announcements = [
    "✨ Exclusive Wedding Photography Packages Available! Book Now and Save 20% ✨",
    "📸 New Arrival: Premium Photo Frames & Customised Gifts - Order Today! 📸",
    "🎁 Special Offer: Get a Free Photo Mug on Orders Above ₹1999! 🎁",
    "⭐ Celebrating 10+ Years of Capturing Your Beautiful Moments ⭐",
    "🚀 Express Delivery Available for All Customised Products 🚀"
  ];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-r from-[#9D4E8D] via-[#7A3B6D] to-[#9D4E8D] py-2.5 shadow-md z-40">
      {/* Decorative Shine Effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] animate-[pulse_3s_infinite]" />
      
      <div className="flex whitespace-nowrap animate-marquee hover:[animation-play-state:paused]">
        {/* Repeat the content to create a seamless loop */}
        {[...announcements, ...announcements].map((text, index) => (
          <div 
            key={index} 
            className="flex items-center mx-8 text-white font-body font-semibold text-sm tracking-wide"
          >
            <span className="flex items-center gap-2">
              {text}
            </span>
          </div>
        ))}
      </div>

      {/* Subtle border at bottom */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-white/20" />
    </div>
  );
};

export default FlashRibbon;
