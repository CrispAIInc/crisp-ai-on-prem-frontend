import HeadingSkeleton from '../Base/HeadingSkeleton.jsx';
import TextSkeleton from '../Base/TextSkeleton.jsx';
import { useContext } from 'react';
import { MainContext } from '../../../contexts/mainContext.jsx';

function SavedInsightSkeleton({ className }) {
    const { theme } = useContext(MainContext);
    return (
        <div className={`p-2 ${theme === 'light' ? 'bg-white' : 'bg-background_workspace'} rounded-md shadow-[0_0px_8px_0px_rgba(0,0,0,0.15)] w-[80px] h-[100px] animate-pulse ${className}`}>
            <HeadingSkeleton className="mb-2" />
            {
                new Array(6).fill().map((_, index) => (
                    <TextSkeleton key={index} className="mb-1" />
                ))
            }
        </div>
    );
}

export default SavedInsightSkeleton;