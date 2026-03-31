import React, { useContext, useRef, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';

const generateOptions = (max) =>
    Array.from({ length: max + 1 }, (_, i) =>
        String(i).padStart(2, "0")
    );

const PageNumberInput = ({ initVal, max, onChange }) => {

    const { theme } = useContext(MainContext);

    const [value, setValue] = useState(initVal);
    const options = generateOptions(max);
    const [isOpen, setIsOpen] = useState(false);
    const pageOptionsRef = useRef(null);

    const handlePageNumberClick = (e) => {
        onChange(e.target.innerText);
        setValue(e.target.innerText);
        setIsOpen(false);
    };

    const handleInput = (e) => {
        let val = e.target.value.replace(/\D/g, "");

        // Allow clearing
        if (val === "") {
            setValue("");
            onChange("");
            return;
        }

        // Max 2 characters
        val = val.slice(0, 2);

        // Clamp to max
        if (Number(val) > max) {
            val = String(max);
        }

        setValue(val);
        onChange(val);
    };

    const handleBlur = () => {
        // If user leaves it empty → default to "1"
        if (value === "" || value == null) {
            setValue("1");
            onChange("1");
            return;
        }

        const padded = value.padStart(2, "0");
        setValue(padded);
        onChange(padded);
    };

    return (
        <div className="relative">
            <input
                value={value}
                onChange={handleInput}
                onBlur={handleBlur}
                onClick={() => setIsOpen(!isOpen)}
                className={`py-2 text-xs font-semibold text-center rounded-lg w-9 h-7 focus:outline-none focus:border-none focus:ring-2 focus:ring-purple-400 ${theme === 'light' ? 'bg-white !border text-textColor-200' : 'bg-textColor-300 text-textColor-100 !border !border-textColor-200/40'}`}
            />

            <div ref={pageOptionsRef} className={`absolute z-[9999] top-full left-0 w-full h-[100px] min-h-[100px] overflow-y-auto rounded-lg shadow-lg ${isOpen ? 'block' : 'hidden'} ${theme === 'light' ? 'bg-white !border text-textColor-200' : 'bg-textColor-300 text-textColor-100 !border !border-textColor-200/40'}`}>
                {/* <div className="flex flex-col items-center gap-1 p-2"> */}
                {options.map((opt) => (
                    <button
                        key={opt}
                        onClick={handlePageNumberClick}
                        className={`w-full py-2 text-xs ${theme === 'light' ? 'hover:bg-gray-100 text-gray-500' : 'text-textColor-100 hover:bg-textColor-200/40'}`}
                    >
                        {opt}
                    </button>
                ))}
                {/* </div> */}
            </div>
        </div>
    );
};

const PageNumbersPicker = ({ totalPages, setStart, setEnd }) => {

    const { theme } = useContext(MainContext);

    return (
        <div
            className={`p-3 rounded-2xl select-none flex items-center gap-4 w-fit ${theme === 'light'
                ? 'bg-white !border'
                : 'bg-textColor-300 !border !border-textColor-200/40'}`}
        >

            {/* FROM */}
            <div className="flex items-center justify-center gap-2">
                <span className={`w-10 text-xs font-medium ${theme === "light" ? "text-textColor-200" : "text-textColor-100"}`}>
                    From
                </span>

                <div className="flex items-center gap-1">
                    <PageNumberInput
                        initVal="1"
                        max={Number(totalPages)}
                        onChange={(v) => setStart(v)}
                    />
                </div>
            </div>

            {/* TO */}
            <div className="flex items-center justify-center gap-3">
                <span className={`w-10 text-xs font-medium ${theme === "light" ? "text-textColor-200" : "text-textColor-100"}`}>
                    To
                </span>

                <div className="flex items-center gap-1">
                    <PageNumberInput
                        initVal={String(totalPages)}
                        max={Number(totalPages)}
                        onChange={(v) => setEnd(v)}
                    />
                </div>
            </div>
        </div>
    );
};

export default PageNumbersPicker;