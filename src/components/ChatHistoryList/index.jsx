import React, { useState, useContext, useEffect } from 'react';
import { MainContext } from '../../contexts/mainContext';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';
import { formatChatHistoryByDate, formatReadableDate } from '../../utils';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import makeApiRequest from '../../api';

function ChatHistoryList({ closeChatHistory }) {
    const { theme, chatHistory } = useContext(MainContext);
    const { sidebarWidth } = useResizableSidebar(200, true);

    console.log(chatHistory);

    const CHATHISTORY_MOCK = [
        {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2025-12-08",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2025-12-07"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2025-12-06",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2025-10-02"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2025-10-01",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2025-10-02"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01",
        },
        {
            id: 2,
            title: "last",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02"
        },
    ];

    // Format and group the chats by date using the util
    const grouped = formatChatHistoryByDate(chatHistory, { dateKey: 'timestamp', returnAsArray: true });
    console.log(grouped);


    return (
        <div className={`p-4 w-[30vw] ${theme === 'light' ? "text-textColor-300 bg-[#f0f0f0]" : "text-textColor-100 bg-textColor-300"} flex-1 flex flex-col gap-3 overflow-hidden`}>
            <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-0 top-40 -z-1 blur-[160px]"></div>
            <div className="w-56 h-56 bg-pink-300 rounded-full absolute left-1/2 top-80 -z-1 blur-[160px]"></div>

            <div className="flex items-center justify-between">
                <h5 className='mb-0 '>Chat history</h5>
                <KeyboardReturnIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} className="cursor-pointer " onClick={closeChatHistory} />
            </div>

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
                                <div key={`${chat.id || 'chat'}-${idx}`} className={`p-2 rounded-md cursor-pointer ${theme === 'light' ? "hover:bg-[#f7f7f7]/50" : "hover:bg-textColor-200/50"} `}>
                                    <h6 className='font-semibold !mb-0 truncate '>{chat.title}</h6>
                                    {/* <div className="flex items-center justify-between">
                                        <div className="text-xs truncate text-textColor-400">{chat.lastMessage}</div>
                                        <div className="flex items-center gap-1 ml-2 text-xs text-textColor-400">
                                            <AccessTimeOutlinedIcon style={{ fontSize: 14, color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                            <span>{chat.timestamp ? formatReadableDate(chat.timestamp) : ''}</span>
                                        </div>
                                    </div> */}
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