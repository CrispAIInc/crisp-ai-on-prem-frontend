import { useContext, useState } from 'react';
// import './CustomSelect.css';
import { MainContext } from '../../contexts/mainContext';

const CustomSelectTwo = ({ options, onChange, placeholder }) => {

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
        <div className="custom-select-container">
            <select className={`px-1 cursor-pointer py-1 rounded-md outline-none ${theme === 'light' ? 'bg-white border border-textColor-100' : 'bg-transparent text-textColor-100  !border !border-textColor-300'}`} onChange={handleChange} value={selectedValue}>
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
