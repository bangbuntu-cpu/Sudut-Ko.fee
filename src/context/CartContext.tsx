import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, OrderItem, ADDITIONAL_OPTIONS, AdditionalOption } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
  notes?: string;
  additionals?: string[]; // IDs of selected additionals, e.g. ['addon_espresso', 'addon_seasalt']
}

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number, notes?: string, additionals?: string[]) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleItemAdditional: (productId: string, additionalId: string) => void;
  addStandaloneAdditional: (additional: AdditionalOption) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  getItemUnitPrice: (item: CartItem) => number;
  toOrderItems: () => OrderItem[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'sudutkofee_cart_v1';

export const getItemUnitPrice = (item: CartItem): number => {
  const addTotal = (item.additionals || []).reduce((sum, addId) => {
    const opt = ADDITIONAL_OPTIONS.find((a) => a.id === addId);
    return sum + (opt ? opt.harga : 0);
  }, 0);
  return item.product.harga + addTotal;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Error saving cart to storage:', e);
    }
  }, [items]);

  const addToCart = (product: Product, quantity = 1, notes = '', additionals: string[] = []) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((item) => item.product.id === product.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = Math.min(product.stok, next[existingIndex].quantity + quantity);
        // Merge or replace additionals if provided
        const currentAdditionals = next[existingIndex].additionals || [];
        const mergedAdditionals = Array.from(new Set([...currentAdditionals, ...additionals]));

        next[existingIndex] = {
          ...next[existingIndex],
          quantity: newQty,
          notes: notes ? notes : next[existingIndex].notes,
          additionals: mergedAdditionals
        };
        return next;
      } else {
        return [
          ...prev,
          {
            product,
            quantity: Math.min(product.stok, quantity),
            notes,
            additionals
          }
        ];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const validQty = Math.min(item.product.stok, quantity);
          return { ...item, quantity: validQty };
        }
        return item;
      })
    );
  };

  const toggleItemAdditional = (productId: string, additionalId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const current = item.additionals || [];
          const exists = current.includes(additionalId);
          const next = exists
            ? current.filter((id) => id !== additionalId)
            : [...current, additionalId];
          return { ...item, additionals: next };
        }
        return item;
      })
    );
  };

  const addStandaloneAdditional = (additional: AdditionalOption) => {
    const virtualProduct: Product = {
      id: additional.id,
      nama: `Additional: ${additional.nama}`,
      deskripsi: additional.keterangan,
      harga: additional.harga,
      stok: 999,
      kategori: 'Additional',
      gambar: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?q=80&w=300&auto=format&fit=crop'
    };
    addToCart(virtualProduct, 1);
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + getItemUnitPrice(item) * item.quantity, 0);

  const toOrderItems = (): OrderItem[] => {
    return items.map((item) => {
      const unitPrice = getItemUnitPrice(item);
      const addNames = (item.additionals || [])
        .map((id) => ADDITIONAL_OPTIONS.find((a) => a.id === id)?.nama)
        .filter(Boolean);
      const displayName =
        addNames.length > 0
          ? `${item.product.nama} (+ ${addNames.join(', ')})`
          : item.product.nama;

      return {
        productId: item.product.id,
        nama: displayName,
        harga: unitPrice,
        jumlah: item.quantity,
        subtotal: unitPrice * item.quantity,
        gambar: item.product.gambar
      };
    });
  };

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleItemAdditional,
        addStandaloneAdditional,
        clearCart,
        totalItems,
        totalPrice,
        getItemUnitPrice,
        toOrderItems
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
