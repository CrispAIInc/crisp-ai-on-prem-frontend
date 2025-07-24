import { useContext, useState } from "react";
import { MainContext } from '../../contexts/mainContext';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';

const AnimatedInput = ({ label, type = "text", name = "", value = "", setValue = () => null, disabled = false, onKeyDown, cssClasses = "", rows = 3, _theme = "light", inputClasses = "", isPassword = false }) => {
    const { theme } = useContext(MainContext);
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => {
        if (!value || disabled) setIsFocused(false);
    };

    function togglePasswordVisibility() {
        const input = document.querySelector(`input[name="${name}"]`);
        if (input) {
            input.type = input.type === "password" ? "text" : "password";
            type = input.type; // Update the type variable to reflect the current state
            setIsPasswordVisible(prev => !prev);
        }
    }

    return (
        <div className={`relative w-full max-w-sm ${cssClasses}`}>
            {
                type !== "textarea" ? (
                    <>
                        <input

                            type={type}
                            name={name}
                            value={value}
                            onChange={e => setValue(e.target.value)}
                            onKeyDown={onKeyDown}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            className={`w-full h-12 pl-2 text-gray-900 placeholder-transparent bg-transparent  focus:outline-none focus:border-blue-500 ${(theme === 'light' || _theme === 'light') ? ' !text-textColor-300 border border-textColor-100' : ' border border-textColor-200/45 !bg-background_workspace text-textColor-100'} rounded-full ${inputClasses}`}
                            placeholder={label}
                            disabled={disabled}
                        />
                        <label
                            htmlFor={name}
                            style={{ transform: 'translateY(-50%)' }}
                            className={`absolute left-2 text-gray-500 transition-all duration-200 ease-in-out 
          ${isFocused || value ? "-top-1 bg-background_workspace px-2 rounded-full left-5 text-sm text-blue-500" : "top-1/2  text-sm pointer-events-none"}
        `}
                        >
                            {label}
                        </label>
                        {(isPassword && !isPasswordVisible) ? (
                            <span onClick={togglePasswordVisibility} className="absolute text-gray-500 transform -translate-y-1/2 cursor-pointer right-3 top-1/2">
                                {/* <i className="fas fa-eye"></i> */}
                                <RemoveRedEyeOutlinedIcon />
                            </span>
                        ) : (isPassword && isPasswordVisible) && (
                            <span onClick={togglePasswordVisibility} className="absolute text-gray-500 transform -translate-y-1/2 cursor-pointer right-3 top-1/2">
                                {/* <i className="fas fa-eye"></i> */}
                                <VisibilityOffOutlinedIcon />
                            </span>
                        )}
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
                            className={`w-full h-12 text-gray-900 placeholder-transparent bg-transparent  peer focus:outline-none focus:border-blue-500 ${(theme === 'light' || _theme === 'light') ? ' !text-textColor-300 border-b-4 border-gray-300' : ' border-b-4 border-textColor-200/45 !bg-background_workspace  text-white'} ${inputClasses}`}
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
