import { useContext, useEffect, useRef, useState } from "react";
import SendIcon from "@mui/icons-material/Send";
import NorthIcon from '@mui/icons-material/North';
import { MainContext } from '../../contexts/mainContext';
import AppTooltip from '../AppTooltip';
import ChatHistory from '../ChatHistory';

export default function ChatInput({
    onSend,
    placeholder,
    value,
    onChange,
    crispWizInputRef,
    handleKeyDown,
    crispWizInputContainerRef
}) {
    const { theme } = useContext(MainContext);
    const [isMultiline, setIsMultiline] = useState(false);
    const textareaRef = useRef(null);

    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        // Reset height to recalc
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";

        // Calculate 4 lines height
        const lineHeight = parseFloat(
            window.getComputedStyle(el).lineHeight
        );
        const maxSingleHeight = lineHeight * 3;

        setIsMultiline(el.scrollHeight > maxSingleHeight);
    }, [value]);

    function handleMouseOver() {
        setShowTooltip(Boolean(value.trim()) === false);
    }

    function handleMouseLeave() {
        setShowTooltip(false);
    }

    return (
        <div
            className={`
                relative
                w-full shadow-sm
                rounded-3xl
                transition-all duration-200
                focus-within:ring-2 focus-within:ring-neutral-300
                ${theme === 'light' ? "!border !border-textColor-100/50 bg-transparent" : " bg-zinc-900"}
            `}
        >
            <div className="flex items-end gap-2 px-4 py-2">
                <textarea
                    ref={el => {
                        crispWizInputRef.current = el;
                        textareaRef.current = el;
                    }}
                    rows={1}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={e => handleKeyDown(e)}
                    placeholder={placeholder}
                    className="w-[95%] py-2 overflow-y-auto leading-6 bg-transparent outline-none resize-none text-md max-h-40 placeholder:text-neutral-400"
                />

                <button
                    disabled={!value.trim()}
                    onClick={() => {
                        onSend(value.trim());
                    }}
                    onMouseOver={handleMouseOver}
                    onMouseLeave={handleMouseLeave}
                    className={`absolute right-2 flex items-center justify-center transition rounded-full h-10 w-10   disabled:cursor-not-allowed ${theme === 'light' ? 'hover:bg-textColor-100/40' : 'hover:bg-textColor-300/30'}`}
                >
                    <NorthIcon className={`${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`} />

                    {
                        showTooltip && (
                            <AppTooltip content="Message is empty" />
                        )
                    }
                </button>
            </div>

            <div className="flex items-center justify-between">
                <ChatHistory crispWizInputRef={crispWizInputRef} crispWizInputContainerRef={crispWizInputContainerRef} />
            </div>
        </div>
    );
}
