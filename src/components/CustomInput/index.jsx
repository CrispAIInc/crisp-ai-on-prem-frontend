import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

const CustomInput = ({ placeholder = '', type = 'text', value, onChange, onKeyDown, className }) => {

    const { theme } = useContext(MainContext);

    return (
        <input
            className={`w-full p-2 rounded-md focus:outline-none ${theme === 'light' ? '!border !text-textColor-300' : ' !bg-background_workspace !border !border-textColor-200 text-white'} ${className}`}
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
        />
    );
};

export default CustomInput;