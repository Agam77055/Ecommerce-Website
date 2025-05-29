'use client';

import React from 'react';
import { Product } from '@/types/product';
import ProductCard from '../ProductCard/ProductCard';

interface SearchResultsProps {
    results: Product[];
    isLoading: boolean;
    error: string | null;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, isLoading, error }) => {
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#DB4444]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8">
                <p className="text-red-500 mb-4">{error}</p>
                <p className="text-gray-600">Please try again later or try a different search term.</p>
            </div>
        );
    }

    if (!results || results.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-600 mb-2">No products found</p>
                <p className="text-gray-500 text-sm">Try adjusting your search terms or browse our categories</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {results.map((product) => (
                <ProductCard key={product.key} product={product} />
            ))}
        </div>
    );
};

export default SearchResults; 