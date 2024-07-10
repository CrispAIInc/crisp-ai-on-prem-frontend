import React from 'react';

export const useOutsideClick = (callback) => {
    const ref = React.useRef();

    React.useEffect(() => {
        const handleClick = () => {
            callback();
        };

        document.addEventListener('click', handleClick);

        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);

    return ref;
};