import React from 'react';
import './CustomTimeline.css';

// Timeline Component
const Timeline = ({ children, position = 'alternate' }) => {
    return (
        <div className={`timeline timeline-${position}`}>
            {children}
        </div>
    );
};

// Timeline Item Component
const TimelineItem = ({ children }) => {
    return (
        <div className="timeline-item">
            {children}
        </div>
    );
};

// Timeline Opposite Content Component
const TimelineOppositeContent = ({ children, className = '' }) => {
    return (
        <div className={`timeline-opposite-content ${className}`}>
            {children}
        </div>
    );
};

// Timeline Separator Component
const TimelineSeparator = ({ children }) => {
    return (
        <div className="timeline-separator">
            {children}
        </div>
    );
};

// Timeline Dot Component
const TimelineDot = ({ variant = 'filled', color = 'primary' }) => {
    return (
        <div className={`timeline-dot timeline-dot-${variant} timeline-dot-${color}`} />
    );
};

// Timeline Connector Component
const TimelineConnector = () => {
    return <div className="timeline-connector" />;
};

// Timeline Content Component
const TimelineContent = ({ children }) => {
    return (
        <div className="timeline-content">
            {children}
        </div>
    );
};

export {
    Timeline,
    TimelineItem,
    TimelineOppositeContent,
    TimelineSeparator,
    TimelineDot,
    TimelineConnector,
    TimelineContent
};