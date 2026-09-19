import {
    Braces,
    Info
} from "lucide-react";
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BusinessIntelligenceListItem from '../BusinessIntelligenceListItem';
import BusinessIntelligenceDetails from '../BusinessIntelligenceDetails';
import EmptyState from '../EmptyState';

function BusinessIntelligenceList() {

    const {
        jsonEntities,
        selectedJsonEntity
    } = useContext(MainContext);

    return (
        <div className={`h-full min-h-0 flex overflow-hidden`}>
            {/* Left column — list */}
            <div className="w-[280px] shrink-0 border-r border-border h-full min-h-0 overflow-y-auto p-3 flex flex-col gap-2">
                {jsonEntities.length === 0 ? (
                    <EmptyState
                        icon={<Info size={20} />}
                        title="No entities found"
                        description="Use left panel to start generating entities."
                    />
                ) : (
                    <BusinessIntelligenceListItem />
                )}
            </div>

            {/* Right column — selected segment */}
            <div className="flex-1 min-w-0 h-full min-h-0 overflow-y-auto">
                {(selectedJsonEntity === undefined || selectedJsonEntity === null) ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-2.5 px-6">
                        <div className="w-11 h-11 rounded-xl bg-surface-alt flex items-center justify-center text-ink-muted">
                            <Braces size={20} />
                        </div>
                        <strong className="text-ink text-[13px] font-semibold">Select an Entity</strong>
                        <span className="text-[12.5px] text-ink-muted max-w-[260px]">
                            Pick an Entity from the list to see its details.
                        </span>
                    </div>
                ) : (
                    <div className="p-4 flex flex-col gap-4">
                        <BusinessIntelligenceDetails />
                    </div>
                )}
            </div>
        </div>
    );
}


export default BusinessIntelligenceList;