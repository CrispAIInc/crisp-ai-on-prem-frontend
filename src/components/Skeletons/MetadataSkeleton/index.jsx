import HeadingSkeleton from '../Base/HeadingSkeleton';
import TextSkeleton from '../Base/TextSkeleton';

function MetadataSkeleton({ className, numOfLines = 10, numOfOccurences = 3, showHeading = true }) {
    return (
        <div className={`flex flex-col gap-4 animate-pulse ${className}`}>
            {
                new Array(numOfOccurences).fill(null).map(item => (
                    <div key={item}>
                        {showHeading && <HeadingSkeleton className='!w-36 h-6 mb-3' />}
                        {
                            new Array(numOfLines).fill(null).map((_, index) => (
                                <TextSkeleton key={index} className='h-3 mb-2' />
                            ))
                        }
                    </div>
                ))
            }
        </div>
    );
}

export default MetadataSkeleton;