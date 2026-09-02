import React, { useContext } from "react";
import { MainContext } from '../../contexts/mainContext';

export default function ToggleSwitch({ value, onChange }) {

    const { theme } = useContext(MainContext);

    return (
        <button
            onClick={() => onChange(!value)}
            className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 
        ${value ? "bg-gradient-to-br from-primary-200 to-primary-300" : `${theme === "light" ? "bg-gray-300" : "bg-textColor-200/40"}`}`}
        >
            <span
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 
          ${value ? "translate-x-6" : "translate-x-0"}`}
            />
        </button>
    );
}
