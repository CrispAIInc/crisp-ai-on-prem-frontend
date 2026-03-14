import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';

function TimeSegmentDescriptionList({ setCurrentSegment, setShowList, segmentDescriptions }) {

    const {
        theme,
        knowledgeBase
    } = useContext(MainContext);

    function handleSelectResult(segment) {
        const segmentSource = knowledgeBase.find(item => item.source_path === segment.video);

        if (segmentSource) {
            setCurrentSegment({
                ...segment,
                timestampText: `${segmentSource.source_path} | ${segment.start}`,
                refs: [{
                    ...segmentSource,
                    timestamp: segment.start
                }]
            });
            setShowList(false);
        }
    }

    return (
        <div className="flex flex-col gap-2 overflow-y-auto">
            <BaseHeading text="All segment descriptions" />
            <div className='flex flex-col gap-1'>
                {
                    segmentDescriptions.map(segment => (
                        <p className={`${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} cursor-pointer w-fit hover:font-medium`} onClick={() => handleSelectResult(segment)} key={segment.id}>{segment.query}</p>
                    ))
                }
            </div>
        </div>
    );
}

export default TimeSegmentDescriptionList;