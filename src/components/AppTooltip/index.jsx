import { useId, useState } from "react";

const POSITION = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const ARROW = {
    top: "top-full left-1/2 -translate-x-1/2 -translate-y-1/2",
    bottom: "bottom-full left-1/2 -translate-x-1/2 translate-y-1/2",
    left: "left-full top-1/2 -translate-x-1/2 -translate-y-1/2",
    right: "right-full top-1/2 translate-x-1/2 -translate-y-1/2",
};

export default function AppTooltip({
    content,
    direction = "top",
    className = "",
    children,
}) {
    const [visible, setVisible] = useState(false);
    const id = useId();

    const dir = POSITION[direction] ? direction : "top";
    const show = () => setVisible(true);
    const hide = () => setVisible(false);

    return (
        <span
            className="relative inline-flex"
            onMouseEnter={show}
            onMouseLeave={hide}
            onFocus={show}
            onBlur={hide}
            onKeyDown={(e) => e.key === "Escape" && hide()}
            aria-describedby={visible ? id : undefined}
        >
            {children}

            <span
                id={id}
                role="tooltip"
                className={[
                    "pointer-events-none absolute z-50 w-max max-w-xs",
                    "rounded-md bg-gray-900 px-3 py-2 text-sm leading-snug text-white shadow-lg",
                    "whitespace-normal break-words text-left",
                    "transition-opacity duration-150",
                    visible ? "opacity-100" : "opacity-0",
                    POSITION[dir],
                    className,
                ].join(" ")}
            >
                {content}
                <span
                    aria-hidden="true"
                    className={`absolute h-2 w-2 rotate-45 bg-gray-900 ${ARROW[dir]}`}
                />
            </span>
        </span>
    );
}