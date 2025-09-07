import { useState, useEffect, useContext } from "react";
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import NightlightRoundOutlinedIcon from '@mui/icons-material/NightlightRoundOutlined';
import { MainContext } from '../../contexts/mainContext.jsx';

export default function ThemeToggle() {
    const { theme, setTheme } = useContext(MainContext);

    // Optional: sync with system preference or local storage
    // useEffect(() => {
    //     if (theme === 'dark') {
    //         document.documentElement.classList.add("dark");
    //     } else {
    //         document.documentElement.classList.remove("dark");
    //     }
    // }, [darkMode]);

    return (
        <button
            onClick={() => setTheme(prev => prev === "dark" ? "light" : "dark")}
            className={`relative flex items-center w-16 h-8 rounded-full transition-colors duration-300 ${theme === "dark" ? "bg-[#222]" : "bg-gray-300"
                }`}
        >
            <div className="flex items-center justify-between w-full h-full px-1">
                <NightlightRoundOutlinedIcon className="w-3.5 h-3.5 text-white" />
                <WbSunnyOutlinedIcon className="w-3.5 h-3.5 bg-transparent text-[#222]" />
            </div>
            {/* Icon */}
            <span
                className={`absolute left-[3px] top-1/2 -translate-y-1/2 py-2 w-6 h-6 flex items-center justify-center rounded-full transition-transform duration-300 ${theme === "dark" ? "translate-x-8 bg-white shadow-[0_2px_4px_rgba(0,0,0,0.3)]" : "translate-x-0 bg-[#333] shadow-[0_2px_4px_rgba(0,0,0,0.3)]"
                    }`}
            >
                {/* {theme === "dark" ? (
                    <NightlightRoundOutlinedIcon className="w-3.5 h-3.5 text-dark" />
                ) : (
                    <WbSunnyOutlinedIcon className="w-3.5 h-3.5 bg-transparent text-yellow-500" />
                )} */}
            </span>

            {/* Invisible placeholder to keep layout */}
            {/* <span className="w-full h-full"></span> */}
        </button>
    );
}
