import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import FadedText from '../FadedText';

function HorizontalChatHistoryList({ cssClasses = "" }) {
    const { theme, chatHistory } = useContext(MainContext);
    return (
        <div className={`relative flex space-x-4 overflow-x-auto py-2 px-4 [&::-webkit-scrollbar]:h-2
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-900 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500'}
         ${cssClasses}`}>
            {/* horizontally scrollable list of chat sessions */}
            {
                chatHistory.map((chat, index) => {
                    return (
                        <FadedText key={index} text={chat.title} />
                    );
                })
            }

            {/* Right fade shadow */}
            <div className={`pointer-events-none absolute right-0 top-0 h-full w-16
                      bg-gradient-to-r from-transparent ${theme === 'light' ? 'to-background_workspace' : ''}`} />
        </div>
    );
}

export default HorizontalChatHistoryList;