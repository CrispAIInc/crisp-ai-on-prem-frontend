import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

const CustomInput = ({ placeholder = '', type = 'text', value, onChange, onKeyDown, className }) => {

    const { theme } = useContext(MainContext);

    return (
        <input
            className={`w-full p-2 rounded-md focus:outline-none ${theme === 'light' ? 'border' : 'bg-background_workspace text-white'} ${className}`}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
        />
    );
};

export default CustomInput;