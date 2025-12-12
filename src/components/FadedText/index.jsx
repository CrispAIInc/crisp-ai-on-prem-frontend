import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

export default function FadedText({ text }) {
    const { theme } = useContext(MainContext);
    return (
        <div className={`relative max-w-[220px] overflow-hidden whitespace-nowrap p-1 text-[13px] ${theme === "white" ? "text-textColor-300" : "text-textColor-100"}`}>
            {text}

            {/* Right fade shadow */}
            <div className={`pointer-events-none absolute right-0 top-0 h-full w-10
                      bg-gradient-to-r from-transparent to-background_workspace`} />
        </div>
    );
}