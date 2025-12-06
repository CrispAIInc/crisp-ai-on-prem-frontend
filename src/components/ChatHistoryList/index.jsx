import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';

function ChatHistoryList({ closeChatHistory }) {
    const { theme } = useContext(MainContext);
    const { sidebarWidth } = useResizableSidebar(200, true);

    return (
        <div style={{ width: sidebarWidth }} className={`p-4 ${theme === 'light' ? "text-textColor-300 bg-[#f0f0f0]" : "text-textColor-100 bg-textColor-300"} flex-1 flex flex-col gap-3`}>
            <div className="flex items-center justify-between">
                <h5 className='mb-0 '>Chat history</h5>
                <KeyboardReturnIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} className="cursor-pointer " onClick={closeChatHistory} />
            </div>
        </div>
    );
}

export default ChatHistoryList;