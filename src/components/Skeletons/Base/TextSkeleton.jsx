import { useContext } from 'react';
import { MainContext } from '../../../contexts/mainContext.jsx';

function TextSkeleton({ className }) {
    const { theme } = useContext(MainContext);
    return (
        <div className={`${theme === 'light' ? 'bg-slate-300' : 'bg-textColor-300'} w-full h-2 rounded-sm ${className}`}></div>
    );
}

export default TextSkeleton;