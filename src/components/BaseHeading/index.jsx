import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

const BaseHeading = ({ text, className = '', onClick }) => {
    const { theme } = useContext(MainContext);
    return (
        <p className={`m-0 text-sm font-semibold ${theme === 'light' ? 'text-textColor-200' : 'text-[#ABAEB4]'} select-none ${className}`} onClick={onClick}>{text}</p>
    );
};

export default BaseHeading;