import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import FadedText from '../FadedText';

function HorizontalChatHistoryList({ cssClasses = "" }) {
    const { theme, chatHistory, setCurrentChat } = useContext(MainContext);

    function handleSingleChatSessionClick(chat) {
        setCurrentChat(chat);
    }

    return (
        // <div className="relative w-full">
        <div className={` w-full flex space-x-4 overflow-x-auto py-2 [&::-webkit-scrollbar]:h-2
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-900 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500'}
         ${cssClasses}`}>
            {/* horizontally scrollable list of chat sessions */}
            {
                chatHistory.map((chat, index) => {
                    return (
                        <FadedText handleClick={() => handleSingleChatSessionClick(chat)} key={index} text={chat.title} />
                    );
                })
            }


            {/* </div> */}
        </div>
    );
}

export default HorizontalChatHistoryList;