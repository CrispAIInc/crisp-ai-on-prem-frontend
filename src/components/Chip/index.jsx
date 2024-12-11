import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

export default function Chip({ content }) {
    const { theme } = useContext(MainContext);

    return (
        <span className={`px-2 py-1 bg-background_workspace capitalize text-sm font-medium ${theme === 'light' ? 'border border-slate-500 text-textColor-200' : 'border text-textColor-200 !border-gray-800'} rounded-full select-none`}>{content}</span>
    );
}