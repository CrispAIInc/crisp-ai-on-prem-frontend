import React from 'react';

const CustomInput = ({ placeholder = '', type = 'text', value, onChange, onKeyDown }) => {
    return (
        <input
            className='w-full p-2 border rounded-md focus:outline-none '
            type={type}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            onKeyDown={onKeyDown}
        />
    );
};

export default CustomInput;