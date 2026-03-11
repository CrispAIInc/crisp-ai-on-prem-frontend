import React, { useContext, useEffect, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';
import toast from 'react-simple-toasts';
import TimestampPicker from '../TimestampPicker';
import ToggleSwitch from '../ToggleSwitch';
import { useToast } from '../../contexts/toastContext';

const SegmentDescription = ({ start, setStart, end, setEnd, handleGenerate, isPending }) => {

    const {
        displayedSources,
        theme,
        checkedSourcesCount,
        checkedSources
    } = useContext(MainContext);

    const { notify } = useToast();

    const [isTimestampPickerOpen, setIsTimestampPickerOpen] = useState(false);

    const canGenerate = checkedSources.filter(item => item.file_type === "video").length === 1;

    useEffect(() => {
        setIsTimestampPickerOpen(canGenerate);
    }, [canGenerate]);

    const confirmFn = () => {
        setIsTimestampPickerOpen(false);
        handleGenerate();
    };

    const rejectFn = (isError, errorMessage) => {
        if (isError) {
            notify({
                variant: "error",
                heading: "Timestamps invalid!",
                subheading: "Your timestamp range is invalid.",
            });
        }
    };

    const handleToggleTimestampPicker = () => {
        if (canGenerate) {
            setIsTimestampPickerOpen(prev => !prev);
        }
    };

    return (
        <div className={`relative flex flex-col ${!canGenerate
            ? 'pointer-events-none opacity-50 select-none'
            : 'pointer-events-auto opacity-100 select-all'
            }            
            `}>
            <div className="relative flex flex-col">
                <BaseHeading
                    text="Only one checked source (video)"
                />
                <TimestampPicker
                    // sourceDuration={Math.ceil(displayedSources.find(s => s.is_checked)?.source_duration || 0)}
                    start={start}
                    setStart={setStart}
                    end={end}
                    setEnd={setEnd}
                    confirmFn={confirmFn}
                    rejectFn={rejectFn}
                    isPending={isPending}
                />
                {/* <div className="flex items-center gap-1">
                    <div className={`flex flex-col select-none ${canGenerate && `cursor-pointer `}`} onClick={handleToggleTimestampPicker}>
                        <BaseHeading
                            text="Segment description"
                        />
                        <span className={`text-xs ${theme === 'dark' && 'text-textColor-100'}`}>Only one checked source.</span>
                    </div>
                    <svg
                        className={`w-4 h-4 ${theme === 'light' ? 'text-gray-800' : 'text-white/80'} transition-transform ${isTimestampPickerOpen && "rotate-180"
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <ToggleSwitch value={canGenerateSegmentDescription} onChange={val => setCanGenerateSegmentDescription(val)} />
                </div>
                {
                    isTimestampPickerOpen && (
                        <div className="absolute z-10 mt-2 top-full">
                            <TimestampPicker sourceDuration={Math.ceil(displayedSources.find(s => s.is_checked)?.source_duration || 0)} start={start} setStart={setStart} end={end} setEnd={setEnd} confirmFn={confirmFn} rejectFn={rejectFn} />
                        </div>
                    )
                } */}
            </div>
        </div>
    );
};

export default SegmentDescription;