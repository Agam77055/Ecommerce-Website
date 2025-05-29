'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface CartItem {
    key: string;
    name: string;
    price: number;
    image: string;
    category: string;
    description: string;
    quantity: number;
}

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>, initialQuantity?: number) => void;
    removeItem: (itemKey: string) => void;
    updateQuantity: (itemKey: string, quantity: number) => void;
    clearCart: () => void;
    getItemQuantity: (itemKey: string) => number;
    getTotalItems: () => number;
    getTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.error('Error loading cart from localStorage:', error);
                setItems([]);
            }
        }
        setIsInitialized(true);
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        if (isInitialized) {
            localStorage.setItem('cart', JSON.stringify(items));
        }
    }, [items, isInitialized]);

    const addItem = (item: Omit<CartItem, 'quantity'>, initialQuantity: number = 1) => {
        setItems(prevItems => {
            const existingItem = prevItems.find(i => i.key === item.key);
            
            if (existingItem) {
                // If item exists, increase quantity by initialQuantity
                return prevItems.map(i => 
                    i.key === item.key 
                        ? { ...i, quantity: i.quantity + initialQuantity }
                        : i
                );
            } else {
                // If item doesn't exist, add it with initialQuantity
                return [...prevItems, { ...item, quantity: initialQuantity }];
            }
        });
    };

    const removeItem = (itemKey: string) => {
        setItems(prevItems => prevItems.filter(item => item.key !== itemKey));
    };

    const updateQuantity = (itemKey: string, quantity: number) => {
        if (quantity < 1) return;
        
        setItems(prevItems => 
            prevItems.map(item => 
                item.key === itemKey 
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const getItemQuantity = (itemKey: string) => {
        return items.find(item => item.key === itemKey)?.quantity || 0;
    };

    const getTotalItems = () => {
        return items.reduce((total, item) => total + item.quantity, 0);
    };

    const getTotalPrice = () => {
        return items.reduce((total, item) => total + (item.price * item.quantity), 0);
    };

    const value = {
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getItemQuantity,
        getTotalItems,
        getTotalPrice
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
} 