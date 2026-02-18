import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

const SERVICES = [
    "Cataloging",
    "Insights & Stories",
    "Reels",
    "Composer",
];

export default function GeneratorServicesDropdown({
    defaultTab = "genMedia",
    onChange,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [active, setActive] = useState(defaultTab);
    const dropdownRef = useRef(null);

    const handleSelect = (item) => {
        setActive(item);
        setIsOpen(false);
        if (onChange) onChange(item);
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
            {/* Trigger */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition"
            >
                <span className="font-medium text-gray-700">{active}</span>
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""
                        }`}
                />
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
                    {SERVICES.map((item) => (
                        <button
                            key={item}
                            onClick={() => handleSelect(item)}
                            className={`w-full text-left px-4 py-2 text-sm transition ${active === item
                                ? "bg-gradient-to-r from-purple-200 to-pink-200 font-medium"
                                : "hover:bg-gray-50"
                                }`}
                        >
                            {active === item ? "✓ " : ""}
                            {item}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
