'use client';

import React, { useState } from "react";
import { Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
    placeholder?: string;
}

const SearchInput: React.FC<Props> = ({ placeholder = "Search..." }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };

    return (
        <form onSubmit={handleSearch} className="relative flex-grow max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-10 pr-4 py-2 rounded-full border text-gray-400 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#DB4444]"
            />
        </form>
    );
};

export default SearchInput;
