import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

export default function FadedText({ text }) {
    const { theme } = useContext(MainContext);
    return (
        <div className={`relative min-w-fit max-w-[220px] overflow-hidden whitespace-nowrap p-1 text-[13px] ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>
            {text}

            {/* Right fade shadow */}
            <div className={`pointer-events-none absolute right-0 top-0 h-full w-16
                      bg-gradient-to-r from-transparent to-background_workspace`} />
        </div>
    );
}