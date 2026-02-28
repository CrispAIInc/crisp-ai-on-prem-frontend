import React, { useState } from 'react';
import TimestampPicker from '../TimestampPicker';

const TimeSegmentDescription = ({ start, setStart, end, setEnd, confirmFn }) => {



    return (
        <div className="flex  items-center gap-2">
            <TimestampPicker
                // sourceDuration={Math.ceil(displayedSources.find(s => s.is_checked)?.source_duration || 0)}
                start={start}
                setStart={setStart}
                end={end}
                setEnd={setEnd}
                confirmFn={confirmFn}
                rejectFn={() => { }}
            />
        </div>
    );
};

export default TimeSegmentDescription;