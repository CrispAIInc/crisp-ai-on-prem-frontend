import { useEffect, useRef, useState } from "react";

export default function ChatInput({ onSend }) {
    const [value, setValue] = useState("");
    const textareaRef = useRef(null);

    // Auto resize textarea
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }, [value]);

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (!value.trim()) return;
            onSend(value.trim());
            setValue("");
        }
    };

    return (
        <div className="w-full transition bg-white border shadow-sm border-neutral-200 rounded-2xl focus-within:ring-2 focus-within:ring-neutral-300">
            <div className="flex items-end gap-2 p-3">
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Crisp Wiz anything..."
                    className="flex-1 overflow-y-auto text-sm leading-6 bg-transparent outline-none resize-none  max-h-40 placeholder:text-neutral-400"
                />

                <button
                    disabled={!value.trim()}
                    onClick={() => {
                        onSend(value.trim());
                        setValue("");
                    }}
                    className="flex items-center justify-center text-white transition rounded-full  h-9 w-9 bg-neutral-900 disabled:bg-neutral-300 disabled:cursor-not-allowed"
                >
                    ➤
                </button>
            </div>
        </div>
    );
}
