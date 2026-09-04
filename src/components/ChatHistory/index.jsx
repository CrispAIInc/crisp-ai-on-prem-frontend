import AddIcon from '@mui/icons-material/Add';
import CloseIcon from "@mui/icons-material/Close";
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import { useContext, useEffect, useRef, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import useChat from '../../hooks/useChat';
import { useGlowingBorder } from '../../hooks/useGlowingBorder';
import ChatHistoryPopup from '../ChatHistoryPopup';
import Chip from '../Chip';
import { ProjectContext } from '../../contexts/projectContext';

function ChatHistory({ crispWizInputContainerRef, crispWizInputRef }) {

    const { theme, currentChat, setCurrentChat, chatHistory, setChatHistory, workspaceContainer } = useContext(MainContext);

    const { isProjectReadOnly } = useContext(ProjectContext);

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

    function closeCurrentChat() {
        addNewChat(`New Chat ${chatHistory.length + 1}`);
    }

    return (
        <div className={`flex items-center justify-between gap-1 p-2 ${currentChat ? 'w-full' : 'ml-auto'}`}>
            {/* current chat name */}
            {(currentChat && currentChat?.title) && (
                <div className="flex items-center flex-1 gap-1">
                    <Chip
                        content={(
                            <>
                                <CloseIcon className='font-bold cursor-pointer !text-[16px]' onClick={closeCurrentChat} />
                                <p className="font-bold !text-[11px]">{currentChat.title}</p>
                            </>
                        )}
                        cssClasses='flex items-center gap-1 rounded-xl !text-sm'
                    />
                </div>
            )}

            {/* add new chat icon */}
            {
                !isProjectReadOnly && (
                    <AddIcon onClick={createNewChat} className={`cursor-pointer ${theme === 'light' ? 'text-[#666]' : 'text-[#ABAEB4]'}`} />
                )
            }

            {/* Chat history popup */}
            <div className="relative">
                {isChatHistoryPopupOpen && <div ref={ChatHistoryPopupRef}> <ChatHistoryPopup crispWizInputContainerRef={crispWizInputContainerRef}
                    crispWizInputRef={crispWizInputRef} chatTitleUpdaterModalRef={chatTitleUpdaterModalRef} createNewChat={createNewChat} twClasses={`absolute top-full right-0 h-[45vh] ${theme === 'light' ? 'shadow-[0px_0px_14px_-6px]' : 'shadow-[0px_0px_14px_-6px_#666]'} border-md`} close={closePopup} /> </div>}
                <ScheduleOutlinedIcon ref={keyboardArrowUpRef} className={`cursor-pointer ${theme === 'light' ? 'text-[#666]' : 'text-[#ABAEB4]'}`} onClick={() => setIsChatHistoryPopupOpen(prev => !prev)} />
            </div>

        </div>
    );
}

export default ChatHistory;