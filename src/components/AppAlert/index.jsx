import { useEffect, useRef, useState } from "react";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import DoneOutlinedIcon from '@mui/icons-material/DoneOutlined';


/**
    direction        // 'top' | 'bottom' | 'left' | 'right'
    heading          // string (required)
    subheading       // string (optional)
    duration         // number (ms) default: 3000
    onClose          // function (optional)
    variant          // 'info' | 'success' | 'warning' | 'error'
    showIcon         // boolean (default true)
    closable         // boolean (default true)
    pauseOnHover     // boolean (default true)
    className        // extra tailwind classes
 */

export default function AppAlert({
    direction = "top",
    heading,
    subheading,
    duration = 3000,
    onClose,
    variant = "warning",
    showIcon = true,
    closable = true,
    pauseOnHover = true,
    className = "",
}) {
    const [visible, setVisible] = useState(true);
    const timerRef = useRef(null);

    const close = () => {
        setVisible(false);
        onClose?.();
    };

    const startTimer = () => {
        if (duration) {
            timerRef.current = setTimeout(close, duration);
        }
    };

    const stopTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    useEffect(() => {
        startTimer();
        return stopTimer;
    }, []);

    if (!visible) return null;

    const variants = {
        info: "bg-blue-100 text-blue-900 border-blue-600",
        success: "bg-emerald-100 text-emerald-900 border-emerald-600",
        warning: "bg-amber-100 text-amber-900 border-amber-600",
        error: "bg-red-100 text-red-900 border-red-600",
    };

    const directionAnimation = {
        top: "animate-slide-down",
        bottom: "animate-slide-up",
        left: "animate-slide-right",
        right: "animate-slide-left",
    };

    const icons = {
        info: <InfoOutlinedIcon />,
        success: <DoneOutlinedIcon />,
        warning: <WarningAmberOutlinedIcon />,
        error: <ErrorOutlineOutlinedIcon />,
    };

    return (
        <div
            onMouseEnter={pauseOnHover ? stopTimer : undefined}
            onMouseLeave={pauseOnHover ? startTimer : undefined}
            className={`
        absolute z-[9999999] right-5 top-5 flex items-center gap-3
        w-full max-w-sm rounded-xl border
        px-4 py-3 shadow-lg backdrop-blur
        ${variants[variant]}
        ${directionAnimation[direction]}
        ${className}
      `}
        >
            {showIcon && (
                <div className="mt-0.5 text-current">
                    {icons[variant]}
                </div>
            )}

            <div className="flex-1">
                <p className="text-sm font-semibold leading-tight">
                    {heading}
                </p>
                {subheading && (
                    <p className="mt-1 text-xs opacity-80">
                        {subheading}
                    </p>
                )}
            </div>

            {closable && (
                <button
                    onClick={close}
                    className="p-1 ml-2 transition rounded-md opacity-60 hover:opacity-100 hover:bg-black/5"
                >
                    ✕
                </button>
            )}
        </div>
    );
}
