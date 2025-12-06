import React, { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';

function ChatHistoryList({ closeChatHistory }) {
    const { theme } = useContext(MainContext);
    const { sidebarWidth } = useResizableSidebar(200, true);

    const CHATHISTORY_MOCK = [
        {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01 10:30 AM",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02 02:15 PM"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01 10:30 AM",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02 02:15 PM"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01 10:30 AM",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02 02:15 PM"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01 10:30 AM",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02 02:15 PM"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01 10:30 AM",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02 02:15 PM"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01 10:30 AM",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02 02:15 PM"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01 10:30 AM",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02 02:15 PM"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01 10:30 AM",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02 02:15 PM"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01 10:30 AM",
        },
        {
            id: 2,
            title: "Discussion on Marketing Strategy",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02 02:15 PM"
        }, {
            id: 1,
            title: "Chat about Project Alpha",
            lastMessage: "Can you provide an update on the timeline?",
            timestamp: "2023-10-01 10:30 AM",
        },
        {
            id: 2,
            title: "last",
            lastMessage: "Let's schedule a meeting for next week.",
            timestamp: "2023-10-02 02:15 PM"
        },
    ];

    return (
        <div style={{ width: sidebarWidth }} className={`p-4 ${theme === 'light' ? "text-textColor-300 bg-[#f0f0f0]" : "text-textColor-100 bg-textColor-300"} flex-1 flex flex-col gap-3 overflow-y-hidden`}>
            <div className="flex items-center justify-between">
                <h5 className='mb-0 '>Chat history</h5>
                <KeyboardReturnIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} className="cursor-pointer " onClick={closeChatHistory} />
            </div>

            <div className="flex flex-col flex-1 mt-4 overflow-y-auto">
                {CHATHISTORY_MOCK.map((chat) => (
                    <div key={chat.id} className={`p-1 rounded-md cursor-pointer ${theme === 'light' ? "hover:bg-[#e0e0e0]" : "hover:bg-textColor-200"} `}>
                        <h6 className='font-semibold !mb-0 truncate '>{chat.title}</h6>
                        <span className='text-xs text-textColor-400'>{chat.timestamp}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ChatHistoryList;