import React from 'react';

function HorizontalOrText() {
    return (
        <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="mx-2 text-gray-500">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
        </div>
    );
}

export default HorizontalOrText;