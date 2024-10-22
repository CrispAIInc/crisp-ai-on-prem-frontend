import HeadingSkeleton from '../Base/HeadingSkeleton';
import TextSkeleton from '../Base/TextSkeleton';
import ChipSkeleton from '../Base/ChipSkeleton';
import { useContext } from 'react';
import { ThemeContext } from '../../../contexts/themeContext.js';

function SavedNoteSkeleton({ className }) {
    const { theme } = useContext(ThemeContext);
    return (
        <div className={`p-1 rounded-lg w-24 h-24 relative transform shadow-[rgba(0,0,15,0.5)_0px_8px_19px_-10px] flex flex-col ${theme === 'light' ? 'bg-white' : 'bg-background_workspace'} animate-pulse ${className}`} style={{
            transform: `rotate(${Math.random() * 6 - 3}deg)`, // Random slight rotation between -3 and 3 degrees
        }}>
            <HeadingSkeleton className="mb-2" />
            <TextSkeleton className="mb-1" />
            <TextSkeleton className="mb-1" />
            <TextSkeleton className="mb-1" />
            <div className="mt-3 flex gap-1">
                <ChipSkeleton />
                <ChipSkeleton />
            </div>
        </div>
    );
}

export default SavedNoteSkeleton;