import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

export default function FadedText({ text, handleClick = () => { }, twClasses = "" }) {
    const { theme } = useContext(MainContext);
    return (
        <div title={text} onClick={handleClick} className={`relative cursor-pointer min-w-fit max-w-fit overflow-hidden whitespace-nowrap p-1 text-[13px] ${theme === "light" ? "text-textColor-300" : "text-textColor-100 hover:bg-background_workspace"} select-none rounded-full ${twClasses}`}>
            {text}

            {/* Right fade shadow */}
            <div className={`pointer-events-none absolute right-0 top-0 h-full w-16
                      bg-gradient-to-r from-transparent ${theme === 'light' ? 'to-background_workspace' : ''}`} />
        </div>
    );
}