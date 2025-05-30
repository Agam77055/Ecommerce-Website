'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import Image from 'next/image';
import Link from 'next/link';

interface Product {
    key: number;
    name: string;
    description: string;
    price: number;
    image: string;
    brand: string;
    category: string;
    rating: number;
    stock: number;
    discountPercentage: number;
}

function SearchContent() {
    const searchParams = useSearchParams();
    const [results, setResults] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const searchTerm = searchParams.get('q');
        
        if (!searchTerm) {
            setResults([]);
            setIsLoading(false);
            return;
        }

        const fetchResults = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await fetch('/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ searchTerm }),
                });

                if (!response.ok) {
                    throw new Error(`Search failed: ${response.statusText}`);
                }

                const data = await response.json();
                setResults(data);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred during search');
                setResults([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchResults();
    }, [searchParams]);

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-semibold mb-6 text-[#DB4444]">
                Search Results for "{searchParams.get('q')}"
            </h1>

            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DB4444]"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center py-8">{error}</div>
            ) : results.length === 0 ? (
                <div className="text-gray-500 text-center py-8">
                    No products found matching your search.
                </div>
            ) : (
                <>
                    <div className="text-[#DB4444] text-xl font-semibold mb-6">
                        For the search results:
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {results.map((product) => (
                            <Link 
                                href={`/product/${product.key}`} 
                                key={product.key}
                                className="group"
                            >
                                <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300">
                                    <div className="relative aspect-square overflow-hidden rounded-t-lg">
                                        <Image
                                            src={product.image || '/placeholder.png'}
                                            alt={product.name || 'Product image'}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {product.discountPercentage > 0 && (
                                            <div className="absolute top-2 left-2 bg-[#DB4444] text-white px-2 py-1 rounded">
                                                {Math.round(product.discountPercentage)}% OFF
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-4">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2">
                                            {product.name || 'Unnamed Product'}
                                        </h3>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[#DB4444] font-semibold">
                                                    ${(product.price || 0).toFixed(2)}
                                                </span>
                                                {product.discountPercentage > 0 && (
                                                    <span className="text-gray-500 line-through">
                                                        ${((product.price || 0) * (1 + (product.discountPercentage || 0) / 100)).toFixed(2)}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                                <span className="text-sm text-gray-600">
                                                    {(typeof product.rating === 'number' ? product.rating : 0).toFixed(1)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2 line-clamp-2">
                                            {product.description || 'No description available'}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}

export default function SearchPage() {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-white">
                <Suspense fallback={
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DB4444]"></div>
                    </div>
                }>
                    <SearchContent />
                </Suspense>
            </main>
            <Footer />
        </>
    );
} 