import { useContext, useRef } from 'react';
import { MainContext } from '../../contexts/mainContext';

const RippleButton = ({ children, fullWidth = false, cssClasses = "", disabled = false, onClick = () => null }) => {

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
            className={`relative overflow-hidden p-2 !pr-[9px] text-white text-sm  rounded-full ${theme === "light" ? "bg-[linear-gradient(90deg,#a99df2,#d992b1)]" : "bg-[linear-gradient(90deg,#755bea,#b76894)]"} hover:opacity-90 transition duration-300  flex items-center justify-center ${fullWidth ? 'w-full' : "w-fit"} ${cssClasses}`}
        >
            {children}
        </button>
    );
};

export default RippleButton;
