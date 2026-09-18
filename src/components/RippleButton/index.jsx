import { useContext, useRef } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';

const RippleButton = ({ children, fullWidth = false, cssClasses = "", noBg = false, disabled = false, onClick = () => null }) => {

    const { theme } = useContext(MainContext);
    const buttonRef = useRef(null);

    const createRipple = (event) => {
        const button = buttonRef.current;
        const circle = document.createElement('span');

        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        const rect = button.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add('ripple');

        const existingRipple = button.querySelector('.ripple');
        if (existingRipple) existingRipple.remove();

        button.appendChild(circle);
    };

    return (
        <button
            ref={buttonRef}
            disabled={disabled}
            onClick={(e) => {
                if (disabled) return;
                createRipple(e);
                onClick(e);
            }}
            className={`select-none relative overflow-hidden pr-[9px] text-white text-sm rounded-lg bg-gradient-to-br from-primary-200 to-primary-300 ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'} transition duration-300  flex items-center justify-center ${fullWidth ? 'w-full' : "w-fit"} ${noBg && 'text-gradient-x !border !border-purple-400'} ${cssClasses}`}
        >
            {children}
        </button>
    );
};

export default RippleButton;
