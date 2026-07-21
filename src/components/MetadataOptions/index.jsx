import { useContext, useEffect, useRef, useState } from "react";
import Chip from "../Chip";
import { MainContext } from '../../contexts/mainContext.jsx';



export default function MetadataOptions({ selectedOptions, setSelectedOptions, options }) {
    const { theme } = useContext(MainContext);

    const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close the dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsDropdownMenuOpen(false);
            }
        };

        // Add event listener
        document.addEventListener("mousedown", handleClickOutside);

        // Cleanup event listener
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleOption = (item) => {
        setSelectedOptions((prev) =>
            prev.find(p => p.id === item.id)
                ? prev.filter((option) => option.id !== item.id)
                : [...prev, item]
        );
    };

    function handleOpenDropdownMenu() {
        setIsDropdownMenuOpen(!isDropdownMenuOpen);
    }

    function toggleAllOptions() {
        if (selectedOptions.length === options.length) {
            setSelectedOptions([]);
        } else {
            setSelectedOptions(options.filter(option => option.id !== 'knowledgeGraph'));
        }
    }

    return (
        <div className='relative z-30'>
            <label className={`font-semibold mb-2 ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>Metadata output</label>
            <div className="relative inline-block w-full" ref={dropdownRef}>
                {/* upper section */}
                <div onClick={handleOpenDropdownMenu} className={`rounded-xl flex items-center justify-between h-10 py-4 pl-1 ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200/50'} cursor-pointer relative`}>
                    {/* <div className="absolute inset-y-0 left-0 w-8 pointer-events-none z-3 bg-gradient-to-r from-white to-transparent"></div> */}
                    <div className="relative flex items-center flex-1 gap-1 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                        {
                            selectedOptions.length === 0 && <p className="text-slate-400">Select metadata options</p>
                        }
                        {
                            selectedOptions.map((option) => <Chip cssClasses={`rounded-xl ${theme === "light" ? 'bg-white' : 'bg-[radial-gradient(circle_at_20%_20%,rgba(171,95,199,0.10),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(119,83,237,0.08),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.06),transparent_50%)] !border-none'}`} key={option.id} content={option.name} />)
                        }
                    </div>
                    {/* <div className="absolute inset-y-0 right-0 w-8 pointer-events-none z-3 bg-gradient-to-l from-white to-transparent"></div> */}
                    <svg
                        className={`w-4 mx-2 transform ${isDropdownMenuOpen ? "rotate-180" : "rotate-0"
                            }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke={`${theme === 'light' ? 'currentColor' : 'white'}`}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </div>
                {/* dropdown menu */}
                {
                    isDropdownMenuOpen && (
                        <div className={`absolute z-10 w-full h-64 flex flex-col overflow-y-hidden mt-2 rounded-md shadow-lg  ${theme === 'light' ? 'bg-white' : 'bg-[#382746] text-textColor-100'}`}>
                            <div onClick={toggleAllOptions} className={`cursor-pointer border-b border-b-light-hover-200 p-2 active:bg-primary-200/20 ${theme === 'light' ? 'hover:bg-light-hover-200/35' : 'hover:bg-light-hover-200/20 !border-b !border-b-slate-600'} flex items-center gap-2`}>
                                {/* checkbox for selecting and unselecting all options */}
                                <input type="checkbox" className='cursor-pointer w-fit' checked={selectedOptions.length === options.length} />
                                <span className="text-sm font-bold select-none">Select all metadata</span>
                            </div>
                            <div className={`overflow-y-auto *:[&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700]'}`}>
                                {
                                    options.map((option) => {
                                        if (option.id === 'knowledgeGraph') {
                                            return (
                                                <div key={option.id} className={`cursor-not-allowed border-b border-b-light-hover-200 p-2 bg-light-hover-200 ${theme === 'light' && 'opacity-50 text-gray-500 bg-gray-200'}`}>
                                                    <p className='font-semibold text-md'>{option.name}</p>
                                                    <span className="text-sm">{option.description}</span>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={option.id} onClick={() => toggleOption(option)} className={`cursor-pointer border-b border-b-light-hover-200 p-2 ${selectedOptions.includes(option) && 'bg-primary-200/20'} active:bg-primary-200/20 ${theme === 'light' ? 'hover:bg-textColor-100/25' : 'hover:bg-light-hover-200/10 !border-b !border-b-slate-600'}`}>
                                                <p className='font-semibold select-none text-md'>{option.name}</p>
                                                <span className="text-sm select-none">{option.description}</span>
                                            </div>
                                        );
                                    })
                                }
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
}