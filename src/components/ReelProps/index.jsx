import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

function ReelProps({ reel }) {
    const { theme } = useContext(MainContext);
    return (
        <div className={`p-4 w-[30vw] ${theme === 'light' ? "bg-[#f0f0f0]" : "bg-textColor-300"} h-full`}>
            <h5 className='text-gradient-x'>Reel Properties</h5>
        </div>
    );
}

export default ReelProps;