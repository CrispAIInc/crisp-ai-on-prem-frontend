import React from 'react';
import './StackedPaperEffect.css'; // Importing the custom CSS for hover effects

const StackedPaperEffect = ({ title, content }) => {
    return (
        <div className="letter">
            <h4 className="mb-2 text-sm font-semibold text-gray-800">{title}</h4>
            <p className="text-sm ">{content}</p>
        </div>
    );
};

export default StackedPaperEffect;
