import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

const CustomTextArea = ({ placeholder = '', value, disabled, onChange, onKeyDown, className = '' }) => {

    const { theme } = useContext(MainContext);

    return (
        <textarea
            className={`w-full p-2 rounded-md focus:outline-none ${theme === 'light' ? '!border !text-textColor-300' : ' !bg-background_workspace !border !border-textColor-200 text-white'} ${className}`}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
            disabled={disabled}
        />
    );
};

export default CustomTextArea;