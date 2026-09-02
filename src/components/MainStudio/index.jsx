import React, { useContext, useRef } from 'react';
import { MainContext } from '../../contexts/mainContext';
import MetadataPanel from '../MetadataPanel';
import EmptyWorkspace from '../EmptyWorkspace';
import ShortsList from "../ShortsList";
import { MAIN_STUDIO_PANELS } from '../../globals';

function MainStudio({ panelWidth }) {
    const {
        currentResource,
        workspaceContainer,
        activeStudioPanel
    } = useContext(MainContext);

    return (
        <div ref={workspaceContainer}>
            {
                activeStudioPanel === MAIN_STUDIO_PANELS.SHORTS ? (
                    <ShortsList
                        workspaceContainer={workspaceContainer}
                        centerPanelRef={workspaceContainer}
                        leftWidth={panelWidth}
                        maxWidth={720}
                    />
                ) : !currentResource ? (
                    <EmptyWorkspace />
                ) :
                    activeStudioPanel === MAIN_STUDIO_PANELS.METADATA ? (
                        <MetadataPanel
                            workspaceContainer={workspaceContainer}
                            centerPanelRef={workspaceContainer}
                            leftWidth={panelWidth}
                            maxWidth={720}
                        />
                    ) : (
                        <EmptyWorkspace />
                    )}
        </div>
    );
}

export default MainStudio;