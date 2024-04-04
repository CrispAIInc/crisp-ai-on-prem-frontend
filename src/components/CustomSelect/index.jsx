import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';

const CustomSelect = ({ title, options, onChange, defaultValue = '' }) => {

    const { selectedCategory } = useContext(MainContext);

    const [selectedValue, setSelectedValue] = useState(selectedCategory || '');

    const handleSelectChange = (event) => {
        const newValue = event.target.value;
        setSelectedValue(newValue);
        if (onChange) {
            onChange(newValue);
        }
    };

    return (
        <select value={selectedValue} onChange={handleSelectChange} className='px-1 py-1 border border-none rounded-md outline-none'>
            <option value={defaultValue} disabled>{title}</option>
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    );
};

export default CustomSelect;