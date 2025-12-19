import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import useDragScroll from '../../hooks/useDragScroll.js';
import FadedText from '../FadedText';
import useChat from "../../hooks/useChat.js"

function HorizontalChatHistoryList({ cssClasses = "" }) {
    const { theme, chatHistory, currentChat, setCurrentChat } = useContext(MainContext);
    const {addNewChat} = useChat()

    function handleSingleChatSessionClick(chat) {
        if (currentChat.sessionId === chat.sessionId) {
            // close prev chat create new empty chat to future queries
            addNewChat(`New Chat ${chatHistory.length + 1}`)
        } else {
            setCurrentChat(chat);
        }
    }


    const dragRef = useDragScroll();

    return (
        // <div className="relative w-full">
        <div ref={dragRef} className={` w-full flex space-x-4 overflow-x-auto py-2 [&::-webkit-scrollbar]:h-2
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-900 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500'} cursor-grab active:cursor-grabbing touch-pan-y snap-mandatory
         ${cssClasses}`}>
            {/* horizontally scrollable list of chat sessions */}
            {
                chatHistory.map((chat, index) => {
                    return (
                        <FadedText twClasses={`${chat.sessionId === currentChat.sessionId && 'text-gradient-x font-bold'}`} handleClick={() => handleSingleChatSessionClick(chat)} key={index} text={chat.title} />
                    );
                })
            }


            {/* </div> */}
        </div>
    );
}

export default HorizontalChatHistoryList;