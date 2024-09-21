import HeadingSkeleton from '../Base/HeadingSkeleton';
import TextSkeleton from '../Base/TextSkeleton';

function MetadataSkeleton({ className }) {
    return (
        <div className={`flex flex-col gap-4 animate-pulse ${className}`}>
            {
                [1, 2, 4].map(item => (
                    <div key={item}>
                        <HeadingSkeleton className='!w-36 h-6 mb-3' />
                        {
                            new Array(10).fill(null).map((_, index) => (
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