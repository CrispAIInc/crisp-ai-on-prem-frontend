import { useContext } from 'react';
import { MainContext } from '../../../contexts/mainContext.jsx';

function ChipSkeleton({ className }) {
    const { theme } = useContext(MainContext);
    return (
        <div className={`${theme === 'light' ? 'bg-slate-300' : 'bg-textColor-300'} w-10 h-4 rounded-full ${className}`}></div>
    );
}

export default ChipSkeleton;