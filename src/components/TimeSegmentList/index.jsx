import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import {
    Layers
} from "lucide-react";

function TimeSegmentList() {

    const {
        segmentDescriptions,
        currentSegment,
        setCurrentSegment
    } = useContext(MainContext);

    return (
        <div className={`h-full min-h-0 flex overflow-hidden`}>
            {/* Left column — list */}
            <div className="w-[280px] shrink-0 border-r border-border h-full min-h-0 overflow-y-auto p-3 flex flex-col gap-2">
                {segmentDescriptions.length === 0 ? (
                    <p className="text-center text-[12.5px] font-semibold text-ink-secondary py-8">No segments found</p>
                ) : (
                    segmentDescriptions.map((segment) => {
                        return (
                            <SegmentListItem
                                key={segment.id}
                                segment={segment}
                                active={segment.id === currentSegment?.id}
                                onClick={() => setCurrentSegment(segment)}
                            />
                        );
                    })
                )}
            </div>

            {/* Right column — selected segment */}
            <div className="flex-1 min-w-0 h-full min-h-0 overflow-y-auto">
                {!currentSegment ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-2.5 px-6">
                        <div className="w-11 h-11 rounded-xl bg-surface-alt flex items-center justify-center text-ink-muted">
                            <Layers size={19} />
                        </div>
                        <strong className="text-ink text-[13px] font-semibold">Select a segment</strong>
                        <span className="text-[12.5px] text-ink-muted max-w-[260px]">
                            Pick a segment from the list to preview it and see its details.
                        </span>
                    </div>
                ) : (
                    <div className="p-4 flex flex-col gap-4">
                        <p>here goes segment details...</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function SegmentListItem({ segment, active, onClick }) {
    return (
        <div
            className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all ${active ? "bg-primary-100" : "hover:bg-surface-alt"}`}
            onClick={onClick}
        >
            <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-semibold text-ink truncate">{segment.title}</p>
                <p className="text-[11.5px] text-ink-secondary truncate">{segment.description}</p>
            </div>
        </div>
    );
}

export default TimeSegmentList;