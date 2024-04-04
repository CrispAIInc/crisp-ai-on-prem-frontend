import React from 'react';

const CustomButton = ({ children, onClick }) => {
    return (
        <div className="px-2 py-1 my-6 text-center text-white rounded-md cursor-pointer select-sources-container bg-primary-300">
            <button
                type="button"
                className="select-sources-btn"
                onClick={onClick}
            >
                {children}
            </button>
        </div>
    );
};

export default CustomButton;