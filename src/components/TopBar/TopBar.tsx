import React from "react";

const TopBar: React.FC = () => {
    return (
        <div className={`bg-gradient-to-r from-gray-900 to-black text-white py-2.5 px-4 justify-between flex items-center transition-all duration-300`}>
            <div className={`text-center md:text-center flex-1 text-sm font-medium tracking-wide transition-all duration-300`}>
                <span className="text-yellow-400 font-bold">🔥</span> Summer Sale For All Swim Suits And Free Express Delivery – OFF 50%!{' '}
                <a 
                    href="/" 
                    className={`underline font-semibold ml-1 hover:text-yellow-400 transition-colors duration-200`}
                >
                    Shop Now
                </a>
            </div>
            <div className="ml-4 transition-all duration-300">
                <select 
                    className={`bg-black text-white-900 text-xs rounded-md px-2 py-1 font-medium outline-none hover:ring-2 hover:ring-white cursor-pointer transition-all duration-200`}
                >
                    <option>English</option>
                    <option>Español</option>
                    <option>हिन्दी</option>
                </select>
            </div>
        </div>
    )
}

export default TopBar;