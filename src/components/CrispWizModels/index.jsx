import React, { useContext, useRef, useState } from 'react';
import TuneIcon from '@mui/icons-material/Tune';
import { MainContext } from '../../contexts/mainContext';

const CrispWizModels = ({
    models,
    selectedModel,
    setSelectedModel,
}) => {

    const { theme } = useContext(MainContext);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const modelsDropdownRef = useRef(null);

    function toggleDropdown() {
        setIsDropdownOpen(!isDropdownOpen);
    }

    function handleModelChange(modelValue) {
        setSelectedModel(modelValue);
        setIsDropdownOpen(false);
    }


    return (
        <div className="relative">
            {/* Icon to toggle models dropdown */}
            <div onClick={toggleDropdown} className={`flex flex-col items-center cursor-pointer justify-center transition rounded-full h-10 w-10
${theme === 'light' ? 'hover:bg-textColor-100/20' : 'hover:bg-textColor-300/80'}`}>
                <TuneIcon className="cursor-pointer" />
            </div>

            {/* crisp wiz models dropdown */}
            {
                isDropdownOpen && (
                    <div ref={modelsDropdownRef} className={`absolute left-0 z-50 flex flex-col mt-2 overflow-x-hidden shadow-md w-fit rounded-2xl top-7 ${theme === "light" ? "border" : "!border !border-textColor-300"}`}>
                        {
                            models.map((model) => (
                                <div
                                    key={model.value}
                                    onClick={() => handleModelChange(model.value)}
                                    className={`
                                 cursor-pointer transition
                                 px-3 py-2
                                 text-nowrap
                                 flex items-center gap-3
                                 font-medium
                                ${theme === 'light' ? 'bg-neutral-50 hover:bg-neutral-200 text-textColor-200' : 'bg-zinc-800 hover:bg-textColor-300 text-[#EEE]'}
                            `}
                                >
                                    {model.icon}
                                    {model.name}
                                </div>
                            ))
                        }
                    </div>
                )
            }
        </div>
    );
};

export default CrispWizModels;