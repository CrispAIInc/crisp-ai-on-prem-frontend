import { useContext } from 'react';
import { ThemeContext } from '../../../contexts/themeContext.js';

function TextSkeleton({ className }) {
    const { theme } = useContext(ThemeContext);
    return (
        <div className={`${theme === 'light' ? 'bg-textColor-100' : 'bg-textColor-300'} w-full h-2 rounded-sm ${className}`}></div>
    );
}

export default TextSkeleton;