import React, { useState, useRef, useEffect } from 'react';

const Tooltip = ({
    children,
    text,
    direction = 'top',
    mode = 'hover',
    delay = 0,
    className = ""
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef(null);
    const tooltipRef = useRef(null);

    // Handle showing logic
    const showTooltip = () => {
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, delay);
    };

    // Handle hiding logic
    const hideTooltip = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setIsVisible(false);
    };

    // Toggle for click mode
    const toggleTooltip = () => {
        if (mode === 'click') {
            setIsVisible((prev) => !prev);
        }
    };

    // Close tooltip when clicking outside (essential for 'click' mode)
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                setIsVisible(false);
            }
        };

        if (mode === 'click' && isVisible) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isVisible, mode]);

    // Directional classes for the tooltip box and the arrow
    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-3",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-3",
        left: "right-full top-1/2 -translate-y-1/2 mr-3",
        right: "left-full top-1/2 -translate-y-1/2 ml-3",
    };

    const arrowClasses = {
        top: "top-full left-1/2 -translate-x-1/2 border-t-gray-800",
        bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-gray-800",
        left: "left-full top-1/2 -translate-y-1/2 border-l-gray-800",
        right: "right-full top-1/2 -translate-y-1/2 border-r-gray-800",
    };

    return (
        <div
            ref={tooltipRef}
            className="relative inline-block"
            onMouseEnter={mode === 'hover' ? showTooltip : undefined}
            onMouseLeave={mode === 'hover' ? hideTooltip : undefined}
            onClick={toggleTooltip}
        >
            {/* Trigger Element */}
            {children}

            {/* Tooltip Box */}
            <div
                role="tooltip"
                className={`
          absolute z-50 px-3 py-2 text-sm text-white bg-gray-800 rounded-lg shadow-lg
          whitespace-nowrap transition-opacity duration-300 ease-in-out
          ${positionClasses[direction]}
          ${isVisible ? "opacity-100 visible" : "opacity-0 invisible"}
          ${className}
        `}
            >
                {text}
                {/* Arrow/Caret */}
                <div
                    className={`absolute border-4 border-transparent ${arrowClasses[direction]}`}
                />
            </div>
        </div>
    );
};

export default Tooltip;