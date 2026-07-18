import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';

import './Chip.css';

export default function Chip({ content, handleClick = () => null, wordWrap = false, cssClasses = "", isActive = false }) {
    const { theme } = useContext(MainContext);
    return (
        <span onClick={handleClick} title={typeof (content) === "string" ? content : ""} className={`chip px-2 py-1 whitespace-nowrap w-fit bg-background_workspace capitalize text-sm font-medium ${theme === 'light' ? '!border !border-textColor-100/50 text-textColor-200' : '!border text-textColor-100 !border-gray-800 '} ${isActive ? 'bg-primary-200 text-white !border-none' : ''} rounded-full select-none ${cssClasses}`} style={{ overflowWrap: wordWrap ? 'anywhere' : '' }}>{content}</span>
    );
}