import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';
import CloseIcon from '@mui/icons-material/Close';

import './Chip.css';
import LoadingSpinner from '../LoadingSpinner/index.jsx';

export default function Chip({ content, handleClick = () => null, wordWrap = false, cssClasses = "", isActive = false, hasX = false, handleXClicked = () => null, isPending = false }) {
    const { theme } = useContext(MainContext);
    return (
        <span onClick={handleClick} title={typeof (content) === "string" ? content : ""} className={`relative chip px-2 py-1 whitespace-nowrap w-fit bg-background_workspace capitalize text-sm font-medium ${theme === 'light' ? '!border !border-textColor-100/50 text-textColor-200' : '!border text-textColor-100 !border-gray-800 '} ${isActive ? 'bg-primary-200 text-white !border-none' : ''} rounded-full select-none ${cssClasses} ${hasX ? 'flex items-center gap-2' : ''}`} style={{ overflowWrap: wordWrap ? 'anywhere' : '' }}>
            {/* <span className="text-sm"> */}
            {content}
            {/* </span> */}

            {
                hasX && (
                    isPending ? (
                        <LoadingSpinner isSmall />
                    ) : (
                        <CloseIcon
                            className={`!text-sm text-primary-300 w-5 h-5 rounded-full ${theme === 'light' && 'bg-primary-100/50'}`}
                            onClick={(e) => {
                                e.stopPropagation();
                                handleXClicked(e);
                            }}
                        />
                    )
                )
            }
        </span>
    );
}