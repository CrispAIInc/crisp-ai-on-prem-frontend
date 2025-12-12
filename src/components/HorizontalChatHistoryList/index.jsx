import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import FadedText from '../FadedText';

function HorizontalChatHistoryList() {
    const { chatHistory } = useContext(MainContext);
    return (
        <div className="flex space-x-4 overflow-x-auto py-2 px-4 border border-white">
            {/* horizontally scrollable list of chat sessions */}
            {
                chatHistory.map((chat, index) => {
                    return (
                        <FadedText key={index} text={chat.title} />
                    );
                })
            }

            {/* icon to add new chat */}

            {/* icon to show all chat sessions grouped by date */}
        </div>
    );
}

export default HorizontalChatHistoryList;