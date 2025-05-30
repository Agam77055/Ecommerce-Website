import React from 'react';
import Image from 'next/image';
import GooglePlay from '@/assets/Footer/GooglePlay.svg';
import AppStore from '@/assets/Footer/AppStore.svg';
import Instagram from '@/assets/Footer/icon-instagram.svg';
import Facebook from '@/assets/Footer/Icon-Facebook.svg';
import Linkedin from '@/assets/Footer/Icon-Linkedin.svg';
import Twitter from '@/assets/Footer/Icon-Twitter.svg';
import QRCode from '@/assets/Footer/QrCode.svg';
import Link from 'next/link';


const Footer: React.FC = () => {
    return (
        <footer className={`bg-black text-white py-8`}>
            <div className="container mx-auto pt-6 px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 lg:gap-6">
                    {/* Section 1 - Wider column */}
                    <div className="lg:col-span-3 space-y-3 border-b border-gray-800 pb-4 md:border-b-0">
                        <h3 className="text-xl font-bold">Exclusive</h3>
                        <p className="text-base font-medium">Subscribe</p>
                        <p className="text-sm">Get 10% off of your first order</p>
                        <div className="relative w-52">
                            <div className="flex items-center bg-black border border-gray-600">
                                <input 
                                    type="email" 
                                    placeholder="Enter your email" 
                                    className="w-full px-3 py-1.5 bg-black text-white text-sm focus:outline-none"
                                />
                                <button 
                                    className="px-2 text-white hover:text-gray-300 transition-colors"
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        width="22" 
                                        height="22" 
                                        viewBox="0 0 24 24" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        strokeWidth="2" 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round"
                                    >
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                        <polyline points="12 5 19 12 12 19"></polyline>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Section 2 */}
                    <div className="lg:col-span-2 space-y-3 border-b border-gray-800 pb-4 md:border-b-0">
                        <h3 className="text-base font-medium">Support</h3>
                        <ul className="space-y-2 text-sm text-white">
                            <li>IIT Jodhpur</li>
                            <li>exclusive@gmail.com</li>
                            <li>+91-6969696969</li>
                        </ul>
                    </div>

                    {/* Section 3 */}
                    <div className="lg:col-span-2 space-y-3 border-b border-gray-800 pb-4 md:border-b-0">
                        <h3 className="text-base font-medium">Account</h3>
                        <ul className="space-y-3 text-sm text-white">
                            <li>My Account</li>
                            <li>Login / Register</li>
                            <li>Cart</li>
                            <li>Wishlist</li>
                            <li>Shop</li>
                        </ul>
                    </div>

                    {/* Section 4 */}
                    <div className="lg:col-span-2 space-y-3 border-b border-gray-800 pb-4 md:border-b-0">
                        <h3 className="text-base font-medium">Quick Links</h3>
                        <ul className="space-y-3 text-sm text-white">
                            <li>Privacy Policy</li>
                            <li>Terms Of Use</li>
                            <li>FAQ</li>
                            <li>Contact</li>
                            <li>
                                <Link href="/test-404" className="hover:text-gray-300 transition-colors">
                                    Test 404 Page
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Section 5 - App Download */}
                    <div className="lg:col-span-3 space-y-3">
                        <h3 className="text-base font-medium">Download App</h3>
                        <p className="text-gray-400 text-xs">Save with App: For New Users Only</p>
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                                <Image 
                                    src={QRCode}
                                    alt="QR Code" 
                                    width={90} 
                                    height={90}
                                />
                            </div>
                            <div className="flex flex-col space-y-1.5">
                                <a href="#" className="hover:opacity-80 transition-opacity">
                                    <Image 
                                        src={AppStore} 
                                        alt="Download on App Store" 
                                        width={125} 
                                        height={40}
                                        className="rounded-lg"
                                    />
                                </a>
                                <a href="#" className="hover:opacity-80 transition-opacity">
                                    <Image 
                                        src={GooglePlay}
                                        alt="Get it on Google Play" 
                                        width={125} 
                                        height={40}
                                        className="rounded-lg"
                                    />
                                </a>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <Image 
                                    src={Facebook}
                                    alt="Facebook" 
                                    width={20} 
                                    height={20}
                                />
                            </a>
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <Image 
                                    src={Instagram}
                                    alt="Instagram" 
                                    width={20} 
                                    height={20}
                                />
                            </a>
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <Image 
                                    src={Twitter} 
                                    alt="Twitter" 
                                    width={20} 
                                    height={20}
                                />
                            </a>
                            <a href="#" className="hover:opacity-80 transition-opacity">
                                <Image 
                                    src={Linkedin}
                                    alt="LinkedIn" 
                                    width={20} 
                                    height={20}
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mt-12 pt-6 border-t border-gray-800 w-full">
                <div className="container mx-auto px-4">
                    <p className="text-gray-400 text-xs text-center">
                        © {new Date().getFullYear()} Exclusive. All Rights Reserved.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer;