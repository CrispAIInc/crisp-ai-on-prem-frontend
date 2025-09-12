import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';

export default function Chip({ content, onClick = () => null, cssClasses = "" }) {
    const { theme } = useContext(MainContext);
    return (
        <span onClick={onClick} className={`px-2 py-1 whitespace-nowrap w-fit bg-background_workspace capitalize text-sm font-medium ${theme === 'light' ? 'border border-slate-500 text-textColor-200' : '!border text-textColor-100 !border-gray-800 bg-textColor-300'} rounded-full select-none ${cssClasses}`}>{content}</span>
    );
}