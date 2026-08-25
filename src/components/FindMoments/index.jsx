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
import { ToastContext } from '../../contexts/toastContext';

const FindMoments = ({
    moments,
    setMoments,
    captionResults,
    prompt,
    setPrompt,
    showList,
    setShowList,
    currentMoment,
    setCurrentMoment,
    isPending,
    saveMoment,
    handleCaptionSubmit,
    title,
    setTitle,
}) => {

    const { isProjectReadOnly } = useContext(ProjectContext);
    const {
        theme,
        checkedSources,
    } = useContext(MainContext);

    // const { notify } = useContext(ToastContext);

    const checkedVideosCount = checkedSources.filter(source => source.file_type === "video").length;

    // const [prompt, setPrompt] = useState("");
    const textareaRef = useRef(null);

    useEffect(() => {
        const el = textareaRef.current;
        if (!el) return;

        // Reset height to recalc
        el.style.height = "auto";
        el.style.height = el.scrollHeight + "px";

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

    const handleMouseEnter = () => (checkedVideosCount === 0 || prompt.trim() === "" || isProjectReadOnly) && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    // ============= API ===============
    // const [isPending, setIsPending] = useState(false);
    // const [isFetchingRefs, setIsFetchingRefs] = useState(false);

    // async function handleCaptioning(query) {
    //     let response = await makeApiRequest('/moment', 'POST', JSON.stringify({
    //         prompt: query,
    //         sources: checkedSources.filter(items => items.file_type === "video"),
    //         fromCrispWiz: false
    //     }));

    //     return response;
    // }

    const containerRef = useRef(null);
    // const [showList, setShowList] = useState(true);
    // const [currentMoment, setCurrentMoment] = useState(null);

    // async function handleCaptionSubmit() {
    //     try {
    //         setIsPending(true);
    //         if (!displayedSources?.every(item => item?.is_checked === false)) {
    //             await makeApiRequest(
    //                 `/handle-embeddings`,
    //                 "post",
    //                 JSON.stringify({
    //                     sources: checkedSources.filter(items => items.file_type === "video")?.map(item => ({ source_id: item?.source_id, index_id: item?.index_id })),
    //                 })
    //             );
    //         }
    //         let { results, success, message, ...rest } = await handleCaptioning(prompt);

    //         if (success) {
    //             if (results.length > 0) {
    //                 const finalResults = results.map((segment) => {
    //                     const source = knowledgeBase.find(item => item.source_id === segment.source_id);

    //                     if (!source) return null;

    //                     return {
    //                         ...segment,
    //                         timestampText: `${source.source_path} | ${segment.timestamp}`,
    //                         source: {
    //                             ...source,
    //                             timestamp: segment.timestamp
    //                         }
    //                     };
    //                 }).filter(Boolean);
    //                 const moment = {
    //                     ...rest,
    //                     results: finalResults
    //                 };

    //                 setMoments(prev => {
    //                     return [
    //                         moment,
    //                         ...prev,
    //                     ];
    //                 });

    //                 setCurrentMoment(moment);

    //                 setPrompt("");
    //                 setIsPending(false);
    //                 setShowList(false);
    //             } else {
    //                 setIsPending(false);
    //                 notify({
    //                     variant: "info",
    //                     heading: "No moments found with the prompt you provided",
    //                     subheading: "Try providing another prompt for better results"
    //                 });
    //             }
    //         }
    //         else {
    //             throw new Error(message);
    //         }
    //     } catch (error) {
    //         notify({
    //             variant: "error",
    //             heading: "Couldn't generate moment",
    //             subheading: error?.message || ""
    //         });
    //         console.log(error);
    //         setIsPending(false);
    //         setShowList(false);
    //     }
    // }

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

            {/* ==================================== */}
            <div className={`flex items-end gap-2 px-2 rounded-2xl pb-2 ${theme === "dark" ? "!border !border-textColor-200/50 text-textColor-100" : '!border !border-textColor-100 text-textColor-300'}`}>
                <textarea
                    ref={el => {
                        textareaRef.current = el;
                    }}
                    rows={2}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Add more instructions for better results"

                    className={`w-full py-2 overflow-y-auto leading-6 bg-transparent outline-none resize-none text-md max-h-28 placeholder:text-neutral-400 `}
                />

                <div
                    className="relative inline-block self-end mt-2"
                    onMouseMove={handleMouseMove}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    onClick={handleCaptionSubmit}
                >

                    <RippleButton
                        cssClasses={`rounded-xl !py-2 !px-3 !pr-4  flex items-center gap-1 ${tooltipVisible ? 'cursor-not-allowed' : ''}`}
                        disabled={checkedVideosCount === 0 || isPending || prompt.trim() === "" || isProjectReadOnly}
                    >
                        {isPending ? <LoadingSpinner /> : <SearchOutlinedIcon className={`text-white !text-[16px]`} />}
                    </RippleButton>

                    {tooltipVisible && (
                        <p
                            className={`absolute z-10 p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                            style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                        >
                            {isProjectReadOnly ? "Cannot edit an example project." : checkedVideosCount === 0 ? "check at least one video source to enable." : !title ? "Title is required" : "No prompt provided."}
                        </p>
                    )}
                </div>
            </div>
            {/* ==================================== */}

            <div className=''>
                <input
                    className={`${theme === 'dark' && 'text-textColor-100'
                        } font-medium p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50" : '!border !border-textColor-100'} focus:outline-none w-full rounded-xl`}
                    placeholder="Write a title for this moment"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div ref={containerRef} className={`relative overflow-y-auto shadow-xl ${theme === "light" ? '!border !border-textColor-100/40' : '!border !border-textColor-200/40'} mt-4 w-full p-2 rounded-md h-full bg-[radial-gradient(circle_at_20%_20%,rgba(171,95,199,0.10),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(119,83,237,0.08),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.06),transparent_50%)]
              backdrop-blur-sm`}>
                {
                    isPending ? (

                        <div className="flex flex-col gap-2">
                            <div>
                                <Skeleton width={'20%'} />
                            </div>
                            <div>
                                <Skeleton />
                                <Skeleton />
                                <Skeleton />
                            </div>
                            <div className="mb-2">
                                <Skeleton width={'65%'} />
                                <Skeleton width={'65%'} />
                                <Skeleton width={'65%'} />
                                <Skeleton width={'65%'} />
                                <Skeleton width={'65%'} />
                            </div>
                            <div>
                                <Skeleton width={'65%'} />
                                <Skeleton width={'65%'} />
                                <Skeleton width={'65%'} />
                                <Skeleton width={'65%'} />
                            </div>
                            {/* <div className="flex items-center gap-2">
                                <Skeleton width={'20%'} height={40} />
                                <Skeleton width={'20%'} height={40} />
                            </div> */}
                        </div>
                    ) : (
                        showList ? (
                            <FindMomentsList
                                moments={moments}
                                setShowList={setShowList}
                                setCurrentMoment={setCurrentMoment}
                                setMoments={setMoments}
                            />
                        ) : (
                            <FindMomentsResult
                                moments={moments}
                                currentMoment={currentMoment}
                                setCurrentMoment={setCurrentMoment}
                                captionResults={captionResults}
                                isPending={isPending}
                                exportFn={() => exportToDocx(captionResults)}
                                setShowList={setShowList}
                                saveMoment={saveMoment}
                            />
                        )
                    )
                }
            </div>
        </div>
    );
};

export default FindMoments;