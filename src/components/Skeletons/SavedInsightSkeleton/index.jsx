import HeadingSkeleton from '../Base/HeadingSkeleton';
import TextSkeleton from '../Base/TextSkeleton';
import { useContext } from 'react';
import { ThemeContext } from '../../../contexts/themeContext.js';

function SavedInsightSkeleton({ className }) {
    const { theme } = useContext(ThemeContext);
    return (
        <div className={`p-2 ${theme === 'light' ? 'bg-white' : 'bg-background_workspace'} rounded-md shadow-[0_0px_8px_0px_rgba(0,0,0,0.15)] max-w-full animate-pulse ${className}`}>
            <HeadingSkeleton className="mb-2" />
            <TextSkeleton className="mb-1" />
            <TextSkeleton className="mb-1" />
        </div>
    );
}

export default SavedInsightSkeleton;