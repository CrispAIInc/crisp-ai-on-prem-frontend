// import React, { useContext } from 'react';
// import { MainContext } from "../../contexts/mainContext";

// const AppTooltip = ({ content, direction = "top" }) => {
//     const { theme } = useContext(MainContext);
//     return (
//         <div className={`absolute ${direction === 'top' ? 'bottom-full left-1/2 transform -translate-x-1/2 mb-2' : 'top-full left-1/2 transform -translate-x-1/2 mt-2'} text-sm rounded-md py-1 px-2 z-50 ${theme === "light" ? "text-textColor-300 bg-textColor-200" : "text-textColor-100 bg-textColor-300"} shadow-lg max-w-xs whitespace-normal break-words
// `}>
//             {content}
//         </div>
//     );
// };

// export default AppTooltip;

import React, { useContext } from "react";
import { MainContext } from "../../contexts/mainContext";

const AppTooltip = ({ content, direction = "top" }) => {
    const { theme } = useContext(MainContext);

    const basePosition =
        direction === "top"
            ? "bottom-full mb-2"
            : "top-full mt-2";

    return (
        <div
            className={`
        absolute ${basePosition}
        left-1/2 -translate-x-1/2
        select-none
        max-w-xs
        whitespace-normal break-words
        text-sm rounded-md py-1 px-2 z-50
        ${theme === "light"
                    ? "text-textColor-300 bg-slate-100"
                    : "text-textColor-100 bg-textColor-300"}
        shadow-md
      `}
            style={{
                maxWidth: "min(90vw, 20rem)", // 👈 prevents viewport overflow
            }}
        >
            {content}
        </div>
    );
};

export default AppTooltip;
