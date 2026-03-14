import React, { useContext, useEffect, useRef, useState } from 'react';
import RippleButton from '../RippleButton';
import { MainContext } from '../../contexts/mainContext';

import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import FindMomentsResult from '../FindMomentsResult';
import makeApiRequest from '../../api';
import LoadingSpinner from '../LoadingSpinner';

import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    AlignmentType,
    BorderStyle,
} from "docx";
import { saveAs } from "file-saver";
import { ProjectContext } from '../../contexts/projectContext';
import FindMomentsList from '../FindMomentsList';
import { Skeleton } from '@mui/material';

const FindMoments = ({
    moments,
    FindMoments,
    captionResults,
    setCaptionResults,
}) => {

    const { isProjectReadOnly } = useContext(ProjectContext);
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

    const handleMouseEnter = () => (checkedVideosCount === 0 || prompt.trim() === "" || isProjectReadOnly) && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    // ============= API ===============
    const [isPending, setIsPending] = useState(false);
    const [isFetchingRefs, setIsFetchingRefs] = useState(false);

    async function handleCaptioning(query) {
        let timestamps = await makeApiRequest('/moment-fetch', 'POST', JSON.stringify({
            prompt: query,
            sources: checkedSources.filter(items => items.file_type === "video"),
            fromCrispWiz: false
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
                timestampText: `${source.source_path} | Timestamp: ${ref.timestamp}`
            };
        }).filter(Boolean);

        return result;

    }

    const containerRef = useRef(null);
    const [showList, setShowList] = useState(true);
    const [currentMoment, setCurrentMoment] = useState(null);

    async function handleCaptionSubmit() {
        setIsPending(false);
        setIsFetchingRefs(true);
        if (!displayedSources?.every(item => item?.is_checked === false)) {
            await makeApiRequest(
                `/handle-embeddings`,
                "post",
                JSON.stringify({
                    sources: checkedSources.filter(items => items.file_type === "video")?.map(item => ({ source_path: item?.source_path, category: item?.category })),
                })
            );
        }
        let timestamps = await handleCaptioning(prompt);
        let fullSourceWithTimestamp = mergeSourceToTimestamps(timestamps);

        const finalResults = timestamps.map((segment) => {
            const source = knowledgeBase.find(item => item.source_id === segment.source_id);

            if (source) {
                return {
                    ...segment,
                    timestampText: `${source.source_path} | ${segment.timestamp}`,
                    source: {
                        ...source,
                        timestamp: segment.timestamp
                    }
                };
            }
        });

        setCurrentMoment({
            prompt,
            results: finalResults
        });

        setPrompt("");
        setIsFetchingRefs(false);
        setShowList(false);
    }

    const exportToDocx = async (results) => {
        const brandColor = "2E74B5"; // Change this to your brand color

        // Replace all <br> variations
        const cleanedDescription = results.prompt.replace(
            /<br[^>]*>/gi,
            "\n"
        );

        const descriptionLines = cleanedDescription.split("\n");

        const descriptionParagraphs = descriptionLines.map(
            (line) =>
                new Paragraph({
                    spacing: { line: 360, after: 120 }, // 1.5 line spacing
                    children: [
                        new TextRun({
                            text: line,
                            size: 24, // 12pt
                        }),
                    ],
                })
        );

        const referenceParagraphs = results.refs.map(
            (ref) =>
                new Paragraph({
                    spacing: { after: 100 },
                    children: [
                        new TextRun({
                            text: ref.displayText,
                            size: 22,
                        }),
                    ],
                })
        );

        const doc = new Document({
            styles: {
                default: {
                    document: {
                        run: {
                            font: "Calibri",
                            size: 24,
                        },
                    },
                },
            },
            sections: [
                {
                    children: [
                        // ===== TITLE =====
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 300 },
                            children: [
                                new TextRun({
                                    text: "Crisp AI Caption Report",
                                    bold: true,
                                    size: 42, // 21pt
                                    color: brandColor,
                                }),
                            ],
                        }),

                        // ===== SEPARATOR LINE =====
                        new Paragraph({
                            border: {
                                bottom: {
                                    color: "E0E0E0",
                                    space: 1,
                                    value: BorderStyle.SINGLE,
                                    size: 6,
                                },
                            },
                            spacing: { after: 300 },
                        }),

                        // ===== DESCRIPTION HEADER =====
                        new Paragraph({
                            spacing: { before: 200, after: 150 },
                            children: [
                                new TextRun({
                                    text: "Prompt",
                                    bold: true,
                                    size: 30,
                                    color: brandColor,
                                }),
                            ],
                        }),

                        ...descriptionParagraphs,

                        // ===== REFERENCES HEADER =====
                        new Paragraph({
                            spacing: { before: 400, after: 150 },
                            children: [
                                new TextRun({
                                    text: "References",
                                    bold: true,
                                    size: 30,
                                    color: brandColor,
                                }),
                            ],
                        }),

                        ...referenceParagraphs,
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "segment-description.docx");
    };



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
                        cssClasses={`rounded-md !py-2 !px-3 !pr-4  flex items-center gap-1 ${tooltipVisible ? 'cursor-not-allowed' : ''}`}
                        disabled={checkedVideosCount === 0 || isFetchingRefs || prompt.trim() === "" || isProjectReadOnly}
                    >
                        {isFetchingRefs ? <LoadingSpinner cssClasses="mr-2" /> : <SearchOutlinedIcon className={`text-white text-sm`} />}
                        <span className="text-sm">Find</span>
                    </RippleButton>

                    {tooltipVisible && (
                        <p
                            className={`absolute z-10 p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                            style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                        >
                            {isProjectReadOnly ? "Cannot edit an example project." : prompt.trim() === "" ? "No prompt provided." : "check at least one video source to enable."}
                        </p>
                    )}
                </div>
            </div>

            <div ref={containerRef} className={`relative overflow-y-auto shadow-xl ${theme === "light" ? '!border !border-textColor-100/40' : '!border !border-textColor-200/40'} mt-4 w-full p-2 rounded-md h-full bg-[radial-gradient(circle_at_20%_20%,rgba(171,95,199,0.10),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(119,83,237,0.08),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.06),transparent_50%)]
              backdrop-blur-sm`}>
                {
                    isFetchingRefs ? (

                        <div className="flex flex-col gap-2">
                            <div>
                                <Skeleton />
                                <Skeleton />
                                <Skeleton />
                            </div>
                            <div>
                                <Skeleton width={'50%'} />
                                <Skeleton width={'50%'} />
                                <Skeleton width={'50%'} />
                                <Skeleton width={'50%'} />
                                <Skeleton width={'50%'} />
                            </div>
                            <br />
                            <div>
                                <Skeleton width={'50%'} />
                                <Skeleton width={'50%'} />
                                <Skeleton width={'50%'} />
                                <Skeleton width={'50%'} />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton width={'20%'} height={40} />
                                <Skeleton width={'20%'} height={40} />
                            </div>
                        </div>
                    ) : (
                        showList ? (
                            <FindMomentsList
                                moments={moments}
                                setShowList={setShowList}
                                setCurrentMoment={setCurrentMoment}
                            />
                        ) : (
                            <FindMomentsResult
                                currentMoment={currentMoment}
                                setCurrentMoment={setCurrentMoment}
                                captionResults={captionResults}
                                isPending={isFetchingRefs}
                                exportFn={() => exportToDocx(captionResults)}
                                setShowList={setShowList}
                            />
                        )
                    )
                }
            </div>
        </div>
    );
};

export default FindMoments;