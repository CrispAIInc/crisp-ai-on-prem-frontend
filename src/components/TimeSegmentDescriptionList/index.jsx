import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

function TimeSegmentDescriptionList({ setCurrentSegment, setShowList, segmentDescriptions }) {

    const {
        knowledgeBase
    } = useContext(MainContext);

    function handleSelectResult(segment) {
        const segmentSource = knowledgeBase.find(item => item.source_id === segment.source_id);

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
        <div className="flex flex-col overflow-y-auto">
            {
                segmentDescriptions.map(segment => (
                    <p onClick={() => handleSelectResult(segment)} key={segment.id}>{segment.title}</p>
                ))
            }
        </div>
    );
}

export default TimeSegmentDescriptionList;