import { useEffect, useRef, useState } from "react";


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
        info: "bg-blue-50 text-blue-900 border-blue-200",
        success: "bg-emerald-50 text-emerald-900 border-emerald-200",
        warning: "bg-amber-50 text-amber-900 border-amber-200",
        error: "bg-red-50 text-red-900 border-red-200",
    };

    const directionAnimation = {
        top: "animate-slide-down",
        bottom: "animate-slide-up",
        left: "animate-slide-right",
        right: "animate-slide-left",
    };

    return (
        <div
            onMouseEnter={pauseOnHover ? stopTimer : undefined}
            onMouseLeave={pauseOnHover ? startTimer : undefined}
            className={`
        relative flex items-start gap-3
        w-full max-w-sm rounded-xl border
        px-4 py-3 shadow-lg backdrop-blur
        ${variants[variant]}
        ${directionAnimation[direction]}
        ${className}
      `}
        >
            {showIcon && (
                <div className="mt-0.5">
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white/60 text-sm">
                        ⚠️
                    </span>
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
                    className="ml-2 rounded-md p-1 opacity-60 transition hover:opacity-100 hover:bg-black/5"
                >
                    ✕
                </button>
            )}
        </div>
    );
}
