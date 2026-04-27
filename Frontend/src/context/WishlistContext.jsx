import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('sm_wishlist');
      if (stored) setItems(JSON.parse(stored));
    } catch {
      setItems([]);
    }
  }, []);

  const saveItems = (newItems) => {
    setItems(newItems);
    localStorage.setItem('sm_wishlist', JSON.stringify(newItems));
  };

  const toggleItem = (product) => {
    const existingIdx = items.findIndex(i => i.product_id === product.product_id);
    if (existingIdx !== -1) {
      const newItems = [...items];
      newItems.splice(existingIdx, 1);
      saveItems(newItems);
      toast.success('Removed from wishlist');
    } else {
      saveItems([...items, product]);
      toast.success('Added to wishlist');
    }
  };

  const removeItem = (id) => {
    saveItems(items.filter(i => i.product_id !== id));
    toast.success('Removed from wishlist');
  };

  const isInWishlist = (id) => items.some(i => i.product_id === id);

  return (
    <WishlistContext.Provider value={{ items, itemCount: items.length, toggleItem, removeItem, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export const useWishlist = () => useContext(WishlistContext);
