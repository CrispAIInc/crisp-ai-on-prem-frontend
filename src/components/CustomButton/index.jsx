import React from 'react';

const CustomButton = ({ children, onClick, className }) => {
    return (
        // <div className={`px-2 py-1 my-6 text-center text-white rounded-md cursor-pointer select-sources-container bg-primary-300 ${className}`}>
        <button
            className={`px-2 py-1 my-6 text-center  rounded-md cursor-pointer select-sources-container  ${className}`}
            type="button"
            onClick={onClick}
        >
            {children}
        </button>
        // </div>
    );
};

export default CustomButton;