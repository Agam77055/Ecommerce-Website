'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import Header from "@/components/Layout/Header";
import Footer from "@/components/Layout/Footer";
import sideImage from '@/assets/Auth/Side_Image.svg';

const SignUp = () => {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setIsLoading(false);
            return;
        }

        try {
            // First, create the account
            const signupResponse = await fetch('http://localhost:5001/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const signupData = await signupResponse.json();

            if (!signupResponse.ok) {
                throw new Error(signupData.error || 'Failed to sign up');
            }

            // After successful signup, automatically log in
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
                callbackUrl: '/'
            });

            if (result?.error) {
                console.error('Login error:', result.error);
                throw new Error(`Failed to log in automatically: ${result.error}`);
            }

            // Redirect to home page
            router.push('/');
        } catch (err) {
            console.error('Signup error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred during sign up');
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            await signIn("google", { callbackUrl: "/" });
        } catch (error) {
            setError("Error signing in with Google");
        }
    };

    return (
        <>
        <Header />
        <div className="min-h-screen bg-white flex">
            {/* Left side - Image */}
            <div className="hidden lg:block w-1/2 relative">
                <div className="absolute inset-y-8">
                    <Image
                        src={sideImage}
                        alt="Sign Up"
                        width={800}
                        height={800}
                        className="object-contain w-full h-full"
                        priority
                    />
                </div>
            </div>

            {/* Right side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center">
                <div className="w-full max-w-sm px-4 md:px-5 flex flex-col gap-6">
                    <h1 className="text-4xl font-medium text-gray-900">
                        Create an Account
                    </h1>
                    <p className="text-gray-600 text-left left-5">
                        Enter your details below
                    </p>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-2 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <div>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 text-sm border-b border-gray-300 text-gray-800 focus:border-[#DB4444] outline-none transition-colors"
                                placeholder="Full Name"
                            />
                        </div>

                        <div>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 text-sm border-b border-gray-300 text-gray-800 focus:border-[#DB4444] outline-none transition-colors"
                                placeholder="Email Address"
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 text-sm border-b border-gray-300 text-gray-800 focus:border-[#DB4444] outline-none transition-colors"
                                placeholder="Password"
                            />
                        </div>

                        <div>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 text-sm border-b border-gray-300 text-gray-800 focus:border-[#DB4444] outline-none transition-colors"
                                placeholder="Confirm Password"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full bg-[#DB4444] text-white py-2.5 text-sm cursor-pointer rounded-lg font-medium hover:bg-[#c13a3a] transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div className="flex flex-col gap-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="px-2 bg-white text-gray-500">Or continue with</span>
                            </div>
                        </div>

                        <button
                            onClick={handleGoogleSignIn}
                            className="w-full flex items-center justify-center gap-2 px-3 py-2 cursor-pointer text-sm text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FcGoogle className="w-4 h-4" />
                            <span>Sign up with Google</span>
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{' '}
                        <Link href="/login" className="text-[#DB4444] hover:text-[#c13a3a] font-medium">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </div>
        <Footer />
        </>
    );
};

export default SignUp; 