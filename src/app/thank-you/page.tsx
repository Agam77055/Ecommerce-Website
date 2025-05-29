import Link from 'next/link';
import { CheckCircle } from 'lucide-react';

export default function ThankYouPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
            <div className="text-center space-y-8">
                <div className="flex justify-center">
                    <div className="w-32 h-32 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-20 h-20 text-white" />
                    </div>
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900">
                    Thank You for Your Purchase!
                </h1>
                
                <p className="text-xl text-gray-600 max-w-md mx-auto">
                    Your order has been successfully placed. We appreciate your business!
                </p>

                <Link 
                    href="/"
                    className="inline-block px-8 py-3 bg-[#DB4444] text-white rounded-md hover:bg-[#c13a3a] transition-colors"
                >
                    Return to Home
                </Link>
            </div>
        </div>
    );
} 