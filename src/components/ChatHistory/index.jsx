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
import SourcesDropdown from '../SourcesDropdown';
import { Check, ChevronDown } from 'lucide-react';
import makeApiRequest from '../../api';

function ChatHistory({ crispWizInputContainerRef, crispWizInputRef, sourceIds, setSourceIds, selectedIndexIds, setSelectedIndexIds }) {

    const {
        knowledgeBase,
        categoryOptions,
        theme,
        currentChat,
        chatHistory,
        workspaceContainer
    } = useContext(MainContext);

    const { isProjectReadOnly } = useContext(ProjectContext);

    const triggerGlow = useGlowingBorder(crispWizInputContainerRef);

    const { addNewChat } = useChat();

    // const [isHorizontalChatHistoryVisibile, setIsHorizontalChatHistoryVisibile] = useState(false);
    const [isChatHistoryPopupOpen, setIsChatHistoryPopupOpen] = useState(false);
    const [selectionMode, setSelectionMode] = useState('assets');
    const [isIndexesDropdownOpen, setIsIndexesDropdownOpen] = useState(false);
    const keyboardArrowUpRef = useRef(null);
    const ChatHistoryPopupRef = useRef(null);
    const chatTitleUpdaterModalRef = useRef(null);
    const indexesDropdownRef = useRef(null);
    const indexOptions = (categoryOptions || []).filter(({ id, value }) => id !== 'N/A' && value !== 'all');

    useEffect(() => {
        function handleClickOutside(event) {
            if (indexesDropdownRef.current && !indexesDropdownRef.current.contains(event.target)) {
                setIsIndexesDropdownOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    async function toggleIndex(indexId) {
        const nextSelectedIndexIds = selectedIndexIds.includes(indexId)
            ? selectedIndexIds.filter(id => id !== indexId)
            : [...selectedIndexIds, indexId];
        setSelectedIndexIds(nextSelectedIndexIds);
        setSourceIds([]);
    }

    function changeSelectionMode(mode) {
        if (mode === selectionMode) return;
        setSelectionMode(mode);
        setSelectedIndexIds([]);
        setSourceIds([]);
        setIsIndexesDropdownOpen(false);
    }

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
        <div className={`flex items-center justify-between flex-wrap gap-1 p-2 ${currentChat ? 'w-full' : 'ml-auto'}`}>
            <div className="flex items-center gap-1">
                <div className="flex items-center rounded-lg border border-border p-0.5" role="group" aria-label="Selection type divide-x">
                    <button
                        type="button"
                        onClick={() => changeSelectionMode('assets')}
                        aria-pressed={selectionMode === 'assets'}
                        className={`rounded-md px-2.5 py-1.5 text-[11px] ${selectionMode === 'assets' ? 'bg-gray-200 text-ink' : 'text-ink-muted hover:text-ink'}`}
                    >
                        Assets
                    </button>
                    <button
                        type="button"
                        onClick={() => changeSelectionMode('indexes')}
                        aria-pressed={selectionMode === 'indexes'}
                        className={`rounded-md px-2.5 py-1.5 text-[11px] ${selectionMode === 'indexes' ? 'bg-gray-200 text-ink' : 'text-ink-muted hover:text-ink'}`}
                    >
                        Indexes
                    </button>
                </div>
                {selectionMode === 'indexes' ? (
                    <div ref={indexesDropdownRef} className="relative">
                        <button
                            type="button"
                            onClick={() => setIsIndexesDropdownOpen(open => !open)}
                            aria-expanded={isIndexesDropdownOpen}
                            className="flex items-center justify-between gap-2 border border-border rounded-lg p-2 text-[11px] text-ink bg-surface hover:border-border-strong"
                        >
                            <span className="whitespace-nowrap">
                                {selectedIndexIds.length
                                    ? `${selectedIndexIds.length} index${selectedIndexIds.length > 1 ? 'es' : ''} selected`
                                    : 'Select index(es)'}
                            </span>
                            <ChevronDown size={14} className={`text-ink-muted shrink-0 transition-transform ${isIndexesDropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {isIndexesDropdownOpen && (
                            <div className="absolute z-30 left-0 top-[calc(100%+6px)] min-w-full w-max max-w-64 max-h-60 overflow-y-auto bg-white border border-border rounded-xl shadow-md p-1.5">
                                {indexOptions.length ? indexOptions.map(index => {
                                    const checked = selectedIndexIds.includes(String(index.id));
                                    return (
                                        <button
                                            key={index.id}
                                            type="button"
                                            onClick={() => toggleIndex(String(index.id))}
                                            className="w-full flex items-center gap-2 px-2 py-2 rounded-lg text-left hover:bg-surface-alt"
                                        >
                                            <span className="flex-1 text-[12.5px] text-ink truncate">{index.label}</span>
                                            <span className={`w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 ${checked ? 'bg-primary-300 border-primary-200 text-white' : 'border-border-strong'}`}>
                                                {checked && <Check size={10} strokeWidth={3} />}
                                            </span>
                                        </button>
                                    );
                                }) : (
                                    <div className="px-2.5 py-3 text-[12.5px] text-ink-muted text-center">No indexes available</div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    <SourcesDropdown
                        // isMultiple={false}
                        sources={knowledgeBase}
                        selectedSourceIds={sourceIds}
                        onSelectedSourceIdsChange={setSourceIds}
                    />
                )}
            </div>

            <div className="ml-auto flex items-center gap-1">
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
                    {isChatHistoryPopupOpen && (
                        <div ref={ChatHistoryPopupRef}>
                            <ChatHistoryPopup
                                crispWizInputContainerRef={crispWizInputContainerRef}
                                crispWizInputRef={crispWizInputRef}
                                chatTitleUpdaterModalRef={chatTitleUpdaterModalRef}
                                createNewChat={createNewChat}
                                twClasses={`absolute bottom-full right-0 mb-2 h-[45vh] ${theme === 'light' ? 'shadow-[0px_0px_14px_-6px]' : 'shadow-[0px_0px_14px_-6px_#666]'} border-md`} close={closePopup} />
                        </div>
                    )}
                    <ScheduleOutlinedIcon ref={keyboardArrowUpRef} className={`cursor-pointer ${theme === 'light' ? 'text-[#666]' : 'text-[#ABAEB4]'}`} onClick={() => setIsChatHistoryPopupOpen(prev => !prev)} />
                </div>
            </div>

        </div>
    );
}

export default ChatHistory;