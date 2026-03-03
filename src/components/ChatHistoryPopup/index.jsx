import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import { MainContext } from '../../contexts/mainContext';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import makeApiRequest from '../../api';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ChatTitleUpdaterModal from '../ChatTitleUpdaterModal';
import toast from 'react-simple-toasts';
import LoadingSpinner from '../LoadingSpinner';
import { formatChatHistoryByDate } from '../../utils';
import { useFilter } from '../../hooks/useFilter';
import useChat from '../../hooks/useChat';
import { useGlowingBorder } from '../../hooks/useGlowingBorder';
import { useToast } from '../../contexts/toastContext';
import { ProjectContext } from '../../contexts/projectContext';

function ChatHistoryPopup({ close, twClasses = '', chatTitleUpdaterModalRef, createNewChat, crispWizInputContainerRef, crispWizInputRef }) {

    const { isSharedProject } = useContext(ProjectContext);

    const { theme, chatHistory, setChatHistory, setCurrentChat } = useContext(MainContext);

    const { notify } = useToast();

    const { updateChatTitle, deleteChat } = useChat();

    const triggerGlow = useGlowingBorder(crispWizInputContainerRef);

    let {
        query,
        setQuery,
        filteredItems: filteredChatSessions,
    } = useFilter(chatHistory, (chat, query) =>
        chat.title.toLowerCase().includes(query.toLowerCase())
    );
    // Format and group the chats by date using the util
    const grouped = useMemo(() => {
        return formatChatHistoryByDate(filteredChatSessions, {
            dateKey: "updated_at",
            returnAsArray: true,
        });
    }, [filteredChatSessions, JSON.stringify(filteredChatSessions), filteredChatSessions.length]);

    function handleSingleChatSessionClick(chat) {
        setCurrentChat(chat);
        // auto-focus on the input
        crispWizInputRef.current.focus();
        // 3. Add border glowing effect
        triggerGlow();
        close && close();
    }

    const [contextMenuChatId, setContextMenuChatId] = useState(null);
    function handleContextMenuOpen(e, chatId) {
        e.stopPropagation();
        e.preventDefault();
        // Implement context menu logic here
        setContextMenuChatId(prev => (prev === chatId ? null : chatId));
    }

    const dropdownRef = useRef(null);
    const popupRef = useRef(null);
    const modalRef = useRef(null);


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
    useEffect(() => {
        function handleClickOutsidePopup(event) {
            const popup = popupRef.current;
            const modal = modalRef.current;

            if (
                popup &&
                !popup.contains(event.target) &&   // not dropdown
                (!modal || !modal.contains(event.target)) // not modal
            ) {
                // setIsUpdateFilenameModalOpen(false);
                close();
                // setHoveredSource(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutsidePopup);
        return () => {
            document.removeEventListener("mousedown", handleClickOutsidePopup);
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
    async function handleUpdateChatTitle() {
        try {
            setIsLoading(true);

            if (!updatingChat) {
                throw new Error('No chat selected for updating title');
            }

            const { success, message } = await updateChatTitle(chatTitle, updatingChat.sessionId);

            if (success) {
                notify({
                    variant: "success",
                    heading: "Source renamed successfully!",
                });
                setIsUpdateChatTitleModalOpen(false);
            } else {
                throw new Error(message || 'Failed to rename the source');
            }
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Renaming failed!",
                subheading: error.message || 'Failed to rename the source',
            });
        } finally {
            setIsLoading(false);
        }
    }

    const [isDeleteLoading, setIsDeleteLoading] = useState(false);
    async function handleDeleteChat(event, chatsToDelete) {
        try {
            event.stopPropagation();
            // if chat has not been saved to DB, delete it locally without calling the endpoing
            if (chatsToDelete[0]?.isTemp) {
                setChatHistory(prev =>
                    prev.filter(
                        item => item.sessionId !== chatsToDelete[0].sessionId
                    )
                );
                return;
            }
            setIsDeleteLoading(true);
            const { success, message } = await deleteChat(chatsToDelete.map(chat => chat?.sessionId));
            if (success) {
                notify({
                    variant: "success",
                    heading: "Chat deleted successfully!",
                });
            } else {
                throw new Error(message || 'Failed to delete chat');
            }
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Deleting failed!",
                subheading: error.message || 'Failed to delete the chat',
            });
        } finally {
            setIsDeleteLoading(false);
        }
    }



    return (
        <div ref={popupRef} className={` p-2 w-[20vw] ${theme === 'light' ? "text-textColor-300 bg-white" : "text-textColor-100 !bg-textColor-300"} flex-1 flex flex-col gap-3 overflow-hidden ${twClasses} z-50`}>
            {/* <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-0 top-40 -z-1 blur-[160px]"></div>
            <div className="w-56 h-56 bg-pink-300 rounded-full absolute left-1/2 top-80 -z-1 blur-[160px]"></div> */}

            <button className={`px-3 py-2 w-full rounded-md ${theme === 'light' ? "bg-[#e6e6e6]/50  hover:bg-[#e6e6e6]" : "bg-textColor-200  hover:bg-textColor-200"} font-semibold text-xs`} onClick={createNewChat}>New Chat</button>

            <input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search..."
                className={`w-full p-2 font-semibold rounded-md text-xs outline-none  ${theme === 'light' ? '!border !border-textColor-100/50 bg-transparent' : 'bg-textColor-300 !border !border-textColor-200'} `}
            />

            <div className="z-50 flex flex-col flex-1 overflow-y-auto">
                {grouped.map(group => (
                    <div key={group.key} className="mb-4">
                        <div className={`sticky top-0 px-1 py-1 z-10 ${theme === 'light' ? 'bg-white' : 'bg-textColor-300'}`}>
                            <h6 className="mb-1 text-xs font-semibold text-gradient-x">{group.label} {group.items.length > 0 && <span className="text-xs text-textColor-400">({group.items.length})</span>}</h6>
                        </div>

                        {group.items.length === 0 ? (
                            <div className="px-2 text-xs text-textColor-400">No chats</div>
                        ) : (
                            group.items.map((chat, idx) => (
                                <div key={`${chat.id || 'chat'}-${idx}`} className={`relative flex items-center  py-2 pr-2 rounded-md cursor-pointer ${theme === 'light' ? "hover:bg-[#f7f7f7]/50" : "hover:bg-textColor-200/50"} `} onClick={() => handleSingleChatSessionClick(chat)}>
                                    {contextMenuChatId === chat?.sessionId && <div ref={dropdownRef} className={` absolute left-0 top-full z-20 flex flex-col p-1 rounded-md shadow-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                                        <div className={`flex gap-2 py-2 pr-10 pl-1 font-medium text-left ${theme === "light" ? 'hover:bg-textColor-100/15' : 'text-textColor-100 hover:bg-slate-800/50'}`}
                                            onClick={(event) => handleOpenFilenameUpdateModal(event, chat)}>
                                            <EditOutlinedIcon
                                                className={`cursor-pointer ${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'}`}
                                            />
                                            <span>Rename</span>
                                        </div>
                                        <div className={`flex gap-2 py-2 pr-10 pl-1 font-medium text-left ${theme === "light" ? 'hover:bg-textColor-100/15' : ' hover:bg-slate-800/40'} text-red-400`} onClick={(event) => { event.stopPropagation(); handleDeleteChat(event, [chat]); }}>
                                            {isDeleteLoading ? <LoadingSpinner isDeleting isSmall /> : <DeleteOutlineOutlinedIcon
                                                className={`cursor-pointer`}
                                            />}
                                            <span>Delete</span>
                                        </div>
                                    </div>}
                                    {!isSharedProject && (
                                        <MoreVertOutlinedIcon className={`${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'} cursor-pointer text-xs`} onClick={e => handleContextMenuOpen(e, chat?.sessionId)} />
                                    )
                                    }
                                    <h6 className='font-semibold text-xs !mb-0 fex-1 truncate ' title={chat.title}>{chat.title}</h6>
                                </div>
                            ))
                        )}
                    </div>
                ))}
            </div>
            {isUpdateChatTitleModalOpen && <div ref={chatTitleUpdaterModalRef}><ChatTitleUpdaterModal modalRef={modalRef} isLoading={isLoading} show={isUpdateChatTitleModalOpen} onHide={() => setIsUpdateChatTitleModalOpen(false)} value={chatTitle} setValue={setChatTitle} updateValue={handleUpdateChatTitle} /></div>}
        </div>
    );
}

export default ChatHistoryPopup;