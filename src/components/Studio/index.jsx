import { useContext, useEffect, useRef, useState } from 'react';
import { NAV_ITEMS } from '../../navigation/navitems';
import { MainContext } from '../../contexts/mainContext';
import MetadataPanel from '../MetadataPanel';
import EmptyWorkspace from "../EmptyWorkspace";
import MainStudio from '../MainStudio';

function Studio() {

    const studioRef = useRef(null);
    const [panelWidth, setPanelWidth] = useState(400);
    const [isDragging, setIsDragging] = useState(false);

    const {
        activeTab,
        currentResource,
        workspaceContainer,
    } = useContext(MainContext);

    const metadataPanelRef = useRef(null);

    const activeItem = NAV_ITEMS.find(
        (item) => item.key === activeTab
    );

    const ActiveComponent = activeItem?.component;

    useEffect(() => {
        if (!isDragging) return undefined;

        const handlePointerMove = (event) => {
            const studioBounds = studioRef.current?.getBoundingClientRect();
            if (!studioBounds) return;

            const maxWidth = Math.min(720, studioBounds.width * 0.7);
            const nextWidth = studioBounds.right - event.clientX;
            setPanelWidth(Math.min(maxWidth, Math.max(280, nextWidth)));
        };

        const stopDragging = () => setIsDragging(false);

        document.addEventListener('pointermove', handlePointerMove);
        document.addEventListener('pointerup', stopDragging);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';

        return () => {
            document.removeEventListener('pointermove', handlePointerMove);
            document.removeEventListener('pointerup', stopDragging);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };
    }, [isDragging]);

    return (
        <div ref={studioRef} className="max-w-[1400px] mx-auto h-full min-h-0 overflow-hidden">
            <div
                className="grid h-full min-h-0 grid-cols-1 bg-gray-100 items-start lg:grid-cols-[minmax(0,1fr)_var(--studio-panel-width)]"
                style={{ '--studio-panel-width': `${panelWidth}px` }}
            >
                <MainStudio
                    panelWidth={panelWidth}
                />
                <div className="relative h-full min-h-0 min-w-0">
                    {/* <button
                        type="button"
                        aria-label="Resize panel"
                        title="Resize panel"
                        className="absolute -left-3 top-0 z-10 hidden h-full w-6 items-center justify-center lg:flex"
                        onPointerDown={(event) => {
                            event.preventDefault();
                            setIsDragging(true);
                        }}
                    >
                        <span className="h-16 w-2 cursor-col-resize rounded-full bg-gray-300 transition-colors hover:bg-primary-200" />
                    </button> */}
                    <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden">
                        {ActiveComponent && <ActiveComponent />}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Studio;