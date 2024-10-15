import React from 'react';
import './StackedPaperEffect.css'; // Importing the custom CSS for hover effects

const StackedPaperEffect = ({ title, content }) => {
    return (
        <div className="letter">
            <p>{title}</p>
            <h3>{content}</h3>
        </div>
    );
};

export default StackedPaperEffect;
