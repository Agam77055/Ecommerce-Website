'use client';

export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/formatPrice';

const CartPage = () => {
    const { items, updateQuantity, getTotalPrice, clearCart, removeItem } = useCart();
    const router = useRouter();
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const calculateSubtotal = (price: number, quantity: number) => {
        return (price * quantity);
    };

    const handleQuantityUpdate = (itemKey: string, newQuantity: number) => {
        if (newQuantity < 1) {
            removeItem(itemKey);
        } else {
            updateQuantity(itemKey, newQuantity);
        }
    };

    const handleClearCart = () => {
        setShowClearConfirm(true);
    };

    const confirmClearCart = () => {
        clearCart();
        setShowClearConfirm(false);
    };

    return (
        <>
            <Header />
            <main className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-8 pl-4 md:pl-21 transition-all duration-300">
                    {/* Breadcrumb Navigation */}
                    <div className="flex items-center gap-2 text-sm mb-8 transition-all duration-300">
                        <Link href="/" className="text-gray-500 hover:text-[#DB4444]">
                            Home
                        </Link>
                        <span className="text-gray-500">/</span>
                        <span className="text-[#DB4444]">Cart</span>
                    </div>

                    {items.length === 0 ? (
                        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                            <div className="text-center py-6 sm:py-8">
                                <div className="mb-4 sm:mb-6">
                                    <svg 
                                        className="mx-auto h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24 text-gray-400" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={1.5} 
                                            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" 
                                        />
                                    </svg>
                                </div>
                                <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-3 sm:mb-4">Your cart is empty</h2>
                                <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">Looks like you haven't added any items to your cart yet.</p>
                                <button
                                    onClick={() => router.push('/')}
                                    className="bg-[#DB4444] text-white text-sm sm:text-base font-bold cursor-pointer px-6 sm:px-8 py-2.5 sm:py-3 rounded-md hover:bg-[#c13a3a] transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Cart Items - Full Width */}
                            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 sm:mb-8 relative">
                                <div className="flex justify-between items-center mb-6 sm:mb-8">
                                    <h1 className="text-xl sm:text-2xl font-bold text-[#DB4444]">Shopping Cart</h1>
                                    <button
                                        onClick={handleClearCart}
                                        className="text-gray-500 hover:text-[#DB4444] flex items-center gap-1.5 sm:gap-2 transition-colors cursor-pointer text-sm sm:text-base"
                                    >
                                        <svg 
                                            className="w-4 h-4 sm:w-5 sm:h-5" 
                                            fill="none" 
                                            viewBox="0 0 24 24" 
                                            stroke="currentColor"
                                        >
                                            <path 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round" 
                                                strokeWidth={2} 
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" 
                                            />
                                        </svg>
                                        Clear Cart
                                    </button>
                                </div>
                                
                                {/* Confirmation Dialog */}
                                {showClearConfirm && (
                                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                        <div className="bg-white rounded-lg p-4 sm:p-6 max-w-sm w-full mx-4 shadow-lg">
                                            <h3 className="text-base sm:text-lg text-gray-800 font-semibold mb-3 sm:mb-4">Clear Cart</h3>
                                            <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Are you sure you want to remove all items from your cart?</p>
                                            <div className="flex justify-end gap-3 sm:gap-4">
                                                <button
                                                    onClick={() => setShowClearConfirm(false)}
                                                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base text-gray-600 hover:text-gray-800 cursor-pointer"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={confirmClearCart}
                                                    className="px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base bg-[#DB4444] text-white rounded hover:bg-[#B33A3A] cursor-pointer"
                                                >
                                                    Clear Cart
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Cart Grid Header - Hidden on mobile */}
                                <div className="hidden md:grid grid-cols-4 gap-4 py-4 border-b border-gray-300 font-semibold text-gray-500">
                                    <div>Product</div>
                                    <div>Price</div>
                                    <div>Quantity</div>
                                    <div>Subtotal</div>
                                </div>

                                {/* Cart Items */}
                                {items.map((item) => (
                                    <div key={item.key} className="grid grid-cols-1 md:grid-cols-4 gap-4 py-4 sm:py-6 border-b border-gray-300 text-black">
                                        {/* Product Column */}
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                            <img 
                                                src={item.image} 
                                                alt={item.name} 
                                                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-md"
                                            />
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm sm:text-base">{item.name}</span>
                                                <span className="text-gray-500 text-sm md:hidden">Price: {formatPrice(item.price)}</span>
                                            </div>
                                        </div>

                                        {/* Price Column - Hidden on mobile */}
                                        <div className="hidden md:flex items-center justify-start font-medium">{formatPrice(item.price)}</div>

                                        {/* Quantity Column */}
                                        <div className="flex items-center justify-between md:justify-start">
                                            <span className="text-sm text-gray-500 md:hidden">Quantity:</span>
                                            <div className="flex items-center gap-2">
                                                <button 
                                                    onClick={() => handleQuantityUpdate(item.key, item.quantity - 1)}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                >
                                                    -
                                                </button>
                                                <span className="w-6 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                                                <button 
                                                    onClick={() => handleQuantityUpdate(item.key, item.quantity + 1)}
                                                    className="w-7 h-7 sm:w-8 sm:h-8 border border-gray-300 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors"
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>

                                        {/* Subtotal Column */}
                                        <div className="flex items-center justify-between md:justify-start">
                                            <span className="text-sm text-gray-500 md:hidden">Subtotal:</span>
                                            <span className="font-medium text-sm sm:text-base">{formatPrice(calculateSubtotal(item.price, item.quantity))}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="flex justify-end">
                                <div className="w-full sm:w-80 md:w-96">
                                    <div className="bg-gray-900 rounded-lg shadow-sm p-4 sm:p-6">
                                        <h2 className="text-lg sm:text-xl font-semibold mb-4 text-white">Order Summary</h2>
                                        <div className="space-y-3 sm:space-y-4">
                                            <div className="flex justify-between text-sm sm:text-base text-gray-300">
                                                <span>Subtotal</span>
                                                <span>{formatPrice(getTotalPrice())}</span>
                                            </div>
                                            <div className="flex justify-between text-sm sm:text-base text-gray-300">
                                                <span>Shipping</span>
                                                <span>Free</span>
                                            </div>
                                            <div className="border-t border-gray-700 pt-3 sm:pt-4">
                                                <div className="flex justify-between font-semibold text-white text-sm sm:text-base">
                                                    <span>Total</span>
                                                    <span>{formatPrice(getTotalPrice())}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => router.push('/checkout')}
                                            className="w-full bg-[#DB4444] text-white text-sm sm:text-base cursor-pointer font-bold py-2.5 sm:py-3 rounded-md mt-4 sm:mt-6 hover:bg-[#c13a3a] transition-colors"
                                        >
                                            Checkout
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default CartPage;