import React from 'react';
import Link from 'next/link';
import Header from '@/components/Layout/Header';
import Footer from '@/components/Layout/Footer';

export default function NotFound() {
    return (
        <>
            <Header />
            <div className="bg-white py-4">
                <div className="container mx-auto px-4">
                    <div className="flex items-center text-sm text-gray-500">
                        <Link href="/" className="hover:text-[#DB4444] transition-colors">Home</Link>
                        <span className="mx-2">/</span>
                        <span className="text-[#DB4444]">404</span>
                    </div>
                </div>
            </div>
            <div className="min-h-[60vh] flex items-center justify-center bg-white">
                <div className="text-center space-y-8 px-4 w-full max-w-md mx-auto">
                    <div className="space-y-4">
                        <h1 className="text-9xl font-bold text-[#DB4444]">404</h1>
                        <h2 className="text-3xl font-semibold text-gray-800">Page Not Found</h2>
                        <p className="text-gray-500">
                            The page you are looking for doesn't exist or has been moved.
                            Please check the URL or return to the homepage.
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <Link 
                            href="/" 
                            className="w-[200px] px-8 py-3 bg-[#DB4444] text-white font-medium rounded-md hover:bg-[#c13a3a] transition-colors text-center"
                        >
                            Return to Home
                        </Link>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
} 