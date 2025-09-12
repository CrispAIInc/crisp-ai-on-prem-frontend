import { useContext, useState } from "react";
import { MainContext } from '../../contexts/mainContext.jsx';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import { IndexModal } from '../IndexModal';

const ButtonDropdown = ({ openSourceExplorer }) => {
    const { theme } = useContext(MainContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isIndexModalOpen, setIsIndexModalOpen] = useState(false);
    // const [existingIndexers] = useState(["Indexer 1", "Indexer 2", "Indexer 3"]); // Example indexers

    const toggleDropdown = () => {
        setIsDropdownOpen((prev) => !prev);
    };

    function openIndexModal() {
        setIsIndexModalOpen(true);
    }

    return (
        <div className="relative inline-block">
            {/* Main Button */}
            <div className={`font-medium flex items-center justify-center ${theme === 'light' ? 'hover:bg-light-hover-100/30 text-textColor-300' : 'hover:bg-light-hover-200/20 text-textColor-100'} gap-2 px-2 py-2 rounded-md cursor-pointer w-fit`} onClick={toggleDropdown}>
                <FolderOpenIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                <button
                    className='flex items-center gap-2'
                >
                    Indexer
                    <svg
                        className={`w-4 h-4 ml-2 transform ${isDropdownOpen ? "rotate-180" : "rotate-0"
                            }`}
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 9l-7 7-7-7"
                        />
                    </svg>
                </button>
            </div>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className={`absolute z-10 w-52 mt-2 rounded-md shadow-lg  ${theme === 'light' ? 'bg-white' : 'bg-[#382746] text-textColor-100'}`}>
                    <button
                        onClick={openIndexModal}
                        className={`block w-full px-4 py-2 text-left rounded-t-md ${theme === 'light' ? 'hover:bg-light-hover-100 text-textColor-300' : 'hover:bg-light-hover-200/20 text-textColor-100'}`}
                    >
                        Create New Index
                    </button>
                    {
                        isIndexModalOpen && <IndexModal show={isIndexModalOpen} onHide={() => setIsIndexModalOpen(false)} />
                    }
                    {/* <div className="border-t"></div> */}
                    <button
                        onClick={openSourceExplorer}
                        className={`block w-full px-4 py-2 text-left rounded-t-md ${theme === 'light' ? 'hover:bg-light-hover-100 text-textColor-300' : 'hover:bg-light-hover-200/20 text-textColor-100'}`}
                    >
                        Choose Existing Index
                    </button>
                </div>
            )}
        </div>
    );
};

export default ButtonDropdown;
