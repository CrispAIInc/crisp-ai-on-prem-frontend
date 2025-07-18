import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';

const CustomSelectTwo = ({ options, onChange, placeholder, withIcon = false }) => {

    const { theme } = useContext(MainContext);

    const [selectedValue, setSelectedValue] = useState('');

    const handleChange = (event) => {
        const selectedOption = options.find(
            (option) => option.value === event.target.value
        );
        setSelectedValue(event.target.value);
        onChange(selectedOption);
    };

    return (
        <div className="custom-select-container user-select-none">
            <select
                className={`select-none px-1 cursor-pointer py-1 rounded-md outline-none ${!withIcon && (theme === 'light' ? ' border border-textColor-100' : ' !border !border-textColor-300')} !border-none ${withIcon && 'bg-transparent'} ${theme === 'light' ? "bg-light-hover-100/30" : "bg-light-hover-200/20 text-textColor-100"}`}
                onChange={handleChange}
                value={selectedValue}>
                <option value="" disabled className={`${theme === 'dark' && 'bg-background text-textColor-100'}`}>{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value} className={`${theme === 'dark' && 'bg-background text-textColor-100 border'}`}>
                        {option.originalLabel || option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CustomSelectTwo;
