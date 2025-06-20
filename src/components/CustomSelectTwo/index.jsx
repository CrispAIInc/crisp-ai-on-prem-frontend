import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';

const CustomSelectTwo = ({ options, onChange, placeholder, dropdownText }) => {

    const { theme } = useContext(MainContext);

    const handleChange = (event) => {
        const selectedOption = options.find(
            (option) => option.value === event.target.value
        );
        // setSelectedValue(event.target.value);
        onChange(selectedOption);
    };

    return (
        <div className="custom-select-container user-select-none">
            <select className={`px-1 cursor-pointer py-1 rounded-md outline-none ${theme === 'light' ? 'bg-light-hover-100/30 border border-textColor-100' : 'bg-light-hover-200/20 text-textColor-100  !border !border-textColor-300'}`} onChange={handleChange} value={dropdownText}>
                <option value="" disabled className={`${theme === 'dark' && 'bg-background text-textColor-100'}`}>{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value} className={`${theme === 'dark' && 'bg-background text-textColor-100 border'}`}>
                        {option.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CustomSelectTwo;
