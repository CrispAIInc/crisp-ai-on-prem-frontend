// useResizableSidebar.js
import { useState, useEffect } from 'react';
import useCheckMobileScreen from './useCheckMobileScreen';

export const useResizableSidebar = (minWidth, isLeft) => {
    const isMobile = useCheckMobileScreen();
    const maxWidth = window.innerWidth * 0.75;
    const [sidebarWidth, setSidebarWidth] = useState(isMobile ? -100 : window.innerWidth * (isLeft ? 0.2 : 0.26));
    const [isResizing, setIsResizing] = useState(false);

    const handleMouseDown = () => {
        setIsResizing(true);
    };

    const handleMouseMove = (e) => {
        if (isResizing) {
            // Calculate the new sidebar width based on the mouse's position
            const newWidth = isLeft
                ? Math.min(maxWidth, Math.max(minWidth, e.clientX))
                : Math.min(maxWidth, Math.max(minWidth, window.innerWidth - e.clientX));
            setSidebarWidth(newWidth);
        }
    };

    const handleMouseUp = () => {
        setIsResizing(false);
    };

    const handleDoubleClick = () => {
        setSidebarWidth(isMobile ? -100 : window.innerWidth * 0.2);
    };

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            window.addEventListener('dblclick', handleDoubleClick);
        } else {
            // Clean up event listeners
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('dblclick', handleDoubleClick);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('dblclick', handleDoubleClick);
        };
    }, [isResizing]);

    return { sidebarWidth, setSidebarWidth, handleMouseDown, handleDoubleClick, maxWidth, isExpanded: sidebarWidth === window.innerWidth * 0.75 };
};
