'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import banner1 from '@/assets/Banners/banner1.jpg';
import banner2 from '@/assets/Banners/banner2.svg';
import banner3 from '@/assets/Banners/banner3.jpg';

const banners = [
    {
        id: 1,
        title: "Summer Collection",
        description: "Discover our latest summer styles",
        image: banner1,
        overlayText: "New Season",
        ctaLink: "/"
    },
    {
        id: 2,
        title: "New Arrivals",
        image: banner2,
        ctaLink: "/"
    },
    {
        id: 3,
        title: "Special Offers",
        description: "Limited time deals and discounts",
        image: banner3,
        overlayText: "Sale",
        ctaLink: "/"
    }
];

const FirstSegment: React.FC = () => {
    const [currentBanner, setCurrentBanner] = useState(0);

    const handlePrevBanner = () => {
        setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const handleNextBanner = () => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
    };

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentBanner((prev) => (prev + 1) % banners.length);
        }, 7000);

        return () => clearInterval(timer);
    }, []);

    return (
        <section className="w-full flex justify-center items-center bg-gradient-to-b from-gray-50 to-white px-4 sm:px-8 md:px-16 lg:px-24 py-12">
            <div className="relative w-full max-w-5xl mx-auto overflow-hidden rounded-2xl shadow-xl aspect-[2.77/1]">
                {banners.map((banner, idx) => (
                    <div
                        key={banner.id}
                        className={`absolute inset-0 transition-opacity duration-700 ${idx === currentBanner ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                    >
                        <Image
                            src={banner.image}
                            alt={banner.title}
                            fill
                            quality={100}
                            className={`w-full h-full ${banner.id === 2 ? 'object-contain bg-black' : 'object-cover'}`}
                            priority={idx === 0}
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
                            style={{ objectPosition: banner.id === 1 ? 'center center' : 'cover' }}
                        />
                        {/* Overlay Content */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
                            {banner.id === 1 && (
                                <div className="absolute left-[8%] sm:left-[10%] md:left-[12%] top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm rounded-md p-1.5 sm:p-2 md:p-3 w-[50%] sm:w-[50%] md:w-[50%] lg:w-[50%] pointer-events-auto">
                                    <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-orange-400 to-pink-600 bg-clip-text text-transparent mb-0.5 drop-shadow-lg">{banner.overlayText}</h1>
                                    <span className="block w-8 h-0.5 bg-pink-500 rounded mb-1.5 mx-auto"></span>
                                    <h2 className="text-white text-xs sm:text-sm md:text-base lg:text-lg font-medium drop-shadow mb-0.5">{banner.title}</h2>
                                    <p className="text-gray-200 text-[10px] sm:text-xs md:text-sm lg:text-base mb-2 drop-shadow">{banner.description}</p>
                                    <a
                                        href={banner.ctaLink}
                                        aria-label="Shop now"
                                        className="inline-block bg-gradient-to-r from-pink-500 to-red-500 text-white px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-md text-[10px] sm:text-xs md:text-sm font-semibold shadow-lg transform hover:scale-105 transition-all cursor-pointer relative z-10"
                                    >
                                        Shop Now
                                    </a>
                                </div>
                            )}
                            {banner.id === 2 && (
                                <div className="absolute bottom-[8%] left-[10%] sm:bottom-[10%] sm:left-[10%] md:bottom-[12%] pointer-events-auto">
                                    <a
                                        href={banner.ctaLink}
                                        className="text-white text-[10px] sm:text-xs md:text-sm font-semibold border-b border-white hover:border-red-400 hover:text-red-400 transition-colors cursor-pointer"
                                    >
                                        Shop Now
                                    </a>
                                </div>
                            )}
                            {banner.id === 3 && (
                                <div className="absolute right-[2%] sm:right-[3%] md:right-[4%] top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-sm rounded-md p-1.5 sm:p-2 md:p-3 w-[40%] sm:w-[40%] md:w-[40%] lg:w-[40%] pointer-events-auto">
                                    <span className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-bold mb-0.5">{banner.overlayText}</span>
                                    <h2 className="text-white text-xs sm:text-sm md:text-base lg:text-lg mb-0.5">{banner.title}</h2>
                                    <p className="text-white text-[10px] sm:text-xs md:text-sm lg:text-base mb-2">{banner.description}</p>
                                    <a
                                        href={banner.ctaLink}
                                        className="bg-red-400 text-white px-1.5 sm:px-2 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-md hover:bg-white hover:text-black transition-colors text-[10px] sm:text-xs md:text-sm font-semibold"
                                    >
                                        View Deals
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                {/* Navigation Arrows */}
                <button
                    onClick={handlePrevBanner}
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors backdrop-blur-sm cursor-pointer"
                    aria-label="Previous banner"
                >
                    <ChevronLeft size={24} />
                </button>
                <button
                    onClick={handleNextBanner}
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full transition-colors backdrop-blur-sm cursor-pointer"
                    aria-label="Next banner"
                >
                    <ChevronRight size={24} />
                </button>
            </div>
        </section>
    );
};

export default FirstSegment; 