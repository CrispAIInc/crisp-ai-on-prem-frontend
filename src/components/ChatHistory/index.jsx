import React, { useContext, useState } from 'react';
import HorizontalChatHistoryList from '../HorizontalChatHistoryList';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import { MainContext } from '../../contexts/mainContext';

function ChatHistory() {
    const { theme } = useContext(MainContext);
    return (
        <div className={`flex items-center w-full max-w-full h-full`}>
            <div className="relative flex-1 w-[80%] ">
                <HorizontalChatHistoryList cssClasses='' />
                {/* Right fade shadow */}
                <div className={`pointer-events-none absolute right-0 top-0 h-full w-16
                      bg-gradient-to-r from-transparent ${theme === 'light' ? 'to-background_workspace' : ''} `} />
            </div>
            <div className="flex p-2 w-fit">
                <AddIcon className={`cursor-pointer ${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'}`} />
                <KeyboardArrowUpOutlinedIcon className={`cursor-pointer ${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'}`} />
            </div>
        </div>
    );
}

export default ChatHistory;