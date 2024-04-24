// useResizableSidebar.js
import { useState, useEffect } from 'react';

export const useResizableSidebar = (minWidth, isLeft) => {
    const [sidebarWidth, setSidebarWidth] = useState(window.innerWidth * 0.25);
    const [isResizing, setIsResizing] = useState(false);

    const handleMouseDown = () => {
        setIsResizing(true);
    };

    const handleMouseMove = (e) => {
        if (isResizing) {
            // Calculate the new sidebar width based on the mouse's position
            const newWidth = isLeft
                ? Math.max(minWidth, e.clientX)
                : Math.max(minWidth, window.innerWidth - e.clientX);
            setSidebarWidth(newWidth);
        }
    };

    const handleMouseUp = () => {
        setIsResizing(false);
    };

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            // Clean up event listeners
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing]);

    return { sidebarWidth, handleMouseDown };
};
