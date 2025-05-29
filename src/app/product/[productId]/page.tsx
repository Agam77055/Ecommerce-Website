'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, Star, Plus, Minus } from 'lucide-react';
import ProductCard from '@/components/ProductCard/ProductCard';

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
    images: string[];
}

export default function ProductPage() {
    const params = useParams();
    const { addItem, updateQuantity } = useCart();
    const { data: session } = useSession();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [quantity, setQuantity] = useState(1);
    const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
    const [boughtTogetherProducts, setBoughtTogetherProducts] = useState<Product[]>([]);
    const [loadingRecommendations, setLoadingRecommendations] = useState(false);
    const [loadingBoughtTogether, setLoadingBoughtTogether] = useState(false);
    const boughtTogetherScrollRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                console.log('Fetching product with ID:', params.productId);
                const response = await fetch(`/api/products?ids=${params.productId}`);
                console.log('Response status:', response.status);
                if (!response.ok) {
                    throw new Error('Failed to fetch product');
                }
                const data = await response.json();
                console.log('Product data:', data);
                if (data && Array.isArray(data) && data.length > 0) {
                    const productData = data[0];
                    setProduct({
                        ...productData,
                        images: [...(productData.images || [])]
                    });
                    setSelectedImage(productData.images[0]);
                } else {
                    throw new Error('Product not found');
                }
            } catch (err) {
                console.error('Error fetching product:', err);
                setError(err instanceof Error ? err.message : 'Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [params.productId]);

    useEffect(() => {
        const fetchBoughtTogether = async () => {
            if (!product?.key) return;
            
            setLoadingBoughtTogether(true);
            try {
                const response = await fetch(`/api/bought-together?productId=${product.key}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch bought together products');
                }
                const data = await response.json();
                setBoughtTogetherProducts(data);
            } catch (err) {
                console.error('Error fetching bought together products:', err);
            } finally {
                setLoadingBoughtTogether(false);
            }
        };

        fetchBoughtTogether();
    }, [product?.key]);

    const handleAddToCart = () => {
        if (product) {
            addItem({
                key: product.key.toString(),
                name: product.name,
                price: product.price,
                image: product.image,
                category: product.category,
                description: product.description
            }, quantity);
        }
    };

    const scrollBoughtTogether = (direction: 'left' | 'right') => {
        const ref = boughtTogetherScrollRef.current;
        if (ref) {
            const scrollAmount = 300;
            const currentScroll = ref.scrollLeft;
            const newScroll = direction === 'left'
                ? currentScroll - scrollAmount
                : currentScroll + scrollAmount;
            ref.scrollTo({ left: newScroll, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50">
                    <div className="container mx-auto px-4 py-8">
                        <div className="animate-pulse">
                            <div className="h-96 bg-gray-200 rounded-lg mb-8"></div>
                            <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-full mb-4"></div>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (error || !product) {
        return (
            <>
                <Header />
                <main className="min-h-screen bg-gray-50">
                    <div className="container mx-auto px-4 py-8">
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-red-500 mb-4">Error</h1>
                            <p className="text-gray-600 mb-4">{error || 'Product not found'}</p>
                            <Link 
                                href="/"
                                className="inline-block px-6 py-3 bg-[#DB4444] text-white rounded-md hover:bg-[#c13a3a] transition-colors"
                            >
                                Return to Home
                            </Link>
                        </div>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Header />
            <main className="min-h-screen bg-white">
                <div className="container mx-auto px-4 py-8 pl-4 md:pl-12">
                    {/* Breadcrumb Navigation */}
                    <div className="flex items-center gap-2 text-sm py-4 pl-4 md:pl-8">
                        <Link href="/" className="text-gray-500 hover:text-[#DB4444]">
                            Home
                        </Link>
                        <span className="text-gray-500">/</span>
                        <Link href={`/search?q=${product.category}`} className="text-gray-500 hover:text-[#DB4444]">
                            {product.category}
                        </Link>
                        <span className="text-gray-500">/</span>
                        <span className="text-[#DB4444]">{product.name}</span>
                    </div>

                    <div className="bg-white p-4 md:p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Product Images */}
                            <div className="flex flex-col md:flex-row gap-4">
                                {/* Thumbnails */}
                                {product.images && product.images.length > 0 && (
                                    <div className="flex flex-row md:flex-col gap-4">
                                        {product.images.map((image, index) => (
                                            <button
                                                key={index}
                                                onClick={() => setSelectedImage(image)}
                                                className={`w-28 h-28 bg-gray-100 overflow-hidden border-2 ${
                                                    selectedImage === image ? 'border-[#DB4444]' : 'border-transparent'
                                                }`}
                                            >
                                                <img
                                                    src={image}
                                                    alt={`${product.name} - Image ${index + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                )}
                                {/* Main Image */}
                                <div className="flex-1 aspect-square relative overflow-hidden bg-gray-100">
                                    <img
                                        src={selectedImage || product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>

                            {/* Product Details */}
                            <div className="space-y-6 py-6">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                    <p className="text-gray-500">{product.brand}</p>
                                </div>

                                {/* Rating and Stock Status */}
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="flex">
                                            {[...Array(5)].map((_, index) => (
                                                <Star
                                                    key={index}
                                                    className={`w-5 h-5 ${
                                                        index < Math.floor(product.rating)
                                                            ? 'fill-yellow-400 text-yellow-400'
                                                            : 'text-gray-300'
                                                    }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-gray-600">({product.rating.toFixed(1)})</span>
                                    </div>
                                    <div className="h-4 w-px bg-gray-300"></div>
                                    <span className={`font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                                        {product.stock > 0 ? `In Stock (${product.stock} units)` : 'Out of Stock'}
                                    </span>
                                </div>

                                {/* Price */}
                                <div className="flex items-center gap-4">
                                    <span className="text-2xl font-bold text-[#DB4444]">
                                        ${product.price.toFixed(2)}
                                    </span>
                                    {product.discountPercentage > 0 && (
                                        <span className="text-lg text-gray-500 line-through">
                                            ${(product.price * (1 + product.discountPercentage / 100)).toFixed(2)}
                                        </span>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Description</h2>
                                    <p className="text-gray-600">{product.description}</p>
                                </div>

                                <div className="space-y-4 border-b-1 border-gray-300 pb-4 mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Details</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-gray-500">Category</p>
                                            <p className="font-medium text-gray-800">{product.category}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Brand</p>
                                            <p className="font-medium text-gray-800">{product.brand}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-8">
                                    <div className="flex items-center border border-gray-300 rounded-md">
                                        <button
                                            onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                            className="px-3 py-4 text-gray-600 cursor-pointer rounded-l-md hover:bg-gray-100"
                                            disabled={quantity <= 1}
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="px-4 py-2 text-gray-700">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(prev => Math.min(product.stock, prev + 1))}
                                            className="px-3 py-4 text-gray-600 cursor-pointer rounded-r-md hover:bg-gray-100"
                                            disabled={quantity >= product.stock}
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleAddToCart}
                                        disabled={product.stock === 0}
                                        className={`flex-1 py-3 px-6 rounded-md cursor-pointer flex items-center justify-center gap-2 ${
                                            product.stock > 0
                                                ? 'bg-[#DB4444] text-white hover:bg-[#c13a3a] transition-colors'
                                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                        }`}
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bought Together Section */}
                    <div className="mt-12 sm:mt-14 md:mt-16 px-4 sm:px-6 md:px-8">
                        <div className="mb-6 sm:mb-7 md:mb-8">
                            <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-3 h-8 sm:w-4 sm:h-9 md:w-5 md:h-10 bg-[#DB4444] rounded-md"></div>
                                <h2 className="text-lg sm:text-xl md:text-2xl text-[#DB4444] font-bold">
                                    Frequently Bought Together
                                </h2>
                            </div>
                            <p className="text-gray-500 text-base sm:text-lg md:text-xl mt-2 ml-6 sm:ml-7 md:ml-8">
                                Products often purchased together with this item
                            </p>
                        </div>
                        {loadingBoughtTogether ? (
                            <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 hide-scrollbar">
                                {[...Array(4)].map((_, index) => (
                                    <div key={index} className="animate-pulse w-[200px] sm:w-[240px] md:w-[280px]">
                                        <div className="bg-gray-200 h-48 sm:h-56 md:h-64 rounded-lg mb-4"></div>
                                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        ) : boughtTogetherProducts.length > 0 ? (
                            <div className="relative">
                                <button
                                    onClick={() => scrollBoughtTogether('left')}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-5 md:-translate-x-6 z-10 bg-white/80 backdrop-blur-sm p-2 sm:p-2.5 md:p-3 rounded-full shadow-lg hover:bg-white/90 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div
                                    ref={boughtTogetherScrollRef}
                                    className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 hide-scrollbar"
                                >
                                    {boughtTogetherProducts.map((product) => (
                                        <div key={product.key} className="flex-none w-[200px] sm:w-[240px] md:w-[280px]">
                                            <ProductCard product={{...product, key: product.key.toString()}} />
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => scrollBoughtTogether('right')}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-5 md:translate-x-6 z-10 bg-white/80 backdrop-blur-sm p-2 sm:p-2.5 md:p-3 rounded-full shadow-lg hover:bg-white/90 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center text-base sm:text-lg">No frequently bought together products found.</p>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
} 