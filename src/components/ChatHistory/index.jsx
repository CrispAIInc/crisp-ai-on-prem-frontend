import React, { useContext, useState } from 'react';
import HorizontalChatHistoryList from '../HorizontalChatHistoryList';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import { MainContext } from '../../contexts/mainContext';

function ChatHistory() {
    const { theme } = useContext(MainContext);
    return (
        <div className={`flex items-center h-full`}>
            <HorizontalChatHistoryList cssClasses='flex-1' />
            <div className="flex justify-end p-2">
                <AddIcon className={`cursor-pointer ${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'}`} />
                <KeyboardArrowUpOutlinedIcon className={`cursor-pointer ${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'}`} />
            </div>
        </div>
    );
}

export default ChatHistory;