import React, { useState } from 'react';
import './custom-tooltip.css';

const CustomTooltip = ({ text, children }) => {
    const [isVisible, setIsVisible] = useState(false);

    const showTooltip = () => {
        setIsVisible(true);
    };

    const hideTooltip = () => {
        setIsVisible(false);
    };

    return (
        <div className="tooltip-container">
            <div
                className="tooltip-trigger"
                onMouseEnter={showTooltip}
                onMouseLeave={hideTooltip}
            >
                {children}
            </div>
            {isVisible && <div className="tooltip">{text}</div>}
        </div>
    );
};

export default CustomTooltip;
