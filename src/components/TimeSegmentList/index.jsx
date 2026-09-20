import { Info, Layers } from "lucide-react";
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import EmptyState from '../EmptyState';
import SegmentListItem from '../SegmentListItem';
import SegmentDetails from '../SegmentDetails';

export default function TimeSegmentList() {

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
                    <EmptyState
                        icon={<Info size={20} />}
                        title="No segments found"
                        description="Use left panel to start generating segments."
                    />
                ) : (
                    <SegmentListItem />
                )}
            </div>

            {/* Right column — selected segment */}
            <div className="flex-1 min-w-0 h-full min-h-0 overflow-y-auto">
                {!currentSegment ? (
                    <EmptyState
                        twClasses='flex-1 h-full'
                        icon={<Layers size={20} />}
                        title="Select a segment"
                        description="Pick a segment from the list to preview it and see its details."
                    />
                ) : (
                    <div className="p-4 flex flex-col gap-4">
                        <SegmentDetails key={new Date()} />
                    </div>
                )}
            </div>
        </div>
    );
}