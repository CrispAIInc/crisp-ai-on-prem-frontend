import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

export default function Chip({ content }) {
    const { theme } = useContext(MainContext);

    return (
        <span className={`px-2 py-1 text-sm font-medium ${theme === 'light' ? 'bg-slate-300 text-textColor-300' : 'bg-background text-textColor-100'} rounded-full select-none`}>{content}</span>
    );
}