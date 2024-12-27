import { useContext, useState } from "react";
import { MainContext } from '../../contexts/mainContext';

const Dropdown = ({ options }) => {

    const { theme } = useContext(MainContext);

    const [selectedOption, setSelectedOption] = useState("HR");
    const [isOpen, setIsOpen] = useState(false);

    const toggleDropdown = () => setIsOpen(!isOpen);

    const handleOptionClick = (option) => {
        setSelectedOption(option.label);
        setIsOpen(false);
    };

    return (
        <div className="relative w-64">
            <button
                onClick={toggleDropdown}
                className={`w-full px-4 py-2 text-left  rounded-md shadow-sm focus:!outline-none ${theme === 'light' ? 'hover:bg-light-hover-100 !border bg-white' : 'hover:bg-background_workspace !border !border-slate-500 bg-textColor-300'}`}
            >
                {selectedOption}
                <span className="float-right">▾</span>
            </button>

            {isOpen && (
                <ul className={`absolute z-10 pl-0 w-full mt-1 rounded-md shadow-lg ${theme === 'light' ? 'bg-white !border' : 'bg-textColor-300 !border !border-slate-500 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300'}`}>
                    {options.map((option) => (
                        <li
                            key={option.label}
                            onClick={() => handleOptionClick(option)}
                            className="px-4 py-2 cursor-pointer hover:bg-primary-100/20"
                        >
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.details}</div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default Dropdown;
