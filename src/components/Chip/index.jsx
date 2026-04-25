import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';

import './Chip.css';

export default function Chip({ content, onClick = () => null, wordWrap = false, cssClasses = "" }) {
    const { theme } = useContext(MainContext);
    return (
        <span onClick={onClick} title={typeof (content) === "string" ? content : ""} className={`chip px-2 py-1 whitespace-nowrap w-fit bg-background_workspace capitalize text-sm font-medium ${theme === 'light' ? 'border border-slate-500 text-textColor-200' : '!border text-textColor-100 !border-gray-800 bg-textColor-300'} rounded-full select-none ${cssClasses}`} style={{ overflowWrap: wordWrap ? 'anywhere' : '' }}>{content}</span>
    );
}