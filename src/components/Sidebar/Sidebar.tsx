import React from 'react';
import Link from 'next/link';


const categories = [
    { name: 'Electronics', href: '/category/electronics' },
    { name: 'Clothing', href: '/category/clothing' },
    { name: 'Books', href: '/category/books' },
    { name: 'Home & Kitchen', href: '/category/home-kitchen' },
    { name: 'Beauty', href: '/category/beauty' },
    { name: 'Sports', href: '/category/sports' },
    { name: 'Toys', href: '/category/toys' },
    { name: 'Jewelry', href: '/category/jewelry' },
];

const Sidebar: React.FC = () => {
    return (
        <div className="flex">
            <div className="w-90 h-117 py-6 px-4 border-r border-gray-200">
                <nav className="space-y-2 pl-36">
                    {categories.map((category, index) => (
                        <React.Fragment key={category.name}>
                            <Link
                                href={category.href}
                                className={`block py-2 px-3 text-gray-600 hover:text-red-400 transition-colors duration-300`}
                            >
                                {category.name}
                            </Link>
                            {index < categories.length - 1 && (
                                <div className="h-px bg-gray-200 w-40"></div>
                            )}
                        </React.Fragment>
                    ))}
                </nav>
            </div>
            <div className="flex-1">
                {/* Main content will go here */}
            </div>
        </div>
    );
};

export default Sidebar;
