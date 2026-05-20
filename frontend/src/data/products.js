export const products = [
  // Couple Gifts
  {
    id: 1,
    name: 'Personalized Couple Photo Frame',
    category: 'couple-gifts',
    price: 599,
    image: '/images/image.png',
    description: 'Beautiful wooden frame with custom photo and names',
    customizable: true,
    customizationOptions: {
      imageUpload: true,
      textInput: ['Name 1', 'Name 2', 'Date'],
      sizes: [
        { name: 'Small (6x8)', price: 599 },
        { name: 'Medium (8x10)', price: 799 },
        { name: 'Large (10x12)', price: 999 }
      ]
    },
    valentineSpecial: true,
    discount: 20
  },
  {
    id: 2,
    name: 'Couple Mug Set',
    category: 'couple-gifts',
    price: 449,
    image: '/images/image%20copy.png',
    description: 'Set of 2 mugs with custom photo and message',
    customizable: true,
    customizationOptions: {
      imageUpload: true,
      textInput: ['Message'],
    },
    valentineSpecial: true,
    discount: 20
  },
  {
    id: 3,
    name: 'Love Story Canvas',
    category: 'couple-gifts',
    price: 1299,
    image: '/images/image%20copy%202.png',
    description: 'Custom canvas print with your love story timeline',
    customizable: true,
    customizationOptions: {
      imageUpload: true,
      textInput: ['Timeline Text'],
      sizes: [
        { name: '12x16 inches', price: 1299 },
        { name: '16x20 inches', price: 1799 },
        { name: '20x24 inches', price: 2299 }
      ]
    },
    valentineSpecial: true,
    discount: 20
  },

  // Personalised Gifts
  {
    id: 4,
    name: 'Custom Name Keychain',
    category: 'personalised-gifts',
    price: 199,
    image: '/images/image%20copy%203.png',
    description: 'Wooden keychain with engraved name',
    customizable: true,
    customizationOptions: {
      textInput: ['Name'],
    },
    valentineSpecial: false
  },
  {
    id: 5,
    name: 'Photo Cushion',
    category: 'personalised-gifts',
    price: 499,
    image: '/images/image%20copy%204.png',
    description: 'Soft cushion with your favorite photo',
    customizable: true,
    customizationOptions: {
      imageUpload: true,
      sizes: [
        { name: '12x12 inches', price: 499 },
        { name: '16x16 inches', price: 699 }
      ]
    },
    valentineSpecial: true,
    discount: 15
  },

  // T-Shirts
  {
    id: 6,
    name: 'Custom Photo T-Shirt',
    category: 't-shirts',
    price: 399,
    image: '/images/image%20copy%205.png',
    description: 'Premium quality t-shirt with your photo',
    customizable: true,
    customizationOptions: {
      imageUpload: true,
      textInput: ['Text (optional)'],
      sizes: [
        { name: 'S', price: 399 },
        { name: 'M', price: 399 },
        { name: 'L', price: 399 },
        { name: 'XL', price: 449 },
        { name: 'XXL', price: 499 }
      ]
    },
    valentineSpecial: true,
    discount: 20
  },
  {
    id: 7,
    name: 'Couple T-Shirt Set',
    category: 't-shirts',
    price: 799,
    image: '/images/image%20copy%206.png',
    description: 'Matching t-shirts for couples',
    customizable: true,
    customizationOptions: {
      imageUpload: true,
      textInput: ['Text for Shirt 1', 'Text for Shirt 2'],
      sizes: [
        { name: 'S-S', price: 799 },
        { name: 'M-M', price: 799 },
        { name: 'L-L', price: 799 },
        { name: 'XL-XL', price: 899 }
      ]
    },
    valentineSpecial: true,
    discount: 20
  },

  // Flower Bouquets
  {
    id: 8,
    name: 'Red Roses Bouquet',
    category: 'flower-bouquets',
    price: 899,
    image: '/images/image%20copy%207.png',
    description: 'Fresh red roses - symbol of love',
    customizable: false,
    valentineSpecial: true,
    discount: 10
  },
  {
    id: 9,
    name: 'Mixed Flowers Bouquet',
    category: 'flower-bouquets',
    price: 799,
    image: '/images/image%20copy%208.png',
    description: 'Beautiful mix of seasonal flowers',
    customizable: false,
    valentineSpecial: true,
    discount: 10
  },

  // Chocolate Bouquets
  {
    id: 10,
    name: 'Ferrero Rocher Bouquet',
    category: 'chocolate-bouquets',
    price: 1299,
    image: '/images/image%20copy%209.png',
    description: '16 pieces Ferrero Rocher arranged beautifully',
    customizable: false,
    valentineSpecial: true,
    discount: 15
  },
  {
    id: 11,
    name: 'Mixed Chocolate Bouquet',
    category: 'chocolate-bouquets',
    price: 999,
    image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=500',
    description: 'Assorted premium chocolates bouquet',
    customizable: false,
    valentineSpecial: true,
    discount: 15
  },

  // Photo Frames
  {
    id: 12,
    name: 'LED Photo Frame',
    category: 'photo-frames',
    price: 899,
    image: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=500',
    description: 'Illuminated frame with custom photo',
    customizable: true,
    customizationOptions: {
      imageUpload: true,
      textInput: ['Engraved Text'],
    },
    valentineSpecial: true,
    discount: 20
  },

  // Cakes
  {
    id: 13,
    name: 'Heart Shape Red Velvet Cake',
    category: 'cakes',
    price: 799,
    image: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500',
    description: 'Delicious red velvet cake in heart shape',
    customizable: true,
    customizationOptions: {
      textInput: ['Message on Cake'],
      sizes: [
        { name: '500g', price: 799 },
        { name: '1kg', price: 1299 },
        { name: '2kg', price: 2299 }
      ]
    },
    valentineSpecial: true,
    discount: 10
  },
  {
    id: 14,
    name: 'Photo Cake',
    category: 'cakes',
    price: 899,
    image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=500',
    description: 'Cake with edible photo print',
    customizable: true,
    customizationOptions: {
      imageUpload: true,
      textInput: ['Message'],
      sizes: [
        { name: '500g', price: 899 },
        { name: '1kg', price: 1399 },
        { name: '2kg', price: 2499 }
      ]
    },
    valentineSpecial: true,
    discount: 10
  },

  // Plants
  {
    id: 15,
    name: 'Lucky Bamboo Plant',
    category: 'plants',
    price: 299,
    image: 'https://images.unsplash.com/photo-1509937528035-ad76254b0356?w=500',
    description: 'Bring good luck with bamboo plant',
    customizable: false,
    valentineSpecial: false
  },

  // Interior Gifts
  {
    id: 16,
    name: 'Wall Clock with Photo',
    category: 'interior-gifts',
    price: 699,
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=500',
    description: 'Functional wall clock with custom photo',
    customizable: true,
    customizationOptions: {
      imageUpload: true,
    },
    valentineSpecial: false
  },

  // Return Gifts
  {
    id: 17,
    name: 'Customized Return Gift Hamper',
    category: 'return-gifts',
    price: 199,
    image: 'https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=500',
    description: 'Perfect return gifts for your events',
    customizable: true,
    customizationOptions: {
      textInput: ['Name/Message'],
    },
    valentineSpecial: false
  },

  // Event Needs
  {
    id: 18,
    name: 'Birthday Decoration Kit',
    category: 'event-needs',
    price: 1499,
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=500',
    description: 'Complete decoration kit for birthdays',
    customizable: false,
    valentineSpecial: false
  },
];

export const getProductsByCategory = (categoryId) => {
  if (!categoryId) return products;
  return products.filter(p => p.category === categoryId);
};

export const getValentineProducts = () => {
  return products.filter(p => p.valentineSpecial);
};

export const getProductById = (id) => {
  return products.find(p => p.id === parseInt(id));
};
