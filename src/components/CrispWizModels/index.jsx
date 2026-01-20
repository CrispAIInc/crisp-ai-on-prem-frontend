import React, { useContext } from 'react';
import TuneIcon from '@mui/icons-material/Tune';
import { MainContext } from '../../contexts/mainContext';

const CrispWizModels = ({
    models,
    selectedModel,
    setSelectedModel,
}) => {

    const { theme } = useContext(MainContext);

    return (
        <div>
            <div className={`flex flex-col items-center cursor-pointer justify-center transition rounded-full h-10 w-10
${theme === 'light' ? 'hover:bg-textColor-100/40' : 'hover:bg-textColor-300/30'}`}>
                <TuneIcon className="cursor-pointer" />
            </div>
        </div>
    );
};

export default CrispWizModels;