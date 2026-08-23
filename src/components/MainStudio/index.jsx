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

    const metadataPanelRef = useRef(null);

    return (
        <div ref={metadataPanelRef} className="h-full min-h-0 min-w-0 overflow-x-hidden overflow-y-auto">
            {currentResource ? (
                <MetadataPanel
                    workspaceContainer={workspaceContainer}
                    centerPanelRef={metadataPanelRef}
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