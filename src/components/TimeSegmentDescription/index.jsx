import React from 'react';
import TimestampPicker from '../TimestampPicker';
import RippleButton from '../RippleButton';

const TimeSegmentDescription = ({ start, setStart, end, setEnd, confirmFn, rejectFn, mode = "description" }) => {
    return (
        <div className="flex  items-center gap-2">
            <TimestampPicker
                // fromCrispWiz={false}
                // sourceDuration={Math.ceil(displayedSources.find(s => s.is_checked)?.source_duration || 0)}
                start={start}
                setStart={setStart}
                end={end}
                setEnd={setEnd}
                confirmFn={confirmFn}
                rejectFn={rejectFn}
            />
        </div>
    );
};

export default TimeSegmentDescription;