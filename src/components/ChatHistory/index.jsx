import React, { useContext, useEffect, useRef, useState } from 'react';
import HorizontalChatHistoryList from '../HorizontalChatHistoryList';
import AddIcon from '@mui/icons-material/Add';
import KeyboardArrowLeftOutlinedIcon from '@mui/icons-material/KeyboardArrowLeftOutlined';
import { MainContext } from '../../contexts/mainContext';
import makeApiRequest from '../../api';
import ChatHistoryPopup from '../ChatHistoryPopup';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { generateRandomId } from '../../utils';
import { AuthContext } from '../../contexts/authContext';

function ChatHistory() {
    const { theme, setCurrentChat, chatHistory, setChatHistory, workspaceContainer } = useContext(MainContext);

    const { user } = useContext(AuthContext);

    const [isHorizontalChatHistoryVisibile, setIsHorizontalChatHistoryVisibile] = useState(false);
    const [isChatHistoryPopupOpen, setIsChatHistoryPopupOpen] = useState(false);

    const keyboardArrowUpRef = useRef(null);
    const ChatHistoryPopupRef = useRef(null);
    const chatTitleUpdaterModalRef = useRef(null);

    async function createNewChat() {
        // try {
        setCurrentChat([]);
        workspaceContainer.current.scrollTo({
            top: 0,
            behavior: "smooth", // Enables smooth scrolling
        });
        // const { success, sessionId, title, message, messages, userId } = await makeApiRequest('/new-chat');
        // if (success) {
        if (!isHorizontalChatHistoryVisibile) {
            setIsHorizontalChatHistoryVisibile(true);
        }
        const createdAt = new Date();
        const updatedAt = new Date();
        // Handle new chat creation logic here
        const newChat = { sessionId: generateRandomId(), title: `New Chat ${chatHistory.length}`, userId: user.userId, messages: [], created_at: createdAt, updated_at: updatedAt };
        setCurrentChat(newChat);
        setChatHistory(prev => ([newChat, ...prev,
        ]));
        //     } else {
        //         throw new Error('Failed to create new chat');
        //     }
        // } catch (error) {
        //     console.log(error?.message);
        // }
    }

    useEffect(() => {
        function handleClickOutside(event) {
            if (
                ChatHistoryPopupRef.current &&
                !ChatHistoryPopupRef.current.contains(event.target) &&

                keyboardArrowUpRef.current &&
                !keyboardArrowUpRef.current.contains(event.target) &&

                chatTitleUpdaterModalRef.current &&
                chatTitleUpdaterModalRef.current.contains(event.target)
            ) {
                console.log("hehesss");
                setIsChatHistoryPopupOpen(false);
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
            {chatHistory.length > 0 && <div className={`relative flex-1 w-[80%] origin-right transition-all duration-300 ease-in-out ${!isHorizontalChatHistoryVisibile && 'scale-x-0'}`}>
                <HorizontalChatHistoryList />
                {/* Right fade shadow */}
                <div className={`pointer-events-none absolute right-0 top-0 h-full w-16
                      bg-gradient-to-r from-transparent ${theme === 'light' ? 'to-background_workspace' : ''} `} />
            </div>}
            <div className="flex gap-1 p-2 ml-auto w-fit">
                <KeyboardArrowLeftOutlinedIcon onClick={() => setIsHorizontalChatHistoryVisibile(prev => !prev)} className={`cursor-pointer ${theme === 'light' ? 'text-[#666]' : 'text-[#ABAEB4]'} ${isHorizontalChatHistoryVisibile && 'rotate-180'}`} />

                <AddIcon onClick={createNewChat} className={`cursor-pointer ${theme === 'light' ? 'text-[#666]' : 'text-[#ABAEB4]'}`} />

                <div className="relative">
                    {isChatHistoryPopupOpen && <div ref={ChatHistoryPopupRef}> <ChatHistoryPopup chatTitleUpdaterModalRef={chatTitleUpdaterModalRef} twClasses={`absolute bottom-full right-0 h-[45vh] ${theme === 'light' ? 'shadow-[0px_0px_14px_-6px]' : 'shadow-[0px_0px_14px_-6px_#666]'} border-md`} close={closePopup} /> </div>}
                    <ScheduleOutlinedIcon ref={keyboardArrowUpRef} className={`cursor-pointer ${theme === 'light' ? 'text-[#666]' : 'text-[#ABAEB4]'}`} onClick={() => setIsChatHistoryPopupOpen(prev => !prev)} />
                </div>
            </div>
        </div>
    );
}

export default ChatHistory;