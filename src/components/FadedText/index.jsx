import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

export default function FadedText({ text }) {
    const { theme } = useContext(MainContext);
    return (
        <div className={`relative cursor-pointer min-w-fit max-w-[220px] overflow-hidden whitespace-nowrap p-1 text-[13px] ${theme === "light" ? "text-textColor-300" : "text-textColor-100 hover:bg-background_workspace"} rounded-full`}>
            {text}

            {/* Right fade shadow */}
            <div className={`pointer-events-none absolute right-0 top-0 h-full w-16
                      bg-gradient-to-r from-transparent ${theme === 'light' ? 'to-background_workspace' : ''}`} />
        </div>
    );
}