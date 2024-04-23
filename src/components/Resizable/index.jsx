import React, { useState, useCallback, useEffect } from 'react';
import './Resizable.css'; // Optional CSS import for styling

const Resizable = ({ initialWidth = 200, minWidth = 100, maxWidth = 600 }) => {
    const [width, setWidth] = useState(initialWidth);
    const [isResizing, setIsResizing] = useState(false);

    const handleMouseDown = useCallback(() => {
        setIsResizing(true);
    }, []);

    const handleMouseMove = useCallback(
        (e) => {
            if (isResizing) {
                const newWidth = Math.min(Math.max(minWidth, e.clientX), maxWidth);
                setWidth(newWidth);
            }
        },
        [isResizing, minWidth, maxWidth]
    );

    const handleMouseUp = useCallback(() => {
        if (isResizing) {
            setIsResizing(false);
        }
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        } else {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    return (
        <div
            className="resizable"
            style={{ width: `${width}px`, backgroundColor: 'lightgray', padding: '10px' }}
        >
            <div style={{ display: 'inline-block', width: '100%' }}>Resizable Content</div>
            <div
                className="resizer"
                onMouseDown={handleMouseDown}
                style={{
                    cursor: 'col-resize',
                    width: '5px',
                    backgroundColor: 'gray',
                    height: '100%',
                    position: 'absolute',
                    right: 0,
                    top: 0,
                }}
            />
        </div>
    );
};

export default Resizable;
