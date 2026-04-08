import React, { useContext, useEffect, useRef, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import { ProjectContext } from '../../contexts/projectContext';
import RippleButton from '../RippleButton';
import LoadingSpinner from '../LoadingSpinner';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PageNumbersPicker from '../PageNumbersPicker';
import SegmentDescription from '../SegmentDescription';
import { DEFAULT_TOTAL_PDF_PAGES } from '../../globals';
import BaseHeading from '../BaseHeading';
import { Checkbox } from '@mui/material';

function GenBlogs({
    videoStart,
    setVideoStart,
    videoEnd,
    setVideoEnd,
    setPageFrom,
    setPageTo,
    isFullSourceDurationBlog,
    setIsFullSourceDurationBlog,
    handleGenerateBlog,
    context, setContext,
    isGeneratinBlog,
    setIsGeneratingBlog,
}) {

    const { isProjectReadOnly } = useContext(ProjectContext);


    const {
        checkedSources,
        theme,
    } = useContext(MainContext);
    const [isGenerating, setIsGenerating] = useState(false);

    const checkedVideos = checkedSources.filter(source => source.file_type === "video");
    const checkedPdfs = checkedSources.filter(source => source.file_type === "pdf");
    const sourceType = checkedVideos.length === 1 ? "video" : checkedPdfs.length === 1 ? "pdf" : null;
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

    const canGenerate = checkedSources.length === 1 && (checkedVideos.length === 1 || checkedPdfs.length === 1) && context && context.trim().length > 0 && !isProjectReadOnly;

    const handleMouseEnter = () => !canGenerate && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);


    const textareaRef = useRef(null);
    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        // Reset height to recalc
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";
    }, [context]);

    return (
        <div className="flex flex-col h-full  gap-2 overflow-y-hidden">
            <div>
                <label className={`${theme === "dark" ? 'text-textColor-100' : 'text-textColor-200'} font-medium`}>Context</label>
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
                            onClick={() => {
                                if (!canGenerate) return;
                                handleGenerateBlog();
                            }}
                        >
                            {isGeneratinBlog ? <LoadingSpinner /> : <AutoAwesomeIcon className={`text-white !text-[16px]`} />}
                        </RippleButton>

                        {tooltipVisible && (
                            <p
                                className={`absolute z-10 p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                                style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                            >
                                {isProjectReadOnly ? "Cannot edit an example project." : context.trim().length === 0 ? "No context provided" : "check ONE video or ONE PDF source to enable."}
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex items-center">
                <Checkbox
                    sx={{ p: 0 }}
                    onChange={(e) => setIsFullSourceDurationBlog(e.target.checked)}
                    inputProps={{ "aria-label": "Select All Sources" }}
                    label="Include full source"
                />

                <BaseHeading
                    text="Include full source length"
                    className={`${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                        }`}
                />
            </div>

            {
                !isFullSourceDurationBlog && (
                    <>
                        {
                            sourceType === "video" ? (
                                <SegmentDescription
                                    start={videoStart}
                                    setStart={setVideoStart}
                                    end={videoEnd}
                                    setEnd={setVideoEnd}
                                    isDisabled={isFullSourceDurationBlog}
                                // handleGenerate={handleGenerateSegmentDescription}
                                />
                            ) : sourceType === "pdf" ? (
                                <div>
                                    <BaseHeading text={`Source: ${checkedPdfs[0]?.source_path}`} />
                                    <PageNumbersPicker
                                        totalPages={checkedPdfs[0]?.total_pages || DEFAULT_TOTAL_PDF_PAGES}
                                        setStart={setPageFrom}
                                        setEnd={setPageTo}
                                        isDisabled={isFullSourceDurationBlog}
                                    />
                                </div>
                            ) : null
                        }
                    </>
                )}
        </div>
    );
}

export default GenBlogs;