'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard/ProductCard';

interface CartItem {
    key: string;
    name: string;
    price: number;
    quantity: number;
}

interface Product {
    key: string;
    name: string;
    price: number;
    image: string;
    category: string;
    description: string;
    discountPercentage: number;
    rating: number;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const { items, clearCart } = useCart();
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const recommendedScrollRef = useRef<HTMLDivElement | null>(null);

    const scrollRecommended = (direction: 'left' | 'right') => {
        const ref = recommendedScrollRef.current;
        if (ref) {
            const scrollAmount = 300;
            const currentScroll = ref.scrollLeft;
            const newScroll = direction === 'left'
                ? currentScroll - scrollAmount
                : currentScroll + scrollAmount;
            ref.scrollTo({ left: newScroll, behavior: 'smooth' });
        }
    };

    useEffect(() => {
        // Redirect to login if not authenticated
        if (!session?.user) {
            router.push('/login?redirect=checkout');
            return;
        }

        // Redirect to cart if cart is empty
        if (!items || items.length === 0) {
            router.push('/cart');
            return;
        }
    }, [session, items, router]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!session?.user?.id) return;
            setLoadingRecommendations(true);
            try {
                const response = await fetch(`/api/recommendations?userId=${session.user.id}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch recommendations');
                }
                const data = await response.json();
                setRecommendedProducts(data);
            } catch (err) {
                console.error('Error fetching recommendations:', err);
            } finally {
                setLoadingRecommendations(false);
            }
        };

        fetchRecommendations();
    }, [session?.user?.id]);

    const handlePurchase = async () => {
        if (!session?.user) {
            setError('Please log in to complete your purchase');
            return;
        }

        try {
            setIsProcessing(true);
            setError(null);

            const response = await fetch('/api/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    products: items.map((item: CartItem) => item.key)
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to process purchase');
            }

            // Clear the cart before redirection
            clearCart();
            
            // Redirect to thank you page
            console.log('Redirecting to thank you page...');
            window.location.replace('/thank-you');
            return; // Prevent any further code execution
        } catch (err) {
            console.error('Purchase error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred during checkout');
            setIsProcessing(false);
        }
    };

    if (!session?.user) {
        return null; // Will redirect in useEffect
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-gray-50">
                <div className="container mx-auto px-4 py-8 pl-4 md:pl-21 transition-all duration-300">
                    {/* Breadcrumb Navigation */}
                    <div className="flex items-center gap-2 text-sm mb-8 transition-all duration-300">
                        <Link href="/" className="text-gray-500 hover:text-[#DB4444]">
                            Home
                        </Link>
                        <span className="text-gray-500">/</span>
                        <Link href="/cart" className="text-gray-500 hover:text-[#DB4444]">
                            Cart
                        </Link>
                        <span className="text-gray-500">/</span>
                        <span className="text-[#DB4444]">Checkout</span>
                    </div>

                    {/* Centered Checkout Box */}
                    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
                        <h1 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-[#DB4444]">
                            Checkout
                        </h1>

                        {error && (
                            <div className="bg-red-50 text-red-500 p-3 sm:p-4 rounded mb-4 text-sm sm:text-base">
                                {error}
                            </div>
                        )}

                        <div className="mb-4 sm:mb-6 text-gray-600">
                            <h2 className="text-base sm:text-lg text-gray-900 font-medium mb-3 sm:mb-4">Order Summary</h2>
                            <div className="space-y-3 sm:space-y-4">
                                {items.map((item: CartItem) => (
                                    <div key={item.key} className="flex justify-between items-center text-sm sm:text-base">
                                        <span>{item.name} (x{item.quantity})</span>
                                        <span>${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                ))}
                                <div className="border-t pt-3 sm:pt-4">
                                    <div className="flex text-black justify-between font-semibold text-sm sm:text-base">
                                        <span>Total</span>
                                        <span>
                                            ${items.reduce((sum: number, item: CartItem) => sum + (item.price * item.quantity), 0).toFixed(2)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handlePurchase}
                            disabled={isProcessing}
                            className={`w-full cursor-pointer py-2.5 sm:py-3 px-4 rounded-md text-white text-sm sm:text-base font-medium
                                ${isProcessing 
                                    ? 'bg-gray-400 cursor-not-allowed' 
                                    : 'bg-[#DB4444] hover:bg-[#c13a3a]'
                                }`}
                        >
                            {isProcessing ? 'Processing...' : 'Complete Purchase'}
                        </button>
                    </div>

                    {/* Recommended Products Section */}
                    {session?.user && (
                        <div className="mt-8 sm:mt-10 md:mt-12 px-4 sm:px-6 md:px-8">
                            <div className="mb-6 sm:mb-7 md:mb-8">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="w-3 h-8 sm:w-4 sm:h-9 md:w-5 md:h-10 bg-[#DB4444] rounded-md"></div>
                                    <h2 className="text-lg sm:text-xl md:text-2xl text-[#DB4444] font-bold">
                                        Recommended for You
                                    </h2>
                                </div>
                                <p className="text-gray-500 text-base sm:text-lg md:text-xl mt-2 ml-6 sm:ml-7 md:ml-8">
                                    Discover products you may like based on your history
                                </p>
                            </div>
                            {loadingRecommendations ? (
                                <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 hide-scrollbar">
                                    {[...Array(4)].map((_, index) => (
                                        <div key={index} className="animate-pulse w-[200px] sm:w-[240px] md:w-[280px]">
                                            <div className="bg-gray-200 h-48 sm:h-56 md:h-64 rounded-lg mb-4"></div>
                                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                        </div>
                                    ))}
                                </div>
                            ) : recommendedProducts.length > 0 ? (
                                <div className="relative">
                                    <button
                                        onClick={() => scrollRecommended('left')}
                                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-5 md:-translate-x-6 z-20 bg-white/80 backdrop-blur-sm p-2 sm:p-2.5 md:p-3 rounded-full shadow-lg hover:bg-white/90 transition-colors cursor-pointer select-none"
                                        type="button"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <div
                                        ref={recommendedScrollRef}
                                        className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 hide-scrollbar"
                                    >
                                        {recommendedProducts.map((recommendedProduct) => (
                                            <div key={recommendedProduct.key} className="flex-none w-[200px] sm:w-[240px] md:w-[280px]">
                                                <ProductCard product={{ ...recommendedProduct, key: recommendedProduct.key.toString() }} />
                                            </div>
                                        ))}
                                    </div>
                                    <button
                                        onClick={() => scrollRecommended('right')}
                                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-5 md:translate-x-6 z-20 bg-white/80 backdrop-blur-sm p-2 sm:p-2.5 md:p-3 rounded-full shadow-lg hover:bg-white/90 transition-colors cursor-pointer select-none"
                                        type="button"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-center text-sm sm:text-base">No recommendations available</p>
                            )}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
} 