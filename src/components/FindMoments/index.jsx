import React, { useContext, useState } from 'react';
import RippleButton from '../RippleButton';
import { MainContext } from '../../contexts/mainContext';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

const FindMoments = () => {

    const {
        theme
    } = useContext(MainContext);

    const [prompt, setPrompt] = useState("");

    return (
        <div className="flex flex-col h-full  gap-2 overflow-y-hidden">
            <div className={`flex items-center gap-2 w-full pr-2 pb-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md text-textColor-100" : '!border !border-textColor-100 text-textColor-300'} rounded-md focus-within:ring-1 focus-within:ring-primaryColor/50`}>
                <textarea
                    rows={2}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Add more instructions for better results (optional)"
                    className={`w-full p-2 bg-transparent resize-none focus:outline-none`}
                />
                <RippleButton cssClasses="rounded-md !py-2 !px-3 !pr-4 self-end flex items-center gap-1">
                    <SearchOutlinedIcon className={`text-white text-sm`} />
                    <span className="text-sm">Find</span>
                </RippleButton>
            </div>
        </div>
    );
};

export default FindMoments;