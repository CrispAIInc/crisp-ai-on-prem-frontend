import React, { useContext, useEffect, useRef, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import { ProjectContext } from '../../contexts/projectContext';
import RippleButton from '../RippleButton';
import LoadingSpinner from '../LoadingSpinner';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

function GenBlogs() {

    const { isProjectReadOnly } = useContext(ProjectContext);


    const {
        checkedSources,
        theme,
    } = useContext(MainContext);

    const [context, setContext] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);

    const checkedVideosCount = checkedSources.filter(source => source.file_type === "video").length;
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

    const handleMouseEnter = () => (checkedVideosCount === 0 || prompt.trim() === "" || isProjectReadOnly) && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    const canGenerate = checkedVideosCount > 0 && prompt && prompt.trim().length > 0 && !isProjectReadOnly;

    const textareaRef = useRef(null);
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        // Reset height to recalc
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }, [prompt]);

    return (
        <div className="flex flex-col h-full  gap-2 overflow-y-hidden">
            <div className={`flex items-end gap-2 px-2 rounded-2xl pb-2 ${theme === "dark" ? "!border !border-textColor-200/50  text-textColor-200" : '!border !border-textColor-100 text-textColor-300'}`}>
                <textarea
                    ref={el => {
                        textareaRef.current = el;
                    }}
                    rows={2}
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Add context for accurate results"

                    className={`w-full py-2 overflow-y-auto leading-6 bg-transparent outline-none resize-none text-md max-h-28 placeholder:text-neutral-400 `}
                />

                <div
                    className="relative inline-block self-end mt-2"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                >

                    <RippleButton
                        cssClasses={`rounded-xl !py-2 !px-3 !pr-4  flex items-center gap-1 ${tooltipVisible ? 'cursor-not-allowed' : ''}`}
                        disabled={!canGenerate}
                    >
                        {isGenerating ? <LoadingSpinner /> : <AutoAwesomeIcon className={`text-white !text-[16px]`} />}
                        {/* <span className="text-sm">Find</span> */}
                    </RippleButton>

                    {tooltipVisible && (
                        <p
                            className={`absolute z-10 p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                            style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                        >
                            {isProjectReadOnly ? "Cannot edit an example project." : checkedVideosCount === 0 ? "check at least one video source to enable." : "No prompt provided."}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default GenBlogs;