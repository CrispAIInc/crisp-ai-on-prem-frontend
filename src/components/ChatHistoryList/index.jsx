import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import { MainContext } from '../../contexts/mainContext';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { formatChatHistoryByDate, formatReadableDate } from '../../utils';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import makeApiRequest from '../../api';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ChatTitleUpdaterModal from '../ChatTitleUpdaterModal';
import './ChatHistoryList.css';
import toast from 'react-simple-toasts';
import LoadingSpinner from '../LoadingSpinner';

function ChatHistoryList({ closeChatHistory }) {
    const { theme, chatHistory, currentChat, setChatHistory, setCurrentChat, workspaceContainer } = useContext(MainContext);

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
                setCurrentChat({ sessionId, title, userId, messages: messages || [] });
                setChatHistory(prev => ([
                    {
                        sessionId,
                        title,
                        messages: messages || [],
                        userId,
                        created_at: new Date(),
                        updated_at: new Date(),
                    },
                    ...prev,
                ]));
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
    const grouped = useMemo(() => {
        return formatChatHistoryByDate(chatHistory, {
            dateKey: "updated_at",
            returnAsArray: true,
        });
    }, [chatHistory, JSON.stringify(chatHistory), chatHistory.length]);

    function handleSingleChatSessionClick(chat) {
        setCurrentChat(chat);
        closeChatHistory && closeChatHistory();
    }

    const [contextMenuChatId, setContextMenuChatId] = useState(null);
    function handleContextMenuOpen(e, chatId) {
        e.stopPropagation();
        e.preventDefault();
        console.log(chatId);
        // Implement context menu logic here
        setContextMenuChatId(chatId);
    }

    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // setIsUpdateFilenameModalOpen(false);
                setContextMenuChatId(null);
                // setHoveredSource(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const [chatTitle, setChatTitle] = useState('');
    const [isUpdateChatTitleModalOpen, setIsUpdateChatTitleModalOpen] = useState(false);
    const [updatingChat, setUpdatingChat] = useState(null);
    function handleOpenFilenameUpdateModal(event, chat) {
        event.stopPropagation();
        setChatTitle(chat?.title?.trim() || '');
        setUpdatingChat(chat);
        setIsUpdateChatTitleModalOpen(true);
    }

    const [isLoading, setIsLoading] = useState(false);
    async function updateChatTitle() {
        try {
            setIsLoading(true);
            if (!chatTitle || chatTitle.trim().length === 0) {
                throw new Error('Chat title cannot be empty');
            }
            if (!updatingChat) {
                throw new Error('No chat selected for updating title');
            }
            const { success, message, title } = await makeApiRequest('/update-session-title', 'PUT', JSON.stringify({
                sessionId: updatingChat?.sessionId,
                title: chatTitle.trim(),
            }));
            if (success) {
                toast('Source renamed successfully', { className: `p-2 rounded-md bg-green-600 text-white`, theme });
                // Refresh chat history or update state accordingly
                // setCurrentChat(prev => ({
                //     ...prev,
                //     title: title.trim(),
                // }));
                setChatHistory(prev =>
                    prev.map(chat =>
                        chat.sessionId === updatingChat.sessionId
                            ? { ...chat, title: title.trim() }
                            : chat
                    )
                );
                setIsUpdateChatTitleModalOpen(false);
            } else {
                throw new Error(message || 'Failed to rename the source');
            }
        } catch (error) {
            console.log(error);
            toast(error.message || 'Failed to rename the source', { className: `p-2 rounded-md bg-red-600 text-white`, theme });
        } finally {
            setIsLoading(false);
        }
    }

    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    async function deleteChat(event, chatsToDelete) {
        try {
            event.stopPropagation();
            setIsDeleteLoading(true);
            const { success, message } = await makeApiRequest('/chat-history', 'DELETE', JSON.stringify({
                session_ids: chatsToDelete.map(chat => chat?.sessionId),
            }));
            if (success) {
                toast('Chat deleted successfully', { className: `p-2 rounded-md bg-green-600 text-white`, theme });
                // Refresh chat history or update state accordingly
                // setCurrentChat(prev => {
                //     if (chatsToDelete.some(chat => chat?.sessionId=== prev?.sessionId)) {
                //         return [];
                //     }
                //     return prev;
                // });
                setChatHistory(prev =>
                    prev.filter(chat => !chatsToDelete.some(toDelete => toDelete?.sessionId === chat?.sessionId))
                );
                // If the current chat is deleted, clear it
                if (chatsToDelete.some(chat => chat?.sessionId === currentChat?.sessionId)) {
                    setCurrentChat([]);
                }
            } else {
                throw new Error(message || 'Failed to delete chat');
            }
        } catch (error) {
            console.log(error);
            toast(error.message || 'Failed to delete chat', { className: `p-2 rounded-md bg-red-600 text-white`, theme });
        } finally {
            setIsDeleteLoading(false);
        }
    }


    return (
        <div className={`z-50 p-4 w-[30vw] ${theme === 'light' ? "text-textColor-300 bg-[#f0f0f0]" : "text-textColor-100 bg-textColor-300"} flex-1 flex flex-col gap-3 overflow-hidden`}>
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
                                <div key={`${chat.id || 'chat'}-${idx}`} className={`relative flex items-center  py-2 pr-2 rounded-md cursor-pointer ${theme === 'light' ? "hover:bg-[#f7f7f7]/50" : "hover:bg-textColor-200/50"} `} onClick={() => handleSingleChatSessionClick(chat)}>
                                    {contextMenuChatId === chat?.sessionId && <div ref={dropdownRef} className={` absolute left-0 top-full z-10 flex flex-col p-1 rounded-md shadow-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                                        <div className={`flex gap-2 py-2 pr-10 pl-1 font-medium text-left ${theme === "light" ? 'hover:bg-textColor-100/15' : 'text-textColor-100 hover:bg-slate-800/50'}`}
                                            onClick={(event) => handleOpenFilenameUpdateModal(event, chat)}>
                                            <EditOutlinedIcon
                                                className={`cursor-pointer ${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'}`}
                                            />
                                            <span>Rename</span>
                                        </div>
                                        <div className={`flex gap-2 py-2 pr-10 pl-1 font-medium text-left ${theme === "light" ? 'hover:bg-textColor-100/15' : ' hover:bg-slate-800/40'} text-red-400`} onClick={(event) => { event.stopPropagation(); deleteChat(event, [chat]); }}>
                                            {isDeleteLoading ? <LoadingSpinner isDeleting isSmall /> : <DeleteOutlineOutlinedIcon
                                                className={`cursor-pointer`}
                                            />}
                                            <span>Delete</span>
                                        </div>
                                    </div>}
                                    <MoreVertOutlinedIcon className={`${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'} cursor-pointer`} onClick={e => handleContextMenuOpen(e, chat?.sessionId)} />
                                    <h6 className='font-semibold !mb-0 fex-1 truncate '>{chat.title}</h6>
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </div>
            {isUpdateChatTitleModalOpen && <ChatTitleUpdaterModal isLoading={isLoading} show={isUpdateChatTitleModalOpen} onHide={() => setIsUpdateChatTitleModalOpen(false)} value={chatTitle} setValue={setChatTitle} updateValue={updateChatTitle} />}
        </div>
    );
}

export default ChatHistoryList;