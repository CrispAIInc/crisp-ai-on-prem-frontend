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
import useChat from '../../hooks/useChat';
import { useGlowingBorder } from '../../hooks/useGlowingBorder';

function ChatHistory({ crispWizInputContainerRef, crispWizInputRef }) {
    const { theme, setCurrentChat, chatHistory, setChatHistory, workspaceContainer } = useContext(MainContext);

    const triggerGlow = useGlowingBorder(crispWizInputContainerRef);

    const { addNewChat } = useChat();

    // const [isHorizontalChatHistoryVisibile, setIsHorizontalChatHistoryVisibile] = useState(false);
    const [isChatHistoryPopupOpen, setIsChatHistoryPopupOpen] = useState(false);

    const keyboardArrowUpRef = useRef(null);
    const ChatHistoryPopupRef = useRef(null);
    const chatTitleUpdaterModalRef = useRef(null);

    function createNewChat() {
        // 1. Create chat
        addNewChat(`New Chat ${chatHistory.length + 1}`);

        // auto-focus on the input
        crispWizInputRef.current.focus();

        // 2. Scroll container
        workspaceContainer?.current.scrollTo({
            top: 0,
            behavior: "smooth",
        });

        // 3. Add border glowing effect
        triggerGlow();
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
        <div className={``}>
            {/* {chatHistory.length > 0 && <div className={`relative flex-1 w-[80%] origin-right transition-all duration-300 ease-in-out ${!isHorizontalChatHistoryVisibile && 'scale-x-0'}`}>
                <HorizontalChatHistoryList />
                <div className={`pointer-events-none absolute right-0 top-0 h-full w-16
                      bg-gradient-to-r from-transparent ${theme === 'light' ? 'to-background_workspace' : ''} `} />
            </div>} */}
            <div className="flex gap-1 p-2 w-fit">
                {/* <KeyboardArrowLeftOutlinedIcon onClick={() => setIsHorizontalChatHistoryVisibile(prev => !prev)} className={`cursor-pointer ${theme === 'light' ? 'text-[#666]' : 'text-[#ABAEB4]'} ${isHorizontalChatHistoryVisibile && 'rotate-180'}`} /> */}

                <AddIcon onClick={createNewChat} className={`cursor-pointer ${theme === 'light' ? 'text-[#666]' : 'text-[#ABAEB4]'}`} />

                <div className="relative">
                    {isChatHistoryPopupOpen && <div ref={ChatHistoryPopupRef}> <ChatHistoryPopup crispWizInputContainerRef={crispWizInputContainerRef}
                        crispWizInputRef={crispWizInputRef} chatTitleUpdaterModalRef={chatTitleUpdaterModalRef} createNewChat={createNewChat} twClasses={`absolute top-full right-0 h-[45vh] ${theme === 'light' ? 'shadow-[0px_0px_14px_-6px]' : 'shadow-[0px_0px_14px_-6px_#666]'} border-md`} close={closePopup} /> </div>}
                    <ScheduleOutlinedIcon ref={keyboardArrowUpRef} className={`cursor-pointer ${theme === 'light' ? 'text-[#666]' : 'text-[#ABAEB4]'}`} onClick={() => setIsChatHistoryPopupOpen(prev => !prev)} />
                </div>
            </div>
        </div>
    );
}

export default ChatHistory;