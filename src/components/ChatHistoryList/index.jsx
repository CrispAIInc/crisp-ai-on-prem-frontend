import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

function ChatHistoryList() {
    const { theme } = useContext(MainContext);

    return (
        <div className={`p-4 w-[30vw] ${theme === 'light' ? "text-textColor-300 bg-[#f0f0f0]" : "text-textColor-100 bg-textColor-300"} flex-1 flex flex-col gap-3`}>ChatHistoryList</div>
    );
}

export default ChatHistoryList;