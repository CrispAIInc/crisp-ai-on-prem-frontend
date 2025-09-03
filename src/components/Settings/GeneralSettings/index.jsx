import React, { useContext } from 'react';
import ThemeToggle from '../../ThemeToggle';
import { MainContext } from '../../../contexts/mainContext';

function GeneralSettings() {
    const { theme } = useContext(MainContext);

    return (
        <div className="flex flex-col gap-5">
            {/* app theme switcher */}
            <div className="flex items-center justify-between">
                <h3 className={`text-[15px] ${theme === "light"
                    ? "text-textColor-300"
                    : "text-textColor-100"
                    }`}>Theme</h3>
                <ThemeToggle />
            </div>
        </div>
    );
}

export default GeneralSettings;