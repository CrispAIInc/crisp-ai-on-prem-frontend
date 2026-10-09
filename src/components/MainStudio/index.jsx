import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import MetadataPanel from '../MetadataPanel';
import EmptyWorkspace from '../EmptyWorkspace';
import ShortsList from "../ShortsList";
import { MAIN_STUDIO_PANELS } from '../../globals';
import TimeSegmentList from '../TimeSegmentList';
import FindMomentsList from '../FindMomentsList';
import BusinessIntelligenceList from '../BusinessIntelligenceList';
import VideoStack from '../../VideoStack';
import {
    CirclePlay
} from "lucide-react";

function MainStudio({ panelWidth }) {
    const {
        currentResource,
        workspaceContainer,
        activeStudioPanel,
        currentAssets,
        onThumbnailClick,
        activeTab,
    } = useContext(MainContext);

    // Which panels can render without a currentResource (only Shorts, for now).
    const REQUIRES_ASSETS = {
        [MAIN_STUDIO_PANELS.SHORTS]: false,
        [MAIN_STUDIO_PANELS.METADATA]: true,
        [MAIN_STUDIO_PANELS.TIME_SEGMENTS]: false,
        [MAIN_STUDIO_PANELS.FIND_MOMENTS]: false,
        [MAIN_STUDIO_PANELS.BUSINESS_INTELLIGENCE]: false,
    };

    function renderStudioPanel() {
        const needsResource = REQUIRES_ASSETS[activeStudioPanel] ?? true;

        if (needsResource && !currentResource && currentAssets?.length === 0) return <EmptyWorkspace />;

        if (needsResource && currentResource) return <MetadataPanel
            workspaceContainer={workspaceContainer}
            centerPanelRef={workspaceContainer}
            leftWidth={panelWidth}
            maxWidth={720}
        />;

        switch (activeStudioPanel) {
            case MAIN_STUDIO_PANELS.SHORTS:
                return <ShortsList />;

            case (MAIN_STUDIO_PANELS.METADATA && currentResource):
                return (
                    <MetadataPanel
                        workspaceContainer={workspaceContainer}
                        centerPanelRef={workspaceContainer}
                        leftWidth={panelWidth}
                        maxWidth={720}
                    />
                );

            case MAIN_STUDIO_PANELS.TIME_SEGMENTS:
                return <TimeSegmentList />;

            case MAIN_STUDIO_PANELS.FIND_MOMENTS:
                return <FindMomentsList />;

            case MAIN_STUDIO_PANELS.BUSINESS_INTELLIGENCE:
                return <BusinessIntelligenceList />;

            default:
                return <EmptyWorkspace />;
        }
    }

    function renderVideoStack() {
        const needsVideoStack = activeStudioPanel === MAIN_STUDIO_PANELS.METADATA && currentAssets.length > 0 && activeTab === "enrich";
        if (needsVideoStack && currentAssets.length > 0) {
            return (
                <div className="flex flex-col px-3">
                    <h2 className="font-display text-[14.5px] font-semibold text-ink flex items-center gap-1">
                        <CirclePlay size={18} />
                        Assets used
                    </h2>
                    <VideoStack
                        videos={currentAssets}
                        onSelect={(asset) => {
                            onThumbnailClick(null, asset);
                        }}
                    />
                </div>
            );
        }
    }

    return (
        <div ref={workspaceContainer} className="h-full min-h-0">
            {renderVideoStack()}
            {renderStudioPanel()}
        </div>
    );
}

export default MainStudio;