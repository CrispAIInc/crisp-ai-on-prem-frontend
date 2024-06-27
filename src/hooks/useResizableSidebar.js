// useResizableSidebar.js
import { useState, useEffect } from 'react';

export const useResizableSidebar = (minWidth, isLeft) => {
    const maxWidth = window.innerWidth * 0.75;
    const [sidebarWidth, setSidebarWidth] = useState(window.innerWidth * 0.25);
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
        setSidebarWidth(window.innerWidth * 0.25);
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

    return { sidebarWidth, handleMouseDown, handleDoubleClick };
};
