import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';

import Slider from '../Slider';
import MetadataVerbosity from '../MetadataVerbosity';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';
import InfoTooltip from '../InfoTooltip';


export default function MetadataAdvancedParams({ temperatureValue,
    setTemperatureValue,
    handleTemperatureChange,
    verbosityValue,
    setVerbosityValue,
    handleChange, }) {

    const { sidebarWidth, maxWidth } = useResizableSidebar(200, false);

    const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(true);
    const { theme } = useContext(MainContext);



    return (
        <div className='flex flex-col gap-4'>
            {/* collapser */}
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setIsDropdownMenuOpen(!isDropdownMenuOpen)}>
                <p className={`select-none font-bold ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>Advanced settings</p>
                <svg
                    className={`w-4 mx-2 transform ${isDropdownMenuOpen ? "rotate-180" : "rotate-0"
                        }`}
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke={`${theme === 'light' ? 'currentColor' : 'white'}`}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>

            <div className={`flex flex-col gap-0 ${isDropdownMenuOpen ? 'block' : 'hidden'}`}>
                {/* temperature */}
                <div className={`flex flex-col gap-0`}>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <p className={`select-none ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>Temperature</p>
                            {/* <InfoTooltip tooltipText="Temperature adjusts how random the text is. Higher means more creative, lower means more predictable." /> */}
                        </div>
                        <input
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            value={temperatureValue}
                            onChange={handleTemperatureChange}
                            className={`w-16 p-1 bg-background_workspace rounded-md ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                        />
                    </div>
                    <div className={`${sidebarWidth === maxWidth && '!w-2/3 !mx-auto'}`}>
                        <Slider temperatureValue={temperatureValue} setTemperatureValue={setTemperatureValue} />
                    </div>
                </div>

                {/* verbosity */}
                <div className={`flex flex-col gap-0`}>
                    <div className="flex items-center gap-2">
                        <p className={`select-none ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>Verbosity</p>
                        {/* <InfoTooltip tooltipText="Verbosity controls response length: higher gives more detail, lower gives less." /> */}
                    </div>
                    <MetadataVerbosity verbosityValue={verbosityValue} setVerbosityValue={handleChange} />
                </div>
            </div>
        </div>
    );
}