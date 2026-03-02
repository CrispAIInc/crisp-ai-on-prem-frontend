import React, { useContext, useEffect, useRef, useState } from 'react';
import RippleButton from '../RippleButton';
import { MainContext } from '../../contexts/mainContext';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import FindMomentsResult from '../FindMomentsResult';
import makeApiRequest from '../../api';
import LoadingSpinner from '../LoadingSpinner';

const FindMoments = ({
    captionResults,
    setCaptionResults,
}) => {

    const {
        theme,
        checkedSources,
        knowledgeBase,
        displayedSources,
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
    }, [captionResults.prompt]);

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

    // ============= API ===============
    const [isPending, setIsPending] = useState(false);
    const [isFetchingRefs, setIsFetchingRefs] = useState(false);

    async function handleCaptioning(query) {
        let timestamps = await makeApiRequest('/find-timestamps', 'POST', JSON.stringify({
            prompt: query,
            sources: checkedSources
        }));

        return timestamps;
    }

    function mergeSourceToTimestamps(timestamps) {
        const knowledgeMap = new Map(
            knowledgeBase.map(item => [item.source_id, item])
        );

        const result = timestamps.map(ref => {
            const source = knowledgeMap.get(ref.source_id);

            if (!source) return null;

            return {
                ...source,
                score: ref.score,
                timestamp: ref.timestamp,
                displayText: `${source.source_path} | Timestamp: ${ref.timestamp}`
            };
        }).filter(Boolean);

        return result;

    }

    async function handleCaptionSubmit() {
        setIsPending(false);
        setIsFetchingRefs(true);
        if (!displayedSources?.every(item => item?.is_checked === false)) {
            await makeApiRequest(
                `/handle-embeddings`,
                "post",
                JSON.stringify({
                    sources: displayedSources?.filter(item => item?.is_checked)?.map(item => ({ source_path: item?.source_path, category: item?.category })),
                })
            );
        }
        let timestamps = await handleCaptioning(prompt);
        let fullSourceWithTimestamp = mergeSourceToTimestamps(timestamps);
        setCaptionResults(prev => ({
            ...prev,
            prompt,
            refs: fullSourceWithTimestamp,
        }));
        setPrompt("");
        setIsFetchingRefs(false);
    }

    return (
        <div className="flex flex-col h-full  gap-2 overflow-y-hidden">
            <div className={`flex items-center gap-2 w-full pr-2 pb-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md text-textColor-100" : '!border !border-textColor-100 text-textColor-300'} rounded-md focus-within:ring-1 focus-within:ring-primaryColor/50`}>
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="What do you want to find in the video? (e.g. Q1 statistics)"
                    className={`w-full p-2 bg-transparent resize-none focus:outline-none overflow-y-auto max-h-28`}
                />
                <div
                    className="relative inline-block self-end mt-2"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleCaptionSubmit}
                >

                    <RippleButton
                        cssClasses="rounded-md !py-2 !px-3 !pr-4  flex items-center gap-1"
                        disabled={checkedVideosCount === 0 || isFetchingRefs || prompt.trim() === ""}
                    >
                        {isFetchingRefs ? <LoadingSpinner cssClasses="mr-2" /> : <SearchOutlinedIcon className={`text-white text-sm`} />}
                        <span className="text-sm">Find</span>
                    </RippleButton>

                    {tooltipVisible && (
                        <p
                            className={`absolute z-10 p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                            style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                        >
                            check at least one video source to enable
                        </p>
                    )}
                </div>
            </div>

            {/* results */}
            <FindMomentsResult
                captionResults={captionResults}
                isPending={isFetchingRefs}
                exportFn={() => { }}
            />
        </div>
    );
};

export default FindMoments;