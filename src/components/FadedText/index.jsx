import React from 'react';

export default function FadedText({ text }) {
    return (
        <div className="relative max-w-[220px] overflow-hidden whitespace-nowrap text-gray-300 text-[20px]">
            {text}

            {/* Right fade shadow */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-10
                      bg-gradient-to-r from-transparent to-[#000000]" />
        </div>
    );
}