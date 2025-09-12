import React from "react";

export default function ToggleSwitch({ value, onChange }) {
    return (
        <button
            onClick={() => onChange(!value)}
            className={`relative w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-300 
        ${value ? "bg-gradient-to-r from-purple-500 to-pink-500" : "bg-gray-300"}`}
        >
            <span
                className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 
          ${value ? "translate-x-6" : "translate-x-0"}`}
            />
        </button>
    );
}
