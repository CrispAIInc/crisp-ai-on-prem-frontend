import React, { useContext, useEffect, useRef, useState } from 'react';
import RippleButton from '../RippleButton';
import { MainContext } from '../../contexts/mainContext';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';

const FindMoments = () => {

    const {
        theme,
        checkedSources,
    } = useContext(MainContext);

    const checkedVideosCount = checkedSources.filter(source => source.file_type === "video").length;

    const [prompt, setPrompt] = useState("");
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
        const maxSingleHeight = lineHeight * 1;
    }, [prompt]);

    // =========== CONSTREINT TOOLTIP LOGIC =============
    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left - 60,
            y: e.clientY - rect.top + 10,
        });
    };

    const handleMouseEnter = () => checkedVideosCount === 0 && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    return (
        <div className="flex flex-col h-full  gap-2 overflow-y-hidden">
            <div className={`flex items-center gap-2 w-full pr-2 pb-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md text-textColor-100" : '!border !border-textColor-100 text-textColor-300'} rounded-md focus-within:ring-1 focus-within:ring-primaryColor/50`}>
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="What do you want to find in the video? (e.g. Q1 statistics)"
                    className={`w-full p-2 bg-transparent resize-none focus:outline-none overflow-y-auto max-h-40`}
                />
                <div
                    className="relative inline-block self-end mt-2"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >

                    <RippleButton
                        cssClasses="rounded-md !py-2 !px-3 !pr-4  flex items-center gap-1"
                        disabled={checkedVideosCount === 0}
                    >
                        <SearchOutlinedIcon className={`text-white text-sm`} />
                        <span className="text-sm">Find</span>
                    </RippleButton>

                    {tooltipVisible && (
                        <p
                            // onMouseEnter={() => setTooltipVisible(false)}
                            className={`absolute p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                            style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                        >
                            check at least one video source to enable
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FindMoments;