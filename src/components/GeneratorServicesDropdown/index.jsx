import { useState, useRef, useEffect, useContext } from "react";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';

export default function GeneratorServicesDropdown({
    tabs,
    defaultTab = "genMedia",
    onChange,
}) {

    const { theme } = useContext(MainContext);

    const [isOpen, setIsOpen] = useState(false);
    const [active, setActive] = useState(tabs.find(tab => tab.id === defaultTab)?.title || tabs[0]?.title);
    const dropdownRef = useRef(null);

    const handleSelect = (id) => {
        setActive(tabs.find(tab => tab.id === id)?.title || tabs[0]?.title);
        setIsOpen(false);
        if (onChange) onChange(id);
    };

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <BaseHeading text='Panel sections' />
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-2 rounded-lg ${theme === "dark" ? "!border !border-textColor-200/60 rounded-md text-textColor-100" : '!border !border-textColor-100 text-textColor-300'}`}
            >
                <span className="font-medium">{active}</span>
                <PlayArrowIcon
                    className={`w-4 h-4 transition-transform ${isOpen ? "-rotate-90" : "rotate-90"
                        }`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className={`absolute mt-2 w-full ${theme === 'light' ? 'bg-white !border !border-textColor-100 text-textColor-300' : 'bg-[#382746] text-textColor-100 !border !border-textColor-200/60'} rounded-xl shadow-lg z-50 overflow-hidden`}>
                    {tabs.map(({ id, title }) => (
                        <button
                            key={id}
                            onClick={() => handleSelect(id)}
                            className={`w-full text-left px-4 py-2 text-sm transition ${active === title
                                ? "bg-gradient-to-r from-purple-200 to-pink-200 text-textColor-200 font-medium"
                                : theme === 'light' ? "hover:bg-gray-50" : "hover:bg-[#4c3758]"
                                }`}
                        >
                            {active === title ? "✓ " : ""}
                            {title}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
