import React, { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'export_b2b_quote_basket';

export const QuoteBasketContext = createContext(null);

export const QuoteBasketProvider = ({ children }) => {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn('Failed to persist quote basket to localStorage');
    }
  }, [items]);

  const addItem = (product, quantity = 1, unit = 'MT', packing = '') => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.productId === product._id);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [
        ...prev,
        {
          productId: product._id,
          productName: product.name,
          slug: product.slug,
          hsCode: product.hsCode,
          image: product.images?.[0]?.url || '',
          quantity,
          unit,
          packing: packing || product.packing?.[0]?.type || 'Standard Export Packing',
        },
      ];
    });
    setIsDrawerOpen(true);
  };

  const removeItem = (productId) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  };

  const updateItemQuantity = (productId, quantity, unit) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, quantity), ...(unit ? { unit } : {}) }
          : item
      )
    );
  };

  const clearBasket = () => {
    setItems([]);
  };

  const totalItemCount = items.length;

  return (
    <QuoteBasketContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateItemQuantity,
        clearBasket,
        totalItemCount,
        isDrawerOpen,
        setIsDrawerOpen,
      }}
    >
      {children}
    </QuoteBasketContext.Provider>
  );
};

export const useQuoteBasket = () => {
  const context = useContext(QuoteBasketContext);
  if (!context) {
    throw new Error('useQuoteBasket must be used within a QuoteBasketProvider');
  }
  return context;
};

export default QuoteBasketContext;
