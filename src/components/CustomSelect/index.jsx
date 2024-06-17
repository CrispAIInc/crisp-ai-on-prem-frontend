import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';

const CustomSelect = ({ title, options, onChange, defaultValue = '' }) => {

    const { selectedCategory, theme } = useContext(MainContext);

    const [selectedValue, setSelectedValue] = useState(selectedCategory || '');

    const handleSelectChange = (event) => {
        const newValue = event.target.value;
        setSelectedValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <select value={selectedValue} onChange={handleSelectChange} className={`px-1 cursor-pointer py-1 rounded-md outline-none ${theme === 'light' ? 'bg-white border border-textColor-100' : 'bg-transparent text-textColor-100  !border !border-textColor-300'}`}>
            <option value={null} disabled className={`${theme === 'dark' && 'bg-background text-textColor-100'}`}>{title}</option>
            {options.map((option) => (
                <option key={option.value} value={option.value} className={`${theme === 'dark' && 'bg-background text-textColor-100 border'}`}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default CustomSelect;