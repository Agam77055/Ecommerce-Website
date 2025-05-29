import React from 'react';
import Link from 'next/link';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

export default function NotFound() {
    return (
        <>
            <Header />
            <div className="bg-gray-50 py-4">
                <div className="container mx-auto px-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <Link href="/" className="hover:text-[#DB4444] transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-[#DB4444]">404</span>
                    </div>
                </div>
            </div>
            <div className="py-25 flex items-center justify-center bg-white text-black">
                <div className="text-center space-y-6">
                    <h1 className="text-9xl font-bold">404</h1>
                    <h2 className="text-2xl font-medium">Page Not Found</h2>
                    <p className="text-gray-400">The page you are looking for doesn't exist or has been moved.</p>
                    <Link 
                        href="/" 
                        className="inline-block px-6 py-3 bg-[#DB4444] text-white font-medium rounded-sm hover:bg-[#c13a3a] transition-colors"
                    >
                        Return to Home
                    </Link>
                </div>
            </div>
            <Footer />
        </>
    );
} 