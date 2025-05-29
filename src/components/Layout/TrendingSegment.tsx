'use client';

import React, { useEffect, useState, useRef } from 'react';
import { Product } from '@/types/product';
import ProductCard from '../ProductCard/ProductCard';

interface TrendingSegmentProps {
    tag?: string;
}

interface TagWiseProducts {
    [key: string]: Product[];
}

const TrendingSegment: React.FC<TrendingSegmentProps> = ({ tag }) => {
    const [trendingProducts, setTrendingProducts] = useState<Product[] | TagWiseProducts>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const scrollContainerRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const scroll = (direction: 'left' | 'right', tagName?: string) => {
        const ref = tagName ? scrollContainerRefs.current[tagName] : scrollContainerRefs.current['global'];
        if (ref) {
            const scrollAmount = 300;
            const currentScroll = ref.scrollLeft;
            const newScroll = direction === 'left' 
                ? currentScroll - scrollAmount 
                : currentScroll + scrollAmount;
            
            ref.scrollTo({
                left: newScroll,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        const fetchTrendingProducts = async () => {
            try {
                setIsLoading(true);
                setError(null);

                // Use 'all' if no tag is provided
                const tagToFetch = tag || 'all';
                const response = await fetch(`http://localhost:5001/api/trending/${tagToFetch}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch trending products');
                }

                const data = await response.json();

                // Handle both array and object responses
                if (Array.isArray(data)) {
                    const validProducts = data.filter((item): item is Product => {
                        return (
                            typeof item === 'object' &&
                            item !== null &&
                            typeof item.key === 'number' &&
                            typeof item.name === 'string' &&
                            typeof item.price === 'number' &&
                            typeof item.image === 'string' &&
                            typeof item.category === 'string' &&
                            typeof item.description === 'string'
                        );
                    });
                    setTrendingProducts(validProducts);
                } else if (typeof data === 'object') {
                    // Handle tag-wise products
                    const formattedData: TagWiseProducts = {};
                    Object.entries(data).forEach(([tag, products]) => {
                        if (Array.isArray(products)) {
                            formattedData[tag] = products.filter((item): item is Product => {
                                return (
                                    typeof item === 'object' &&
                                    item !== null &&
                                    typeof item.key === 'number' &&
                                    typeof item.name === 'string' &&
                                    typeof item.price === 'number' &&
                                    typeof item.image === 'string' &&
                                    typeof item.category === 'string' &&
                                    typeof item.description === 'string'
                                );
                            });
                        }
                    });
                    setTrendingProducts(formattedData);
                } else {
                    throw new Error('Invalid data format received');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load trending products');
            } finally {
                setIsLoading(false);
            }
        };

        fetchTrendingProducts();
    }, [tag]);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 pt-2 pb-6">
                <div className="flex justify-center items-center min-h-[200px]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DB4444]"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 pt-2 pb-6">
                <div className="text-center">
                    <p className="text-red-500 mb-4">{error}</p>
                    <p className="text-gray-600">Please try again later</p>
                </div>
            </div>
        );
    }

    const renderProductSection = (products: Product[], sectionTag?: string) => (
        <div className="mb-8 sm:mb-10 md:mb-12">
            <div className="mb-4 sm:mb-6 md:mb-8">
                <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-3 h-8 sm:w-4 sm:h-9 md:w-5 md:h-10 bg-[#DB4444] rounded-md"></div>
                    <h2 className="text-lg sm:text-xl md:text-2xl text-[#DB4444] font-bold">
                        {sectionTag 
                            ? `Trending in ${sectionTag.charAt(0).toUpperCase() + sectionTag.slice(1)}`
                            : 'Trending Products'}
                    </h2>
                </div>
                <p className="text-gray-500 text-base sm:text-lg md:text-xl mt-2 ml-6 sm:ml-7 md:ml-8">
                    {sectionTag 
                        ? `Discover our most popular ${sectionTag} items this week`
                        : 'Discover our most popular items this week'}
                </p>
            </div>
            
            <div className="relative">
                <button 
                    onClick={() => scroll('left', sectionTag)}
                    className="absolute left-0 top-1/2 -translate-y-3/4 -translate-x-4 sm:-translate-x-5 md:-translate-x-6 z-20 bg-white/80 backdrop-blur-sm rounded-full p-2 sm:p-2.5 md:p-3 shadow-lg hover:bg-white/90 transition-colors cursor-pointer select-none"
                    type="button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                <div 
                    ref={(el) => {
                        scrollContainerRefs.current[sectionTag || 'global'] = el;
                    }}
                    className="flex overflow-x-auto gap-3 sm:gap-4 pb-4 hide-scrollbar"
                >
                    {products.map((product) => (
                        <div key={product.key} className="flex-none w-[200px] sm:w-[240px] md:w-[280px]">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>

                <button 
                    onClick={() => scroll('right', sectionTag)}
                    className="absolute right-0 top-1/2 -translate-y-3/4 translate-x-4 sm:translate-x-5 md:translate-x-6 z-20 bg-white/80 backdrop-blur-sm rounded-full p-2 sm:p-2.5 md:p-3 shadow-lg hover:bg-white/90 transition-colors cursor-pointer select-none"
                    type="button"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );

    return (
        <div className="container mx-auto px-4 sm:px-6 md:px-8 lg:pl-21 pb-6">
            {Array.isArray(trendingProducts) ? (
                renderProductSection(trendingProducts, tag || 'all')
            ) : (
                Object.entries(trendingProducts).map(([tag, products]) => (
                    <div key={tag}>
                        {renderProductSection(products, tag)}
                    </div>
                ))
            )}
        </div>
    );
};

export default TrendingSegment;