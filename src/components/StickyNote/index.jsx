import { useEffect, useState } from 'react';

const StickyNote = ({ title, content }) => {
    const [color, setColor] = useState('');

    useEffect(() => {
        // Function to generate a light random hex color
        const generateLightRandomColor = () => {
            const letters = 'CDEF'; // Restricting to higher hex values for light colors
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * letters.length)];
            }
            return color;
        };

        setColor(generateLightRandomColor());
    }, []);

    return (
        <div
            className={`p-4 shadow-xl rounded-lg w-64 h-64 relative transform shadow-[rgba(0,0,15,0.5)_0px_8px_19px_-10px]`}
            style={{
                backgroundColor: color,
                // boxShadow: '0 15px 25px rgba(0, 0, 0, 0.2)', // Bottom-only shadow
                transform: `rotate(${Math.random() * 6 - 3}deg)`, // Random slight rotation between -3 and 3 degrees
            }}
        >
            {/* Pin */}
            {/* <div className="absolute w-4 h-4 transform -translate-x-1/2 bg-red-400 rounded-full shadow-md -top-4 left-1/2" /> */}

            {/* Note Content */}
            <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-800">{title}</h3>
                <p className="h-40 overflow-y-auto text-sm text-gray-700">{content}</p>
            </div>
        </div>
    );
};

export default StickyNote;