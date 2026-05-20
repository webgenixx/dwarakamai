import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Load wishlist from localStorage when user changes
  useEffect(() => {
    if (isAuthenticated() && user) {
      const userWishlistKey = `wishlist_${user.id || user.email}`;
      const savedWishlist = localStorage.getItem(userWishlistKey);
      setWishlist(savedWishlist ? JSON.parse(savedWishlist) : []);
    } else {
      // Clear wishlist if not authenticated
      setWishlist([]);
    }
  }, [user, isAuthenticated]);

  // Save wishlist to localStorage whenever it changes
  useEffect(() => {
    if (isAuthenticated() && user) {
      const userWishlistKey = `wishlist_${user.id || user.email}`;
      localStorage.setItem(userWishlistKey, JSON.stringify(wishlist));
    }
  }, [wishlist, user, isAuthenticated]);

  const addToWishlist = (product) => {
    if (!isAuthenticated()) {
      return false; // Return false if not authenticated
    }

    setWishlist(prevWishlist => {
      const existingItem = prevWishlist.find(item => item.id === product.id);
      
      if (existingItem) {
        // Already in wishlist, don't add again
        return prevWishlist;
      }

      return [...prevWishlist, product];
    });
    return true; // Return true if successfully added
  };

  const removeFromWishlist = (productId) => {
    setWishlist(prevWishlist => 
      prevWishlist.filter(item => item.id !== productId)
    );
  };

  const toggleWishlist = (product) => {
    if (!isAuthenticated()) {
      return false;
    }

    const isInWishlist = wishlist.some(item => item.id === product.id);
    
    if (isInWishlist) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
    
    return true;
  };

  const isInWishlist = (productId) => {
    return wishlist.some(item => item.id === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
    if (isAuthenticated() && user) {
      const userWishlistKey = `wishlist_${user.id || user.email}`;
      localStorage.removeItem(userWishlistKey);
    }
  };

  const getWishlistCount = () => {
    return wishlist.length;
  };

  return (
    <WishlistContext.Provider value={{
      wishlist,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
      getWishlistCount
    }}>
      {children}
    </WishlistContext.Provider>
  );
};
