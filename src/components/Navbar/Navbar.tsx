'use client'

import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchInput from "./SearchInput";    
import HoverGradientText from "./HoverGradientText";
import { Heart, ShoppingBag, User, LogOut, LogIn, UserCircle, Settings, Package, Menu, X, UserPlus } from "lucide-react";
import { useCart } from '@/context/CartContext';
import { useSession, signOut } from "next-auth/react";


const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { items } = useCart();
    const { data: session, status } = useSession();
    const router = useRouter();

    const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleLogout = async () => {
        await signOut({ redirect: false });
        router.push('/login');
    };

    return (
        <nav className={`bg-white py-4 border-b border-gray-200`}>
            <div className="container mx-auto px-4 pl-4 lg:pl-21 flex items-center justify-between w-full transition-all duration-300">
                {/* Left: Hamburger (mobile only) */}
                <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="lg:hidden text-gray-400 hover:text-red-400 transition-colors cursor-pointer mr-2 z-20"
                >
                    <Menu size={24} />
                </button>
                {/* Center: Title and nav links */}
                <div className="flex-1 flex flex-col items-center lg:flex-row lg:items-center">
                    <div className="flex items-center justify-center w-full lg:w-auto">
                        <Link href="/" className="flex items-center mt-2 lg:mt-2">
                            <HoverGradientText>
                                Exclusive
                            </HoverGradientText>
                        </Link>
                        <div className="hidden lg:flex items-center space-x-8 ml-16 mt-2.5">
                            <Link href="/" className={`text-gray-800 hover:text-red-400 transition-colors`}>Home</Link>
                            <Link href="/contact" className={`text-gray-800 hover:text-red-400 transition-colors`}>Contact</Link>
                            <Link href="/about" className={`text-gray-800 hover:text-red-400 transition-colors`}>About</Link>
                            {status === "unauthenticated" && (
                                <Link href="/login" className={`text-gray-800 hover:text-red-400 transition-colors`}>Sign In</Link>
                            )}
                        </div>
                    </div>
                    {/* Mobile search bar below title */}
                    <div className="lg:hidden w-3/4 mt-2 flex justify-center">
                        <SearchInput />
                    </div>
                </div>
                {/* Right: Search, Cart, User (desktop only) */}
                <div className="hidden lg:flex items-center gap-6 flex-shrink-0 transition-all duration-300">
                    <SearchInput />
                    <Link href="/cart" className={`text-gray-400 hover:text-red-400 transition-colors relative`}>
                        <div className="relative">
                            <ShoppingBag size={24} />
                            {totalQuantity > 0 && (
                                <span className="absolute -top-2 -right-2 bg-[#DB4444] text-white text-xs font-medium w-5 h-5 rounded-full flex items-center justify-center">
                                    {totalQuantity}
                                </span>
                            )}
                        </div>
                    </Link>
                    <div className="relative flex items-center" ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className={`text-gray-400 hover:text-red-400 transition-colors cursor-pointer`}
                        >
                            <User size={24} />
                        </button>
                        {isDropdownOpen && (
                            <div className="absolute right-0 top-full mt-2 w-56 bg-white/80 backdrop-blur-md rounded-lg shadow-xl py-2 z-50 border border-gray-200/50">
                                {status === "authenticated" ? (
                                    <>
                                        <div className="px-4 py-2 border-b border-gray-100/50">
                                            <p className="text-sm font-medium text-gray-900">Welcome back!</p>
                                            <p className="text-xs text-gray-500">{session.user?.name}</p>
                                        </div>
                                        <button onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-white/50 transition-colors cursor-pointer hover:text-red-700">
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Logout
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <div className="px-4 py-2 border-b border-gray-100/50">
                                            <p className="text-sm font-medium text-gray-900">Welcome to Exclusive</p>
                                            <p className="text-xs text-gray-500">Sign in or create an account</p>
                                        </div>
                                        <div className="py-2">
                                            <Link href="/login" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-white/50 hover:text-red-600 transition-colors">
                                                <LogIn className="w-4 h-4 mr-2" />
                                                Sign In
                                            </Link>
                                            <Link href="/signup" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-white/50 hover:text-red-600 transition-colors">
                                                <UserPlus className="w-4 h-4 mr-2" />
                                                Create Account
                                            </Link>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
                {/* MOBILE NAVIGATION (SLIDING MENU) */}
                <div className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-start z-50 lg:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={() => setIsMenuOpen(false)}>
                    <div className={`bg-white/0 backdrop-blur-md h-full w-80 shadow-lg p-6 flex flex-col relative transition-transform duration-100 transform ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`} onClick={(e) => e.stopPropagation()}>
                        <div className="flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-2xl font-semibold text-white">Menu</h3>
                            </div>
                            <div className="flex flex-col gap-6 mb-4">
                                <div className="text-medium font-medium text-gray-300">Welcome to Exclusive</div>
                                {status === "authenticated" && (
                                    <div className="flex items-center text-gray-300">
                                        <User size={24} />
                                        <span className="ml-2 text-sm">Hi, {session?.user?.name}</span>
                                    </div>
                                )}
                                <Link href="/cart" className="flex items-center text-gray-300 hover:text-red-400 transition-colors">
                                    <ShoppingBag size={24} />
                                    <span className="ml-2 text-sm">Cart</span>
                                </Link>
                            </div>
                            <div className="border-t border-gray-200 my-4"></div>
                            <div className="space-y-6">
                                <Link href="/" className="block text-gray-300 hover:text-red-400 transition-colors">Home</Link>
                                <Link href="/contact" className="block text-gray-300 hover:text-red-400 transition-colors">Contact</Link>
                                <Link href="/about" className="block text-gray-300 hover:text-red-400 transition-colors">About</Link>
                            </div>
                        </div>
                        {status === "authenticated" ? (
                            <button onClick={handleLogout} className="flex items-center text-gray-300 hover:text-red-400 transition-colors w-full mt-auto cursor-pointer">
                                <LogOut size={24} />
                                <span className="ml-2 text-sm">Logout</span>
                            </button>
                        ) : (
                            <div className="flex flex-col gap-4 mt-auto">
                                <Link href="/login" className="flex items-center text-gray-300 hover:text-red-400 transition-colors">
                                    <LogIn size={24} />
                                    <span className="ml-2 text-sm">Sign In</span>
                                </Link>
                                <Link href="/signup" className="flex items-center text-gray-300 hover:text-red-400 transition-colors">
                                    <UserPlus size={24} />
                                    <span className="ml-2 text-sm">Create Account</span>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;