export const services = [
  {
    id: 1,
    name: 'Photography',
    icon: '📸',
    description: 'Professional photography services for all occasions',
    image: '/services/photography.jpg',
    packages: [
      {
        name: 'Couple Photoshoot',
        price: 5999,
        duration: '2 hours',
        deliverables: '50 edited photos',
        features: ['Professional photographer', 'Location of choice', 'Digital copies']
      },
      {
        name: 'Wedding Photography',
        price: 25000,
        duration: 'Full day',
        deliverables: '500+ edited photos',
        features: ['2 photographers', 'Drone shots', 'Album included', 'Digital copies']
      },
      {
        name: 'Pre-Wedding Shoot',
        price: 15000,
        duration: '4 hours',
        deliverables: '100 edited photos',
        features: ['Professional photographer', 'Multiple locations', 'Costume changes', 'Digital copies']
      }
    ]
  },
  {
    id: 2,
    name: 'Videography',
    icon: '🎥',
    description: 'Cinematic videography to capture your special moments',
    image: '/services/videography.jpg',
    packages: [
      {
        name: 'Wedding Videography',
        price: 30000,
        duration: 'Full day',
        deliverables: '15-20 min highlight video',
        features: ['Cinematic editing', 'Drone footage', 'Same day edit', 'Digital copy']
      },
      {
        name: 'Event Coverage',
        price: 10000,
        duration: '4 hours',
        deliverables: '10 min highlight video',
        features: ['Professional videographer', 'Edited video', 'Digital copy']
      }
    ]
  },
  {
    id: 3,
    name: 'Event Decor',
    icon: '🎉',
    description: 'Beautiful decoration for all your events',
    image: '/services/event-decor.png',
    packages: [
      {
        name: 'Birthday Decoration',
        price: 5000,
        duration: 'Setup included',
        deliverables: 'Complete decoration',
        features: ['Balloon arrangements', 'Backdrop', 'Table decoration', 'Lighting']
      },
      {
        name: 'Wedding Decoration',
        price: 50000,
        duration: 'Full setup',
        deliverables: 'Complete venue decoration',
        features: ['Stage decoration', 'Entrance arch', 'Table settings', 'Lighting', 'Floral arrangements']
      },
      {
        name: 'Anniversary Decoration',
        price: 8000,
        duration: 'Setup included',
        deliverables: 'Romantic decoration',
        features: ['Balloon arrangements', 'Candles', 'Flowers', 'Backdrop']
      }
    ]
  },
  {
    id: 4,
    name: 'Home Redecor',
    icon: '🏠',
    description: 'Transform your home with our interior design services',
    image: '/services/home-redecor.jpg',
    packages: [
      {
        name: 'Single Room Makeover',
        price: 15000,
        duration: '3-5 days',
        deliverables: 'Complete room transformation',
        features: ['Design consultation', 'Color scheme', 'Furniture arrangement', 'Decor items']
      },
      {
        name: 'Full Home Redecor',
        price: 75000,
        duration: '2-3 weeks',
        deliverables: 'Complete home transformation',
        features: ['Full design plan', 'All rooms', 'Furniture selection', 'Decor items', 'Lighting']
      }
    ]
  },
  {
    id: 5,
    name: 'Shop Redecor',
    icon: '🏪',
    description: 'Professional shop interior design to attract customers',
    image: '/services/shop-redecor.jpg',
    packages: [
      {
        name: 'Small Shop Design',
        price: 25000,
        duration: '1 week',
        deliverables: 'Complete shop interior',
        features: ['Layout design', 'Display units', 'Lighting', 'Signage']
      },
      {
        name: 'Large Store Design',
        price: 100000,
        duration: '3-4 weeks',
        deliverables: 'Complete store transformation',
        features: ['Full design plan', 'Custom fixtures', 'Lighting design', 'Branding elements']
      }
    ]
  }
];

export const getServiceById = (id) => {
  return services.find(s => s.id === parseInt(id));
};
