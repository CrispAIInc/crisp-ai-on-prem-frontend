import { useContext } from 'react';
import { ThemeContext } from '../../../contexts/themeContext.js';

function ChipSkeleton({ className }) {
    const { theme } = useContext(ThemeContext);
    return (
        <div className={`${theme === 'light' ? 'bg-textColor-100' : 'bg-textColor-300'} w-12 h-6 rounded-full ${className}`}></div>
    );
}

export default ChipSkeleton;