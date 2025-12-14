import React, { useContext, useState } from 'react';
import HorizontalChatHistoryList from '../HorizontalChatHistoryList';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import { MainContext } from '../../contexts/mainContext';
import makeApiRequest from '../../api';
import ChatHistoryPopup from '../ChatHistoryPopup';

function ChatHistory() {
    const { theme, setCurrentChat, setChatHistory, workspaceContainer } = useContext(MainContext);

    async function createNewChat() {
        try {
            setCurrentChat([]);
            workspaceContainer.current.scrollTo({
                top: 0,
                behavior: "smooth", // Enables smooth scrolling
            });
            const { success, sessionId, title, message, messages, userId } = await makeApiRequest('/new-chat');
            if (success) {
                const createdAt = new Date();
                const updatedAt = new Date();
                // Handle new chat creation logic here
                setCurrentChat({ sessionId, title, userId, messages: messages || [], created_at: createdAt, updated_at: updatedAt });
                setChatHistory(prev => ([
                    {
                        sessionId,
                        title,
                        messages: messages || [],
                        userId,
                        created_at: createdAt,
                        updated_at: updatedAt,
                    },
                    ...prev,
                ]));
            } else {
                throw new Error('Failed to create new chat');
            }
        } catch (error) {
            console.log(error?.message);
        }
    }

    return (
        <div className={`flex items-center w-full max-w-full h-full`}>
            <div className="relative flex-1 w-[80%] ">
                <HorizontalChatHistoryList cssClasses='' />
                {/* Right fade shadow */}
                <div className={`pointer-events-none absolute right-0 top-0 h-full w-16
                      bg-gradient-to-r from-transparent ${theme === 'light' ? 'to-background_workspace' : ''} `} />
            </div>
            <div className="flex p-2 w-fit">
                <AddIcon onClick={createNewChat} className={`cursor-pointer ${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'}`} />
                <div className="relative">
                    <ChatHistoryPopup twClasses="absolute !z-[99999]  bottom-full right-0 h-[45vh] bg-white shadow-[0px_0px_14px_-6px] border-md" />
                    <KeyboardArrowUpOutlinedIcon className={`cursor-pointer ${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'}`} />
                </div>
            </div>
        </div>
    );
}

export default ChatHistory;