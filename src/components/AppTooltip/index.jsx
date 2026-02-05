// import React, { useContext } from "react";
// import { MainContext } from "../../contexts/mainContext";

// const AppTooltip = ({ content, direction = "top" }) => {
//     const { theme } = useContext(MainContext);

//     const basePosition =
//         direction === "top"
//             ? "bottom-full mb-2"
//             : "top-full mt-2";

//     return (
//         <div
//             className={`
//         absolute ${basePosition}
//         left-1/2 -translate-x-1/2
//         select-none
//         max-w-xs
//         whitespace-normal break-words
//         text-sm rounded-md py-1 px-2 z-50
//         ${theme === "light"
//                     ? "text-textColor-300 bg-slate-100"
//                     : "text-textColor-100 bg-textColor-300"}
//         shadow-md
//       `}
//             style={{
//                 maxWidth: "min(90vw, 20rem)", // 👈 prevents viewport overflow
//             }}
//         >
//             {content}
//         </div>
//     );
// };

// export default AppTooltip;
import React, { useContext, useState, useRef } from "react";
import { MainContext } from "../../contexts/mainContext";

const AppTooltip = ({
    children,
    content,
    direction = "top",
    mode = "hover", // "hover" | "click"
    delay = 100,
    disabled = false,
}) => {
    const { theme } = useContext(MainContext);
    const [visible, setVisible] = useState(false);
    const timeoutRef = useRef(null);

    const basePosition =
        direction === "top"
            ? "bottom-full mb-2"
            : "top-full mt-2";

    const show = () => {
        if (disabled) return;
        timeoutRef.current = setTimeout(() => setVisible(true), delay);
    };

    const hide = () => {
        clearTimeout(timeoutRef.current);
        setVisible(false);
    };

    const toggle = () => {
        if (disabled) return;
        setVisible(v => !v);
    };

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={mode === "hover" ? show : undefined}
                onMouseLeave={mode === "hover" ? hide : undefined}
                onFocus={mode === "hover" ? show : undefined}
                onBlur={mode === "hover" ? hide : undefined}
                onClick={mode === "click" ? toggle : undefined}
            >
                {children}
            </div>

            <div
                className={`
                    absolute ${basePosition}
                    left-1/2 -translate-x-1/2
                    select-none
                    break-keep
                    text-sm rounded-md py-1 px-2 z-50
                    shadow-md
                    !w-fit
                    !min-w-fit
                    transition-all duration-150 ease-out
                    ${visible
                        ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 scale-95 translate-y-1 pointer-events-none"
                    }

                    ${theme === "light"
                        ? "text-textColor-300 bg-slate-100"
                        : "text-textColor-100 bg-textColor-300"}
                `}
            // style={{ maxWidth: "min(90vw, 20rem)" }}
            >
                {content}
            </div>
        </div>
    );
};

export default AppTooltip;
