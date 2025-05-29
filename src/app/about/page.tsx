import React from 'react';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
    weight: ['400', '500', '600'],
    subsets: ['latin']
});

export default function About() {
    return (
        <>
            <Header />
            <main className={`min-h-screen bg-white ${poppins.className}`}>
                <div className="container mx-auto px-4 py-8">
                    <h1 className="text-3xl text-[#DB4444] font-bold mb-6">About Us</h1>
                    <div className="prose max-w-none">
                        <p className="text-gray-600 mb-4">
                            Welcome to Exclusive, your premier destination for high-quality products and exceptional shopping experiences.
                        </p>
                        <p className="text-gray-600 mb-4">
                            Our mission is to provide our customers with the best selection of products, competitive prices, and outstanding customer service.
                        </p>
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
} 