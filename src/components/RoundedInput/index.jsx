import React, { useState } from 'react';

const RoundedInput = ({
    label,
    type = 'text',
    name,
    value,
    onChange,
    required = false,
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const hasValue = value?.toString().length > 0;

    return (
        <div className="relative w-full">
            <input
                type={type}
                name={name}
                value={value}
                required={required}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className="w-full px-6 pt-5 pb-2 text-sm bg-white border border-gray-300 rounded-full peer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder=" "
            />
            <label
                htmlFor={name}
                className={`absolute left-6 top-2.5 text-gray-500 text-sm bg-white px-1 transition-all duration-200 pointer-events-none 
          ${isFocused || hasValue ? 'text-xs -top-2.5 scale-90' : 'top-4'}
        `}
            >
                {label}
            </label>
        </div>
    );
};

export default RoundedInput;
