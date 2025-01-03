import { useContext, useEffect, useRef, useState } from "react";
import Chip from "../Chip";
import { MainContext } from '../../contexts/mainContext';

const options = [
    { id: "summary", name: "Summary", description: "Generate a concise video overview" },
    { id: "highlights", name: "Highlights", description: "Capture key moments from the video" },
    { id: "chapters", name: "Chapters", description: "Divide video into meaningful sections" },
    { id: "faqs", name: "FAQs", description: "Frequently asked questions" },
    { id: "keywords", name: "Keywords", description: "Extract important terms from the video" },
    { id: "knowledgeGraph", name: "Knowledge graph", description: "Visualize key concepts and relationships" },
    { id: "embeddings", name: "Embeddings", description: "Create vector representations for search" },
];

export default function MetadataOptions({ classNames = "" }) {
    const { theme } = useContext(MainContext);
    const [selectedOptions, setSelectedOptions] = useState([options[0]]);
    const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(true);
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

    return (
        <div>
            <label className={`font-semibold mb-2 ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>Select Metadata output</label>
            <div className="relative inline-block w-full" ref={dropdownRef}>
                {/* upper section */}
                <div onClick={handleOpenDropdownMenu} className={`rounded-md flex items-center justify-between h-10 py-4 pl-1 !border !border-slate-400 cursor-pointer relative`}>
                    {/* <div className="absolute inset-y-0 left-0 w-8 pointer-events-none z-3 bg-gradient-to-r from-white to-transparent"></div> */}
                    <div className="relative flex items-center flex-1 gap-1 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                        {
                            selectedOptions.length === 0 && <p className="text-slate-400">Select metadata options</p>
                        }
                        {
                            selectedOptions.map((option) => <Chip key={option.id} content={option.name} />)
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
                        <div className={`absolute z-10 w-full h-64 overflow-y-auto mt-2 rounded-md shadow-lg  ${theme === 'light' ? 'bg-white' : 'bg-[#382746] text-textColor-100'}`}>
                            {
                                options.map((option) => {
                                    return (
                                        <div key={option.id} onClick={() => toggleOption(option)} className={`cursor-pointer border-b border-b-light-hover-200 p-2 ${selectedOptions.includes(option) && 'bg-primary-200/20'} active:bg-primary-200/20 ${theme === 'light' ? 'hover:bg-light-hover-200/35' : 'hover:bg-light-hover-200/20 !border-b !border-b-slate-600'}`}>
                                            <p className='font-semibold text-md'>{option.name}</p>
                                            <span className="text-sm">{option.description}</span>
                                        </div>
                                    );
                                })
                            }
                        </div>
                    )
                }
            </div>
        </div>
    );
}