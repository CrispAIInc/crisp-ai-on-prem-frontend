import React, { useContext, useEffect, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';
import toast from 'react-simple-toasts';
import TimestampPicker from '../TimestampPicker';
import ToggleSwitch from '../ToggleSwitch';

const SegmentDescription = ({ start, setStart, end, setEnd, canGenerateSegmentDescription, setCanGenerateSegmentDescription, handleGenerate }) => {

    const { displayedSources, theme, displayedSourcesLength } = useContext(MainContext);

    const [isTimestampPickerOpen, setIsTimestampPickerOpen] = useState(false);

    useEffect(() => {
        setIsTimestampPickerOpen(canGenerateSegmentDescription);
    }, [canGenerateSegmentDescription]);

    const confirmFn = () => {
        setIsTimestampPickerOpen(false);
        handleGenerate();
    };

    const rejectFn = (isError, errorMessage) => {
        if (isError) {
            toast(errorMessage, { className: `p-2 rounded-full !bg-red-600 text-white`, theme });
        }
    };

    const handleToggleTimestampPicker = () => {
        if (canGenerateSegmentDescription) {
            setIsTimestampPickerOpen(prev => !prev);
        }
    };

    return (
        <div className={`relative flex flex-col ${displayedSourcesLength !== 1
            ? 'pointer-events-none opacity-50 select-none'
            : 'pointer-events-auto opacity-100 select-all'
            } ml-4`}>
            <div className="relative flex flex-col">
                <div className="flex gap-1">
                    <div className={`flex flex-col select-none ${canGenerateSegmentDescription && `rounded-md cursor-pointer ${theme === 'light' ? 'hover:bg-textColor-100/30' : 'hover:bg-textColor-300'} `}`} onClick={handleToggleTimestampPicker}>
                        <BaseHeading
                            text="Segment description"
                        />
                        <span className={`text-xs ${theme === 'dark' && 'text-textColor-100'}`}>Only one checked source.</span>
                    </div>
                    <ToggleSwitch value={canGenerateSegmentDescription} onChange={val => setCanGenerateSegmentDescription(val)} />
                </div>
                {
                    isTimestampPickerOpen && (
                        <div className="absolute z-10 mt-2 top-full">
                            <TimestampPicker sourceDuration={displayedSources.find(s => s.is_selected)?.source_duration} start={start} setStart={setStart} end={end} setEnd={setEnd} confirmFn={confirmFn} rejectFn={rejectFn} />
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default SegmentDescription;