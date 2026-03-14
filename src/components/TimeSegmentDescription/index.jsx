import { Skeleton } from '@mui/material';
import {
    AlignmentType,
    BorderStyle,
    Document,
    ImageRun,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    WidthType
} from "docx";
import { saveAs } from "file-saver";
import { useContext, useEffect, useRef, useState } from 'react';
import makeApiRequest, { axiosInstance } from '../../api/index.js';
import { MainContext } from '../../contexts/mainContext';
import { ProjectContext } from '../../contexts/projectContext.jsx';
import { useToast } from '../../contexts/toastContext';
import useAuth from '../../hooks/useAuth.js';
import { formatTime, toSeconds, urlToBase64 } from "../../utils.js";
import LoadingSpinner from '../LoadingSpinner/index.jsx';
import RippleButton from '../RippleButton/index.jsx';
import SegmentDescription from '../SegmentDescription';
import SegmentDescriptionResult from "../SegmentDescriptionResult";
import TimeSegmentDescriptionList from "../TimeSegmentDescriptionList";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const TimeSegmentDescription = ({
    start,
    setStart,
    end,
    setEnd,
    prompt,
    setPrompt,
    results,
    setResults,
    segmentDescriptions,
    setSegmentDescriptions,
}) => {

    /**
     * *MOCKUP DATA ONLY*
     */

    const [timeSegmentDescriptions, setTimeSegmentDescriptions] = useState([
        {
            start: "00:00:00",
            end: "00:00:09",
            description: " [00:00:00] Two people sit on a light pink couch in a bright studio with a blue sky and palm trees backdrop. The person on the left wears a red sweater and glasses, looking down at something in their hands. The person on the right, dressed in black, leans slightly forward, engaging in conversation.<br /><br /> [00:00:03] The same two individuals remain seated on the pink couch. The person in red looks up, smiling gently, while the person in black gestures with their right hand, appearing to explain or emphasize a point. A small green plant in a white pot sits on the table in front of them.<br /><br /> [00:00:06] Both individuals continue their conversation on the pink couch. The person in red now looks directly at the other, who is leaning forward with hands clasped. The background remains consistent with palm trees and a bright blue sky, creating a relaxed, outdoor atmosphere indoors.<br /><br /> [00:00:09] The person in red gestures with their right hand while speaking, eyes focused on the person in black. The person in black listens attentively, hands resting on their knees. The pink couch and small green plant remain central, with the vivid blue sky and palm trees backdrop visible.<br /><br />",
            refs: [
                {
                    file_type: "video",
                    source_path: "bill gates.mp4",
                    video_url: "gs://crispai-app-462614.firebasestorage.app/video_uploads/videos/oussama-i1/bill gates.mp4",
                    timestamp: "00:00:00",
                    thumbnail: "bill gates.mp4.jpg",
                    category: "oussama-i1",
                    duration: null,
                    metadata: {
                        transcription: {
                            content: [
                                {
                                    content: "So it's a hot debate, you know, in terms of is it good for America to be generous and.\nAnd help the rest of the world live a healthy life?\nWell, I mean, the fact that you're helping so many people all around the world, that you have this.\nBecause that, to me, is what money.\nWhen you have that kind of money, it's for.\nIt's like that's the best thing you can do is actually you're making such a huge difference.\nSo I'm glad you're a billionaire.\nAll right.\nAll right.\nYou can learn more about the Bill and Melinda Gates foundation on the website and@gatesletter.com.",
                                    start_time: "00:06:00",
                                    end_time: "00:06:30"
                                },
                                {
                                    content: "You can learn more about the Bill and Melinda Gates foundation on the website and@gatesletter.com.",
                                    start_time: "00:06:30",
                                    end_time: "00:07:00"
                                }
                            ],
                            title: "Transcription"
                        },
                        summary: {
                            content: " best teaching practices nationwide. When Ellen asks what everyday people can do to make a difference, Gates leans in with a focused, animated expression. He encourages viewers to volunteer and mentor students at their.",
                            title: "Bill Gates on The Ellen DeGeneres Show: Wealth, Philanthropy, and Making a Difference",
                            temperature: 0.2,
                            verbosity: "Low"
                        },
                        embeddings_generated: false,
                        chapters: {
                            content: []
                        },
                        highlights: {
                            content: []
                        },
                        faqs: {
                            content: []
                        },
                        keywords: {
                            content: []
                        }
                    },
                    displayText: "bill gates.mp4 | Timestamp: 00:00:00"
                }
            ]
        },
    ]);
    const { isProjectReadOnly } = useContext(ProjectContext);


    const {
        checkedSources,
        theme,
        currentChat,
        contentPanelContainerRef,
    } = useContext(MainContext);

    const checkedVideosCount = checkedSources.filter(source => source.file_type === "video").length;

    const { currentProject } = useContext(ProjectContext);

    const { token } = useAuth();

    const { notify } = useToast();

    const [isPending, setIsPending] = useState(false);
    const [isFetchingRefs, setIsFetchingRefs] = useState(false);
    const [showList, setShowList] = useState(true);
    const [currentSegment, setCurrentSegment] = useState(null);




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

    const canGenerate = checkedVideosCount > 0 && !isFetchingRefs && prompt && prompt.trim().length > 0 && !isProjectReadOnly;

    async function generateDescription() {
        try {
            if (!canGenerate) {
                throw new Error('Make sure you provided video sources and prompt');
            }

            if (toSeconds(end) <= toSeconds(start)) {
                throw new Error("Your timestamp range is invalid.");
            }

            setIsPending(true);
            setResults(prev => ({
                ...prev,
                start: formatTime(start),
                end: formatTime(end),
                refs: []
            }));

            let url = new URLSearchParams();

            url.append("start_timestamp", formatTime((start)));
            url.append("end_timestamp", formatTime((end)));
            url.append("video_filename", checkedSources.filter(items => items.file_type === "video")[0].source_path);
            url.append("prompt", prompt);

            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axiosInstance.defaults.headers.common['SessionId'] = currentChat?.sessionId;
            axiosInstance.defaults.headers.common['ProjectId'] = currentProject.project_id;

            const { data, success, message } = await makeApiRequest(`/timestamp-summary?${url.toString()}`, 'GET', null, {
                Authorization: `Bearer ${token}`,
                SessionId: currentChat?.sessionId,
                ProjectId: currentProject?.project_id,
            });

            if (success) {

                notify({
                    variant: "success",
                    heading: "Description generated successfully",
                });

                setSegmentDescriptions(prev => [
                    ...prev,
                    data
                ]);
                setCurrentSegment(data);
                setShowList(false);
            } else {
                throw new Error(message);
            }

        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Couldn't generate description",
                subheading: error?.message
            });
        } finally {
            setIsPending(false);
            setIsFetchingRefs(false);
        }
    }

    // Helper function to convert a Base64 string to a Uint8Array
    function base64ToUint8Array(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }


    function createHeading(text) {
        return [

            new Paragraph({
                spacing: { before: 400, after: 80 },
                border: {
                    left: {
                        style: BorderStyle.SINGLE,
                        size: 18,
                        color: "C2185B" // pink accent bar
                    }
                },
                children: [
                    new TextRun({
                        text: "   " + text,
                        bold: true,
                        size: 20,
                        color: "8E24AA", // purple
                        font: "Calibri"
                    }),
                ],
            }),
        ];
    }

    function paddedCell(text) {
        return new TableCell({
            margins: {
                top: 120,
                bottom: 120,
                left: 200,
                right: 200
            },
            children: [
                new Paragraph({
                    children: [
                        new TextRun({
                            text,
                            font: "Calibri",
                            size: 24
                        })
                    ]
                })
            ]
        });
    }

    function formatDescription(description) {
        if (!description) return [];

        const parts = description
            .split(/<br\s*\/?>/i)
            .map(p => p.trim())
            .filter(Boolean);

        const regex = /^\[(\d{2}:\d{2}:\d{2})\]\s*/;

        return parts.map(part => {
            const match = part.match(regex);

            if (match) {
                // Line has timestamp
                const timestamp = match[1];
                const text = part.replace(regex, "");

                return new Paragraph({
                    spacing: { before: 120, after: 320 },
                    children: [
                        new TextRun({
                            text: `⏱ ${timestamp}`,
                            bold: true,
                            color: "000000",
                            size: 20,
                            font: "Calibri"
                        }),
                        new TextRun({ break: 1 }),
                        new TextRun({
                            text: text,
                            size: 20,
                            font: "Calibri"
                        })
                    ]
                });
            } else {
                // Line without timestamp
                return new Paragraph({
                    spacing: { before: 120, after: 320 },
                    children: [
                        new TextRun({
                            text: part,
                            size: 20,
                            font: "Calibri"
                        })
                    ]
                });
            }
        });
    }


    async function exportVideoReportToDocx(data) {

        /* ---------- LOAD LOGO ---------- */
        // If in browser, you can use File/URL to get ArrayBuffer instead
        const logoBase64 = await urlToBase64("/new-crisp-logo-resized.png");
        const logoBuffer = base64ToUint8Array(logoBase64.split(",")[1]);

        const ref = data.refs?.[0];

        const doc = new Document({
            sections: [
                {
                    // -------- REDUCE PAGE MARGINS --------
                    properties: {
                        page: {
                            margin: {
                                top: 720,    // 0.5 inch
                                right: 720,  // 0.5 inch
                                bottom: 720, // 0.5 inch
                                left: 720    // 0.5 inch
                            }
                        }
                    },
                    children: [

                        new Paragraph({
                            alignment: AlignmentType.LEFT,
                            spacing: { after: 200 },
                            children: [
                                new ImageRun({
                                    data: logoBuffer,
                                    transformation: {
                                        width: 160,  // Adjust to your real logo's proportions
                                        height: 50,
                                    },
                                    type: "png", // Explicitly telling Word it's a PNG prevents corruption
                                }),
                            ],
                        }),

                        /* ---------- COVER TITLE ---------- */

                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 50 },
                            children: [
                                new TextRun({
                                    text: "Video Analysis Report",
                                    size: 36,
                                    color: "000000",
                                    font: "Calibri"
                                })
                            ]
                        }),

                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 300 },
                            children: [
                                new TextRun({
                                    text: "Automatically generated by Crisp AI",
                                    italics: true,
                                    size: 24,
                                    color: "666666",
                                    font: "Calibri"
                                })
                            ]
                        }),

                        new Paragraph({
                            border: {
                                bottom: {
                                    style: BorderStyle.SINGLE,
                                    size: 8,
                                    color: "000000"
                                }
                            },
                            spacing: { after: 500 }
                        }),

                        /* ---------- VIDEO INFORMATION ---------- */

                        ...createHeading("Video Information"),

                        new Table({
                            width: {
                                size: 100,
                                type: WidthType.PERCENTAGE
                            },
                            rows: [

                                new TableRow({
                                    children: [
                                        paddedCell("File Name"),
                                        paddedCell(ref.source_path)
                                    ]
                                }),

                                new TableRow({
                                    children: [
                                        paddedCell("Start Time"),
                                        paddedCell(data.start)
                                    ]
                                }),

                                new TableRow({
                                    children: [
                                        paddedCell("End Time"),
                                        paddedCell(data.end)
                                    ]
                                }),

                                new TableRow({
                                    children: [
                                        paddedCell("Category"),
                                        paddedCell(ref.category)
                                    ]
                                })

                            ]
                        }),

                        new Paragraph({ spacing: { after: 400 } }),

                        /* ---------- SCENE DESCRIPTION ---------- */

                        ...createHeading("Scene Timeline"),

                        ...formatDescription(data.description)

                    ]
                }
            ]
        });

        const blob = await Packer.toBlob(doc);

        saveAs(blob, "crisp-ai-video-report.docx");
    }

    const containerRef = useRef(null);
    const isContentEmpty = !results.description || results.description.trim() === "";

    // auto scroll down whenever description changes
    useEffect(() => {
        if (!isContentEmpty && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [results.description, isContentEmpty]);

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
    }, [prompt]);

    return (
        <div className="flex flex-col h-full  gap-2 overflow-y-hidden">
            <div className={`flex items-end gap-2 px-2 rounded-2xl pb-2 ${theme === " dark" ? "!border !border-textColor-200/50 rounded-md text-textColor-200" : '!border !border-textColor-100 text-textColor-300'}`}>
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
                    onClick={generateDescription}
                >

                    <RippleButton
                        cssClasses={`rounded-xl !py-2 !px-3 !pr-4  flex items-center gap-1 ${tooltipVisible ? 'cursor-not-allowed' : ''}`}
                        disabled={!canGenerate}
                    >
                        {isFetchingRefs ? <LoadingSpinner cssClasses="mr-2" /> : <AutoAwesomeIcon className={`text-white !text-[16px]`} />}
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



            <SegmentDescription
                start={start}
                setStart={setStart}
                end={end}
                setEnd={setEnd}
                handleGenerate={generateDescription}
                isPending={isPending}
            />

            <div ref={containerRef} className={`relative overflow-y-auto shadow-xl ${theme === "light" ? '!border !border-textColor-100/40' : '!border !border-textColor-200/40'} mt-4 w-full p-2 rounded-md h-full bg-[radial-gradient(circle_at_20%_20%,rgba(171,95,199,0.10),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(119,83,237,0.08),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.06),transparent_50%)]
  backdrop-blur-sm`}>
                {
                    isPending ? (
                        <div className="flex flex-col gap-2">
                            <Skeleton width={'50%'} />
                            <div>
                                <Skeleton />
                                <Skeleton />
                                <Skeleton />
                                <Skeleton />
                                <Skeleton />
                                <Skeleton />
                            </div>
                            <div className="flex items-center gap-2">
                                <Skeleton width={'20%'} height={40} />
                                <Skeleton width={'20%'} height={40} />
                            </div>
                        </div>
                    ) : showList ? (
                        <TimeSegmentDescriptionList
                            setShowList={setShowList}
                            timeSegmentDescriptions={timeSegmentDescriptions}
                            setResults={setResults}
                            segmentDescriptions={segmentDescriptions}
                            setCurrentSegment={setCurrentSegment}
                        />
                    ) : (
                        <SegmentDescriptionResult
                            setShowList={setShowList}
                            results={results}
                            currentSegment={currentSegment}
                            setCurrentSegment={setCurrentSegment}
                            isPending={isPending}
                            exportFn={() => exportVideoReportToDocx(results)}
                            setTimeSegmentDescriptions={setTimeSegmentDescriptions}
                        />
                    )
                }
            </div>


        </div>
    );
};

export default TimeSegmentDescription;