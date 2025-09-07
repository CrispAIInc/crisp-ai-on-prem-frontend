import { useContext, useEffect, useRef, useState } from "react";
import { MainContext } from '../../contexts/mainContext.jsx';



export default function SelectedSourcesDropdown({ selectedOptions, setSelectedOptions, options }) {
    const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
    const { theme, knowledgeBase } = useContext(MainContext);

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
            prev.find(p => p?.source_path === item?.source_path)
                ? []
                : [item]
        );
        setIsDropdownMenuOpen(false);
    };

    function handleOpenDropdownMenu() {
        // if (options.length > 0)
        setIsDropdownMenuOpen(!isDropdownMenuOpen);
    }

    // function toggleAllOptions() {
    //     if (selectedOptions.length === options.length) {
    //         setSelectedOptions([]);
    //     } else {
    //         setSelectedOptions(options);
    //     }
    // }

    return (
        <div className="relative z-20">
            <label className={`font-semibold ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>source to use
                {/* <span className="text-xs"> (min. 1 source)</span> */}
            </label>
            <div className="relative inline-block w-full" ref={dropdownRef}>
                {/* upper section */}
                <div onClick={handleOpenDropdownMenu} className={`rounded-md flex items-center justify-between h-10 py-4 pl-1 !border !border-slate-400 cursor-pointer relative`}>
                    {/* <div className="absolute inset-y-0 left-0 w-8 pointer-events-none z-3 bg-gradient-to-r from-white to-transparent"></div> */}
                    <div className="relative flex items-center flex-1 gap-1 overflow-x-auto" style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>
                        {
                            selectedOptions.length === 0 && <p className="text-slate-400">Select a source</p>
                        }
                        {
                            selectedOptions.map((option) => <div key={option?.source_path} className='flex items-center gap-2'>
                                <img className="w-10 h-10 rounded-md" src={`${API_ENDPOINT}/${option?.file_type === 'video' ? 'thumbnails' : option?.file_type === 'pdf' ? 'pdf-thumbnails' : 'img-thumbnails'}/${encodeURIComponent(option?.category[0])}/${encodeURIComponent(option?.thumbnail)}`}
                                    alt="Video Thumbnail" />
                                <span className={`text-sm truncate ${theme === 'dark' && 'text-textColor-100'}`}>{option.source_path}</span>
                            </div>)
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
                                knowledgeBase?.length > 0 ? (
                                    <>
                                        {/* <div onClick={toggleAllOptions} className={`cursor-pointer border-b border-b-light-hover-200 p-2 active:bg-primary-200/20 ${theme === 'light' ? 'hover:bg-light-hover-200/35' : 'hover:bg-light-hover-200/20 !border-b !border-b-slate-600'} flex items-center gap-2`}>
                                            <input type="checkbox" className='cursor-pointer w-fit' checked={selectedOptions.length === options.length} />
                                            <span className="text-sm font-bold select-none">Select all sources</span>
                                        </div> */}
                                        {
                                            options.map((option) => {
                                                return (
                                                    <div key={option.source_path} onClick={() => toggleOption(option)} className={`cursor-pointer border-b border-b-light-hover-200 p-2 ${selectedOptions.includes(option) && 'bg-primary-200/20'} active:bg-primary-200/20 ${theme === 'light' ? 'hover:bg-light-hover-200/35' : 'hover:bg-light-hover-200/20 !border-b !border-b-slate-600'} flex items-center gap-2`}>
                                                        <img className="w-10 h-10 rounded-md" src={`${API_ENDPOINT}/${option.file_type === 'video' ? 'thumbnails' : option.file_type === 'pdf' ? 'pdf-thumbnails' : 'img-thumbnails'}/${encodeURIComponent(option.category[0])}/${encodeURIComponent(option.thumbnail)}`}
                                                            alt="Video Thumbnail" />
                                                        <span className="text-sm truncate select-none">{option.source_path}</span>
                                                    </div>
                                                );
                                            })
                                        }
                                    </>
                                ) : (
                                    <div className="p-2">
                                        <p className="text-sm text-center text-slate-400">No source available</p>
                                    </div>
                                )
                            }
                        </div>
                    )
                }
            </div>
            {/* <label className={`text-xs mb-2 ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>{selectedOptions.length} source(s) selected</label> */}
        </div>
    );
}