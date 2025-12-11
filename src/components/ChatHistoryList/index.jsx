import React, { useState, useContext, useEffect } from 'react';
import { MainContext } from '../../contexts/mainContext';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { formatChatHistoryByDate, formatReadableDate } from '../../utils';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import makeApiRequest from '../../api';

function ChatHistoryList({ closeChatHistory }) {
    const { theme, chatHistory, setCurrentChat, workspaceContainer } = useContext(MainContext);

    console.log(chatHistory);

    async function createNewChat() {
        try {
            setCurrentChat([]);
            workspaceContainer.current.scrollTo({
                top: 0,
                behavior: "smooth", // Enables smooth scrolling
            });
            const { success, sessionId, title, message, messages, userId } = await makeApiRequest('/new-chat');
            if (success) {
                // Handle new chat creation logic here
                console.log('New chat created:', { sessionId, title, message });
                setCurrentChat({ sessionId, title, userId, messages });
            } else {
                throw new Error('Failed to create new chat');
            }
        } catch (error) {
            console.log(error?.message);
        } finally {
            closeChatHistory && closeChatHistory();
        }
    }

    // Format and group the chats by date using the util
    const grouped = formatChatHistoryByDate(chatHistory, { dateKey: 'timestamp', returnAsArray: true });

    function handleSingleChatSessionClick(chat) {
        setCurrentChat(chat);
        closeChatHistory && closeChatHistory();
    }


    return (
        <div className={`p-4 w-[30vw] ${theme === 'light' ? "text-textColor-300 bg-[#f0f0f0]" : "text-textColor-100 bg-textColor-300"} flex-1 flex flex-col gap-3 overflow-hidden`}>
            <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-0 top-40 -z-1 blur-[160px]"></div>
            <div className="w-56 h-56 bg-pink-300 rounded-full absolute left-1/2 top-80 -z-1 blur-[160px]"></div>

            <div className="flex items-center justify-between">
                <h5 className='mb-0 '>Chat history</h5>
                <KeyboardReturnIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} className="cursor-pointer " onClick={closeChatHistory} />
            </div>

            <button className={`px-3 py-2 w-full rounded-md ${theme === 'light' ? "bg-white text-textColor-300 hover:bg-[#e6e6e6]" : "bg-textColor-200 text-textColor-100 hover:bg-textColor-400"} `} onClick={createNewChat}>New Chat</button>

            <div className="z-50 flex flex-col flex-1 mt-4 overflow-y-auto">
                {grouped.map(group => (
                    <div key={group.key} className="mb-4">
                        <div className="sticky top-0 px-1 py-1 bg-transparent">
                            <h6 className="mb-1 text-sm font-semibold">{group.label} {group.items.length > 0 && <span className="text-xs text-textColor-400">({group.items.length})</span>}</h6>
                        </div>

                        {group.items.length === 0 ? (
                            <div className="px-2 text-xs text-textColor-400">No chats</div>
                        ) : (
                            group.items.map((chat, idx) => (
                                <div key={`${chat.id || 'chat'}-${idx}`} className={`flex items-center  py-2 pr-2 rounded-md cursor-pointer ${theme === 'light' ? "hover:bg-[#f7f7f7]/50" : "hover:bg-textColor-200/50"} `} onClick={() => handleSingleChatSessionClick(chat)}>
                                    <MoreVertOutlinedIcon className={`${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'} cursor-pointer`} />
                                    <h6 className='font-semibold !mb-0 fex-1 truncate '>{chat.title}</h6>
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChatHistoryList;