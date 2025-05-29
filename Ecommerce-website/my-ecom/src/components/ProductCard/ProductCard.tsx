'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/types/product';
import { ShoppingCart, Star } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/utils/formatPrice';

interface ProductCardProps {
    product: Product;
}

const PartialStar: React.FC<{ fillPercentage: number }> = ({ fillPercentage }) => {
    return (
        <div className="relative">
            <Star size={16} className="text-gray-300" />
            <div 
                className="absolute top-0 left-0 overflow-hidden" 
                style={{ width: `${fillPercentage}%` }}
            >
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
            </div>
        </div>
    );
};

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { addItem } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const button = e.currentTarget as HTMLButtonElement;

        // Reset the animation by removing and re-adding the class
        button.classList.remove('animate-click');
        // Force a reflow
        void button.offsetWidth;
        button.classList.add('animate-click');

        addItem({
            key: product.key,
            name: product.name,
            price: product.price,
            image: product.image,
            category: product.category,
            description: product.description
        });
    };

    return (
        <Link 
            href={`/product/${product.key}`} 
            className="group"
        >
            <div className="flex flex-col">
                <div className="relative h-48 w-full group rounded-lg overflow-hidden shadow-sm">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                    />
                    {product.discountPercentage > 0 && (
                        <div className="absolute top-2 left-2 bg-[#DB4444] text-white px-2 py-1 rounded text-sm font-medium">
                            {Math.round(product.discountPercentage)}% OFF
                        </div>
                    )}
                    {/* Add to Cart Overlay */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                        <button
                            id={`add-to-cart-${product.key}`}
                            onClick={handleAddToCart}
                            className="w-full bg-black text-white py-2 cursor-pointer flex items-center justify-center gap-2 hover:bg-[#DB4444] transition-all duration-300"
                        >
                            <ShoppingCart size={20} />
                            Add to Cart
                        </button>
                    </div>
                </div>
                <div className="mt-2">
                    <h3 className="text-medium font-medium text-gray-900 group-hover:text-[#DB4444] transition-colors">
                        {product.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                        {product.category}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                        <p className="text-[#DB4444] font-semibold">
                            {formatPrice(product.price)}
                        </p>
                        {product.discountPercentage > 0 && (
                            <p className="text-gray-500 line-through text-sm">
                                {formatPrice(product.price * (1 + product.discountPercentage / 100))}
                            </p>
                        )}
                    </div>
                    {/* Star Rating */}
                    <div className="flex items-center gap-1 mt-2">
                        {[...Array(5)].map((_, index) => {
                            const starValue = product.rating - index;
                            if (starValue <= 0) {
                                return <Star key={index} size={16} className="text-gray-300" />;
                            }
                            if (starValue >= 1) {
                                return <Star key={index} size={16} className="fill-yellow-400 text-yellow-400" />;
                            }
                            return <PartialStar key={index} fillPercentage={starValue * 100} />;
                        })}
                        <span className="text-sm text-gray-500 ml-1">({product.rating.toFixed(1)})</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ProductCard;

