import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext();

// Service charge constant
export const SERVICE_CHARGE = 2;

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [cart, setCart] = useState([]);

  // Load cart from localStorage when user changes
  useEffect(() => {
    if (isAuthenticated() && user) {
      const userCartKey = `cart_${user.id || user.email}`;
      const savedCart = localStorage.getItem(userCartKey);
      setCart(savedCart ? JSON.parse(savedCart) : []);
    } else {
      // Clear cart if not authenticated
      setCart([]);
    }
  }, [user, isAuthenticated]);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isAuthenticated() && user) {
      const userCartKey = `cart_${user.id || user.email}`;
      localStorage.setItem(userCartKey, JSON.stringify(cart));
    }
  }, [cart, user, isAuthenticated]);

  const addToCart = (product) => {
    if (!isAuthenticated()) {
      return false; // Return false if not authenticated
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(item => 
        item.id === product.id && 
        JSON.stringify(item.customization) === JSON.stringify(product.customization)
      );

      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id && 
          JSON.stringify(item.customization) === JSON.stringify(product.customization)
            ? { ...item, quantity: item.quantity + product.quantity }
            : item
        );
      }

      return [...prevCart, product];
    });
    return true; // Return true if successfully added
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => 
      prevCart.filter(item => item.id !== productId)
    );
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(prevCart =>
      prevCart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    if (isAuthenticated() && user) {
      const userCartKey = `cart_${user.id || user.email}`;
      localStorage.removeItem(userCartKey);
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + ((item.finalPrice || item.price || 0) * item.quantity), 0);
  };

  const getCartSubtotal = () => {
    return cart.reduce((total, item) => total + ((item.finalPrice || item.price || 0) * item.quantity), 0);
  };

  const getServiceCharge = () => {
    return cart.length > 0 ? SERVICE_CHARGE : 0;
  };

  const getFinalTotal = () => {
    return getCartSubtotal() + getServiceCharge();
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartSubtotal,
      getServiceCharge,
      getFinalTotal,
      getCartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
