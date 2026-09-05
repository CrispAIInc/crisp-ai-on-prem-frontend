import React, { useContext, useRef } from 'react';
import { MainContext } from '../../contexts/mainContext';
import MetadataPanel from '../MetadataPanel';
import EmptyWorkspace from '../EmptyWorkspace';
import ShortsList from "../ShortsList";
import { MAIN_STUDIO_PANELS } from '../../globals';
import TimeSegmentList from '../TimeSegmentList';

function MainStudio({ panelWidth }) {
    const {
        currentResource,
        workspaceContainer,
        activeStudioPanel
    } = useContext(MainContext);

    // Which panels can render without a currentResource (only Shorts, for now).
    const REQUIRES_ASSETS = {
        [MAIN_STUDIO_PANELS.SHORTS]: false,
        [MAIN_STUDIO_PANELS.METADATA]: true,
        [MAIN_STUDIO_PANELS.TIME_SEGMENTS]: false,
    };

    function renderStudioPanel() {
        const needsResource = REQUIRES_ASSETS[activeStudioPanel] ?? true;
        if (needsResource && !currentResource) return <EmptyWorkspace />;

        switch (activeStudioPanel) {
            case MAIN_STUDIO_PANELS.SHORTS:
                return <ShortsList />;

            case MAIN_STUDIO_PANELS.METADATA:
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

            default:
                return <EmptyWorkspace />;
        }
    }

    return (
        <div ref={workspaceContainer} className="h-full min-h-0">
            {renderStudioPanel()}
        </div>
    );
}

export default MainStudio;