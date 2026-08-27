import React, { useContext, useRef } from 'react';
import { MainContext } from '../../contexts/mainContext';
import MetadataPanel from '../MetadataPanel';
import EmptyWorkspace from '../EmptyWorkspace';

function MainStudio({
    panelWidth
}) {

    const {
        currentResource,
        workspaceContainer,
    } = useContext(MainContext);

    return (
        <div ref={workspaceContainer}>
            {currentResource ? (
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