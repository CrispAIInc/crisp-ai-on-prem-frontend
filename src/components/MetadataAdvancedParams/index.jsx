import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// import Slider from '../Slider';
import MetadataVerbosity from '../MetadataVerbosity';
// import { useResizableSidebar } from '../../hooks/useResizableSidebar';


export default function MetadataAdvancedParams({
    // temperatureValue,
    // setTemperatureValue,
    // handleTemperatureChange,
    verbosityValue,
    handleChange, }) {

    // const { sidebarWidth, maxWidth } = useResizableSidebar(200, false);

    const [isDropdownMenuOpen, setIsDropdownMenuOpen] = useState(true);
    const { theme } = useContext(MainContext);
    const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);


    return (
        <div className='relative z-20 flex flex-col gap-2'>
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
                {/* <div className={`flex flex-col gap-0`}>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <p className={`select-none ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>Temperature</p>
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
                </div> */}

                {/* verbosity */}
                <div className={`flex flex-col gap-0`}>
                    {/* <div className="flex items-center gap-2">
                        <p className={`select-none ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`}>Verbosity</p>
                        <InfoTooltip tooltipText="Verbosity controls response length: higher gives more detail, lower gives less." />
                    </div> */}
                    <div>
                        <label className={` w-fit !relative ${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium flex items-center gap-1`}>
                            Verbosity
                            <InfoOutlinedIcon onMouseOver={() => setIsInfoTooltipOpen(true)} onMouseLeave={() => setIsInfoTooltipOpen(false)} className='!relative !w-5' style={{ color: `${theme === 'light' ? '#777' : '#ABAEB4'}` }} />
                            {isInfoTooltipOpen && <div className="absolute right-0 p-2 bg-background_workspace shadow-[0px_0px_30px_-2px_rgba(82,79,79,0.6)] rounded-md w-[300px] max-w-[300px] left-0 z-40 top-full">Choose the desired <span className="text-primary">quality</span> and <span className="text-primary">complexity</span> for your generated metadata. Higher quality may increase generation time.</div>}
                        </label>
                        <MetadataVerbosity verbosityValue={verbosityValue} setVerbosityValue={handleChange} />
                    </div>
                </div>
            </div>
        </div>
    );
}