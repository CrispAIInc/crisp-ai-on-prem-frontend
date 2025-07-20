import { useContext, useState } from "react";
import { MainContext } from '../../contexts/mainContext';

const AnimatedInput = ({ label, type = "text", name = "", value = "", setValue = () => null, disabled = false, onKeyDown, cssClasses = "", rows = 3 }) => {
    const { theme } = useContext(MainContext);
    const [isFocused, setIsFocused] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => {
        if (!value || disabled) setIsFocused(false);
    };

    return (
        <div className={`relative w-full max-w-sm mt-6 ${cssClasses}`}>
            {
                type === "text" ? (
                    <>
                        <input

                            type={type}
                            // name={name}
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            onKeyDown={onKeyDown}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            className={`w-full h-12 text-gray-900 placeholder-transparent bg-transparent  peer focus:outline-none focus:border-blue-500 ${theme === 'light' ? ' !text-textColor-300 border-b-4 border-gray-300' : ' border-b-4 border-textColor-200/45 !bg-background_workspace  text-white'}`}
                            placeholder={label}
                            disabled={disabled}
                        />
                        <label
                            htmlFor={name}
                            className={`absolute left-0 text-gray-500 transition-all duration-200 ease-in-out 
          ${isFocused || value ? "-top-4 text-sm text-blue-500" : "top-3 text-sm pointer-events-none"}
        `}
                        >
                            {label}
                        </label>
                    </>
                ) : (
                    <>
                        <textarea

                            // type={type}
                            // name={name}
                            rows={rows}
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            onKeyDown={onKeyDown}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            className={`w-full h-12 text-gray-900 placeholder-transparent bg-transparent  peer focus:outline-none focus:border-blue-500 ${theme === 'light' ? ' !text-textColor-300 border-b-4 border-gray-300' : ' border-b-4 border-textColor-200/45 !bg-background_workspace  text-white'}`}
                            placeholder={label}
                            disabled={disabled}
                        />
                        <label
                            htmlFor={name}
                            className={`absolute left-0 text-gray-500 transition-all duration-200 ease-in-out 
          ${isFocused || value ? "-top-4 text-sm text-blue-500" : "top-3 text-sm pointer-events-none"}
        `}
                        >
                            {label}
                        </label>
                    </>
                )
            }
        </div>
    );
};

export default AnimatedInput;
