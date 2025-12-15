import React, { useContext, useEffect, useRef, useState } from 'react';
import HorizontalChatHistoryList from '../HorizontalChatHistoryList';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowUpOutlinedIcon from '@mui/icons-material/KeyboardArrowUpOutlined';
import { MainContext } from '../../contexts/mainContext';
import makeApiRequest from '../../api';
import ChatHistoryPopup from '../ChatHistoryPopup';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';

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

    const keyboardArrowUpRef = useRef(null);
    const ChatHistoryPopupRef = useRef(null);
    const [isChatHistoryPopupOpen, setIsChatHistoryPopupOpen] = useState(false);
    useEffect(() => {
        function handleClickOutside(event) {
            if (ChatHistoryPopupRef.current && !ChatHistoryPopupRef.current.contains(event.target) && keyboardArrowUpRef.current && !keyboardArrowUpRef.current.contains(event.target)) {
                // setIsUpdateFilenameModalOpen(false);
                setIsChatHistoryPopupOpen(false);
                // setHoveredSource(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    function closePopup() {
        setIsChatHistoryPopupOpen(false);
    }

    return (
        <div className={`flex items-center w-full max-w-full h-full`}>
            <div className="relative flex-1 w-[80%] ">
                <HorizontalChatHistoryList />
                {/* Right fade shadow */}
                <div className={`pointer-events-none absolute right-0 top-0 h-full w-16
                      bg-gradient-to-r from-transparent ${theme === 'light' ? 'to-background_workspace' : ''} `} />
            </div>
            <div className="flex gap-1 p-2 w-fit">
                <AddIcon onClick={createNewChat} className={`cursor-pointer ${theme === 'light' ? 'text-[#666]' : 'text-[#ABAEB4]'}`} />
                <div className="relative">
                    {isChatHistoryPopupOpen && <div ref={ChatHistoryPopupRef}> <ChatHistoryPopup twClasses={`absolute bottom-full right-0 h-[45vh] ${theme === 'light' ? 'shadow-[0px_0px_14px_-6px]' : 'shadow-[0px_0px_14px_-6px_#666]'} border-md`} close={closePopup} /> </div>}
                    <ScheduleOutlinedIcon ref={keyboardArrowUpRef} className={`cursor-pointer ${theme === 'light' ? 'text-[#666]' : 'text-[#ABAEB4]'}`} onClick={() => setIsChatHistoryPopupOpen(prev => !prev)} />
                </div>
            </div>
        </div>
    );
}

export default ChatHistory;