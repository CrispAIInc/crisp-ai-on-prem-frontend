import React from 'react';

function TimeSegmentDescriptionList({ timeSegmentDescriptions }) {
    return (
        <div className="flex flex-col overflow-y-auto">
            {
                timeSegmentDescriptions.map(item => (
                    <p key={item.description}>{item.start}</p>
                ))
            }
        </div>
    );
}

export default TimeSegmentDescriptionList;