import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';
import { isRtlLanguage } from '../../utils';
// import useCheckMobileScreen from '../../hooks/useCheckMobileScreen';

function Accordion({ heading, children, isBoxed = false, isFirstOpen = false, chosenLanguage = "en", fromReelProps = false }) {
    const [isOpen, setIsOpen] = useState(isFirstOpen);
    const { theme } = useContext(MainContext);
    // const isMobile = useCheckMobileScreen();
    const toggleFAQ = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div
            className={`${isBoxed && '!border !border-gray-200'}  rounded-lg  bg-transparent backdrop-blur-xs p-2 ${fromReelProps && 'overflow-y-hidden flex flex-col'}`}
        >
            <button
                onClick={toggleFAQ}
                className={`flex items-center justify-between  w-full p-2 text-lg font-medium text-left text-gray-700 focus:outline-none ${isRtlLanguage(chosenLanguage) && 'flex-row-reverse'}`}
            >
                <span className={`${theme === 'dark' && 'text-textColor-100'} uppercase text-sm font-bold tracking-widest `}>{heading}</span>
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
                className={`overflow-hidden select-text transition-all ease-linear duration-500 ${isOpen ? "max-h-[10000000px] p-2 mb-3 opacity-100" : "max-h-0 opacity-0"
                    } ${fromReelProps && "overflow-y-auto h-full max-h-full flex-1"}`}
            >
                {children}
            </div>
        </div>
    );
}

export default Accordion;