import { useEffect, useRef, useState } from "react";
import SendIcon from "@mui/icons-material/Send";

export default function ChatInput({
    onSend,
    placeholder,
    value,
    disabled,
    onChange,
    inputRef,
    handleKeyDown
}) {
    // const [value, setValue] = useState("");
    const [isMultiline, setIsMultiline] = useState(false);
    const textareaRef = useRef(null);

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

    return (
        <div
            className={`
        w-full bg-white border border-neutral-200 shadow-sm
        transition-all duration-200
        ${isMultiline ? "rounded-3xl" : "rounded-full"}
        focus-within:ring-2 focus-within:ring-neutral-300
      `}
        >
            <div className="flex items-end gap-2 px-4 py-2">
                <textarea
                    ref={inputRef}
                    rows={1}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={e => handleKeyDown(e)}
                    placeholder={placeholder}
                    className="flex-1 py-2 overflow-y-auto leading-6 bg-transparent outline-none resize-none text-md max-h-40 placeholder:text-neutral-400"
                />

                <button
                    disabled={!value.trim()}
                    onClick={() => {
                        onSend(value.trim());
                    }}
                    className="flex items-center justify-center text-white transition rounded-full h-9 w-9 bg-neutral-900 disabled:bg-neutral-300 disabled:cursor-not-allowed"
                >
                    <SendIcon className={``} />
                </button>
            </div>
        </div>
    );
}
