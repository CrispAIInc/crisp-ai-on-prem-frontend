import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { isRtlLanguage } from '../../utils';

function FaqItem({ item, isBoxed = false, isFirstOpen = false, chosenLanguage }) {

    const [isOpen, setIsOpen] = useState(isFirstOpen);
    const { theme, setCurrentResource, workspaceContainer, setJumpToPage } = useContext(MainContext);


    const toggleFAQ = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div
            className={`
                rounded-lg bg-transparent backdrop-blur-xs p-2 
                ${isBoxed ? (theme === 'dark' ? '!border !border-textColor-300' : '!border !border-textColor-100/50') : ''}
            `}
        >
            <button
                onClick={toggleFAQ}
                className={`flex items-center justify-between  w-full p-2 text-lg font-medium text-left text-gray-700 focus:outline-none ${isRtlLanguage(chosenLanguage) && 'flex-row-reverse'}`}
            >
                <span className={`${theme === 'dark' && 'text-textColor-100'} uppercase text-sm font-bold tracking-widest `}>{item.question}</span>
                <svg
                    className={`w-6 h-6 transform transition-transform ${isOpen ? "rotate-180" : ""
                        } `}
                    fill="none"
                    stroke="#5293FD"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>
            <div
                className={`overflow-hidden select-text transition-all ease-linear duration-500 ${isOpen ? "max-h-[10000000px] p-2 opacity-100" : "max-h-0 opacity-0"
                    } `}
            >
                <div className={` text-gray-600 ${theme === 'dark' && 'text-textColor-100'}`} dangerouslySetInnerHTML={{ __html: item.answer }}></div>

                {/* refs */}
                {item.timestamp ? (
                    <div className="flex items-center gap-1 mt-2 text-sm cursor-pointer text-primary-300 w-fit" onClick={() => {
                        setCurrentResource(prev => ({ ...prev, timestamp: item.timestamp[0] }));
                        workspaceContainer.current.scrollTo({
                            top: 0,
                            behavior: "smooth", // Enables smooth scrolling
                        });
                    }}>
                        <AccessTimeIcon size="small" />
                        <span>{item.timestamp[0]} - {item.timestamp[1]}</span>
                    </div>
                ) : (
                    <div className='flex items-center gap-2 mt-2 mb-0 text-[9px] cursor-pointer font-bold text-primary-300 w-fit' onClick={() => {

                        setJumpToPage({ page: parseInt(item.page) });
                        workspaceContainer.current.scrollTo({
                            top: 0,
                            behavior: "smooth", // Enables smooth scrolling
                        });
                    }}>
                        <MenuBookIcon /> <span className="text-md">{item.page}</span>
                    </div>
                )}
            </div>
        </div>
    );
}

export default FaqItem;