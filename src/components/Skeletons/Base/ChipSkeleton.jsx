import { useContext } from 'react';
import { MainContext } from '../../../contexts/mainContext.js';

function ChipSkeleton({ className }) {
    const { theme } = useContext(MainContext);
    return (
        <div className={`${theme === 'light' ? 'bg-slate-300' : 'bg-textColor-300'} w-12 h-6 rounded-full ${className}`}></div>
    );
}

export default ChipSkeleton;