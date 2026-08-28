import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { Skeleton } from '@mui/material';
import {
    AlignmentType,
    BorderStyle,
    Document,
    HeadingLevel,
    ImageRun,
    Packer,
    Paragraph,
    ShadingType,
    TextRun
} from "docx";
import { saveAs } from "file-saver";
import { useContext, useEffect, useRef, useState } from 'react';
import { Checkbox } from '@mui/material';
import { MainContext } from '../../contexts/mainContext';
import { ProjectContext } from '../../contexts/projectContext.jsx';
import BaseHeading from '../BaseHeading';
import { urlToBase64 } from "../../utils.js";
import LoadingSpinner from '../LoadingSpinner/index.jsx';
import RippleButton from '../RippleButton/index.jsx';
import SegmentDescription from '../SegmentDescription';
import SegmentDescriptionResult from "../SegmentDescriptionResult";
import TimeSegmentDescriptionList from "../TimeSegmentDescriptionList";


const TimeSegmentDescription = ({
    start,
    setStart,
    end,
    setEnd,
    prompt,
    setPrompt,
    title,
    setTitle,
    results,
    setResults,
    segmentDescriptions,
    setSegmentDescriptions,
    isSegmentPending,
    showSegmentList,
    setShowSegmentList,
    currentSegment,
    setCurrentSegment,
    generateDescription,
    isFullSourceDuration,
    setIsFullSourceDuration,
}) => {

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
        displayedSources
    } = useContext(MainContext);

    const [isDetailedMode, setIsDetailedMode] = useState(false);

    const checkedVideosCount = checkedSources.filter(source => source.file_type === "video").length;
    const isSingleVideoSelected = checkedVideosCount === 1;

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

    const canGenerate = checkedVideosCount === 1 && !isSegmentPending && prompt && prompt.trim().length > 0 && !isProjectReadOnly;

    // Helper function to convert a Base64 string to a Uint8Array (Prevents Word corruption)
    function base64ToUint8Array(base64) { const binaryString = window.atob(base64); const len = binaryString.length; const bytes = new Uint8Array(len); for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); } return bytes; }

    // Helper: Generate inline chips with "Fake Padding" using borders
    function createChipSection(title, tagsArray, bgColor, textColor, fontFamily) {
        const paragraphs = [
            new Paragraph({
                spacing: { before: 300, after: 150 },
                children: [
                    new TextRun({
                        text: title.toUpperCase(),
                        bold: true,
                        size: 18,
                        color: "64748B",
                        font: fontFamily,
                        characterSpacing: 1.5
                    })
                ]
            })
        ];

        if (!tagsArray || tagsArray.length === 0 || (tagsArray.length === 1 && !tagsArray[0])) {
            paragraphs.push(new Paragraph({
                children: [new TextRun({ text: "None detected", color: "A0AEC0", font: fontFamily, size: 20 })]
            }));
            return paragraphs;
        }

        const chipRuns = [];
        tagsArray.forEach((tag, index) => {
            const cleanTag = tag.trim();
            if (!cleanTag) return;

            chipRuns.push(
                new TextRun({
                    text: `\u00A0${cleanTag.toLowerCase()}\u00A0`,
                    shading: { type: ShadingType.CLEAR, fill: bgColor },
                    color: textColor,
                    font: fontFamily,
                    size: 20,
                    bold: true,
                    // The "Secret Sauce" for padding: 
                    // Adding a border the same color as the background expands the chip area
                    border: {
                        color: bgColor,
                        space: 4, // This acts like CSS padding (in points)
                        value: BorderStyle.SINGLE,
                        size: 6,
                    },
                })
            );

            // Gap between chips (using non-breaking spaces for stability)
            if (index < tagsArray.length - 1) {
                chipRuns.push(new TextRun({ text: "\u00A0\u00A0\u00A0" }));
            }
        });

        paragraphs.push(new Paragraph({
            lineSpacing: { before: 150, line: 360 }, // More vertical room for the thicker chips
            spacing: { after: 200 },
            children: chipRuns
        }));

        return paragraphs;
    }

    async function exportSceneAnalysisToDocx(data) {
        try {
            /* ---------- LOAD LOGO ---------- */
            const logoBase64 = await urlToBase64("/new-crisp-logo-resized.png");
            const logoBuffer = base64ToUint8Array(logoBase64.split(",")[1]);

            // 1. Extract and map data from your new JSON structure
            const videoName = data.video || "Unknown Video";
            const startTime = data.start || "00:00:00";
            const endTime = data.end || "00:00:00";
            const query = data.query || "No query provided.";

            const schema = data.response_format?.schema || {};
            const actionDesc = schema.action_description || "No description available.";

            // 1. Handle Newline formatting in description
            const descriptionParagraphs = actionDesc.split('\n').filter(p => p.trim() !== "");

            // Process On-Screen Text into an array for chips
            const ocrText = schema.onscreen_text?.detected ? schema.onscreen_text?.text_content : "";
            const ocrArray = Array.isArray(ocrText) ? ocrText.map(item => item.trim()).filter(i => i !== "") : [];

            // 3. Define Theme Colors
            const primaryColor = "8E44AD"; // A nice Purple for a cinematic theme
            const secondaryColor = "595959"; // Dark Gray
            const colors = {
                primary: "4338CA",    // Deep Indigo
                accent: "8B5CF6",     // Vibrant Violet
                textMain: "1E293B",   // Slate 800 (Soft Black)
                textMuted: "64748B",  // Slate 500 (Gray)
                bgShade: "F8FAFC",    // Slate 50 (Very light cool gray for boxes)
                highlight: "0EA5E9",  // Sky Blue
                // Chip Colors mapped from your screenshot
                moodBg: "D6E4FF",     // Soft Blue background
                moodText: "2F6BFF",   // Vibrant Blue text
                shotBg: "E8D5FA",     // Soft Purple background
                shotText: "9B51E0",   // Vibrant Purple text
                ocrBg: "DCFCE7",
                ocrText: "166534",
            };
            const fontFamily = "Inter, Helvetica Neue, Arial";

            // 4. Build Document Elements
            const docChildren = [
                // --- LOGO SECTION ---
                new Paragraph({
                    alignment: AlignmentType.LEFT,
                    spacing: { after: 200 },
                    children: [
                        new ImageRun({
                            data: logoBuffer,
                            transformation: { width: 170, height: 55 },
                            type: "png",
                        }),
                    ],
                }),

                // --- DOCUMENT TITLE ---
                new Paragraph({
                    text: "Scene Analysis Report",
                    heading: HeadingLevel.TITLE,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 250 },
                }),

                // --- METADATA SUBTITLE ---
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                    children: [
                        new TextRun({
                            text: `File: ${videoName}`,
                            color: secondaryColor,
                            italics: true,
                            bold: true,
                            size: 24, // 12pt
                        }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 600 },
                    children: [
                        new TextRun({
                            text: `Segment: [${startTime} - ${endTime}]`,
                            color: secondaryColor,
                            italics: true,
                            bold: true,
                            size: 24, // 12pt
                        }),
                    ],
                }),

                // --- QUERY SECTION ---
                new Paragraph({
                    text: "Prompt",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 400, after: 200 },
                    border: {
                        bottom: { color: primaryColor, space: 1, value: BorderStyle.SINGLE, size: 12 },
                    },
                }),
                new Paragraph({
                    spacing: { before: 100, after: 400 },
                    shading: { type: ShadingType.CLEAR, fill: colors.bgShade },
                    border: {
                        left: { color: colors.primary, space: 10, value: BorderStyle.SINGLE, size: 18 },
                        top: { color: colors.bgShade, space: 10, value: BorderStyle.SINGLE, size: 18 },
                        bottom: { color: colors.bgShade, space: 10, value: BorderStyle.SINGLE, size: 18 },
                        right: { color: colors.bgShade, space: 10, value: BorderStyle.SINGLE, size: 18 },
                    },
                    children: [
                        new TextRun({ text: query, size: 24, italics: true, color: colors.textMain, font: fontFamily }),
                    ],
                }),

                // --- ACTION DESCRIPTION SECTION ---
                new Paragraph({
                    text: "Action Description",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 200 },
                    border: {
                        bottom: { color: primaryColor, space: 1, value: BorderStyle.SINGLE, size: 12 },
                    },
                }),
                ...descriptionParagraphs.map(text =>
                    new Paragraph({
                        spacing: { after: 200 },
                        alignment: AlignmentType.JUSTIFIED,
                        children: [new TextRun({ text, size: 22, color: colors.textMain, font: fontFamily })],
                    })
                ),



                // --- CINEMATIC DETAILS SECTION ---
                new Paragraph({
                    text: "Cinematic Details",
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 200, after: 200 },
                    border: {
                        bottom: { color: primaryColor, space: 1, value: BorderStyle.SINGLE, size: 12 },
                    },
                }),

                ...createChipSection("Mood", schema.mood, colors.moodBg, colors.moodText, fontFamily),
                ...createChipSection("Shot Type", schema.shot_type, colors.shotBg, colors.shotText, fontFamily),
                ...createChipSection("On-Screen Text", ocrArray, colors.ocrBg, colors.ocrText, fontFamily),
            ];

            /* ---------- CHARACTER DIALOGUE ---------- */

            if (schema?.talking_head && schema?.talking_head?.length > 0) {

                docChildren.push(

                    new Paragraph({
                        spacing: { before: 400, after: 200 },
                        border: {
                            bottom: {
                                color: "E2E8F0",
                                value: BorderStyle.SINGLE,
                                size: 6
                            }
                        },
                        children: [
                            new TextRun({
                                text: "CHARACTER DIALOGUE",
                                bold: true,
                                size: 22,
                                color: colors.primary,
                                font: fontFamily
                            })
                        ]
                    })

                );

                schema?.talking_head?.forEach(segment => {

                    const match = segment.text_content.match(/\[(.*?)\]\s*(.*)/);

                    const time = match ? match[1] : "";
                    const text = match ? match[2] : segment.text_content;

                    docChildren.push(

                        new Paragraph({
                            spacing: { before: 200, after: 50 },
                            children: [
                                new TextRun({
                                    text: segment.character_name,
                                    bold: true,
                                    size: 22,
                                    color: colors.accent,
                                    font: fontFamily
                                })
                            ]
                        }),

                        new Paragraph({
                            spacing: { after: 50 },
                            children: [
                                new TextRun({
                                    text: `[${time}]`,
                                    italics: true,
                                    size: 18,
                                    color: colors.textMuted,
                                    font: fontFamily
                                })
                            ]
                        }),

                        new Paragraph({
                            spacing: { after: 200 },
                            children: [
                                new TextRun({
                                    text: text,
                                    size: 22,
                                    color: colors.textMain,
                                    font: fontFamily
                                })
                            ]
                        })

                    );

                });
            }

            // 5. Initialize Document Configuration
            const doc = new Document({
                creator: "Crisp AI Scene Analysis Exporter",
                styles: {
                    paragraphStyles: [
                        {
                            id: "Title",
                            name: "Title",
                            basedOn: "Normal",
                            next: "Normal",
                            run: { color: primaryColor, size: 52, bold: true, font: "Helvetica Neue" },
                        },
                        {
                            id: "Heading1",
                            name: "Heading 1",
                            basedOn: "Normal",
                            next: "Normal",
                            run: { color: primaryColor, size: 30, bold: true, font: "Helvetica Neue" },
                        },
                    ],
                },
                sections: [{
                    properties: {
                        page: {
                            margin: {
                                top: 720,
                                right: 720,
                                bottom: 720,
                                left: 720
                            }
                        }
                    }, children: docChildren
                }],
            });

            // 6. Generate and Download
            const blob = await Packer.toBlob(doc);
            const safeFilename = videoName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            saveAs(blob, `scene_analysis_${safeFilename}.docx`);

            console.log("Scene Analysis document successfully generated!");

        } catch (error) {
            console.error("Error generating the Word document:", error);
        }
    }

    const containerRef = useRef(null);
    const isContentEmpty = !results.description || results.description.trim() === "";

    // auto scroll down whenever description changes
    useEffect(() => {
        if (!isContentEmpty && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [results.description, isContentEmpty]);

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
            <div className={`flex items-end gap-2 px-2 rounded-2xl pb-2 ${theme === "dark" ? "!border !border-textColor-200/50  text-textColor-100" : '!border !border-textColor-100 text-textColor-300'}`}>
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
                        {isSegmentPending ? <LoadingSpinner /> : <AutoAwesomeIcon className={`text-white !text-[16px]`} />}
                    </RippleButton>

                    {tooltipVisible && (
                        <p
                            className={`absolute z-10 p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}
                            style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                        >
                            {isProjectReadOnly ? "Cannot edit an example project." : displayedSources.filter(i => (i.is_checked && i.file_type === "video")).length !== 1 ? "check ONE video source to enable." : "No prompt provided."}
                        </p>
                    )}
                </div>
            </div>

            <div className=''>
                <input
                    className={`${theme === 'dark' && 'text-textColor-100'
                        } font-medium p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50" : '!border !border-textColor-100'} focus:outline-none w-full rounded-xl`}
                    placeholder="Write a title for this segment"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
            </div>

            {/* is detailed mode checkbox */}
            <div className={`transition-all duration-200 ease-in-out`}>
                {/* <label className={`flex items-center gap-2 p-2 rounded-xl cursor-pointer !border !border-slate-300`}>
                    <Checkbox
                        className={`p-0 !ml-1 !border-primary-300 !text-primary-300`}
                        checked={isDetailedMode}
                        onChange={(e) => setIsDetailedMode(e.target.checked)}
                        onClick={(event) => event.stopPropagation()}
                        inputProps={{ "aria-label": "detailed mode ingestion" }}
                    />
                    <span className={`text-sm font-medium transition-colors ${theme === 'light' ? "text-slate-700" : "text-textColor-100"}`}>
                        Enable Detailed Mode
                    </span>
                </label> */}
                <p className="text-xs mt-1 font-medium text-primary-200">
                    This asset was ingested using <b>Detailed Mode</b>, so you will get <b>high detailed results</b>.
                    {/* <br />
                    <span className="font-bold text-xs">Processing time may increase.</span> */}
                </p>
            </div>

            <div className="flex items-center">
                <Checkbox
                    sx={{ p: 0 }}
                    checked={isSingleVideoSelected && isFullSourceDuration}
                    disabled={!isSingleVideoSelected}
                    onChange={(e) => {
                        if (!isSingleVideoSelected) return;
                        setIsFullSourceDuration(e.target.checked);
                    }}
                    inputProps={{ "aria-label": "Include full source" }}
                    className={`p-0 !ml-1 !border-primary-300 !text-primary-300`}
                />

                <BaseHeading
                    text="Include full source length"
                    className={`${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}
                />
            </div>

            {!isFullSourceDuration && (
                <SegmentDescription
                    start={start}
                    setStart={setStart}
                    end={end}
                    setEnd={setEnd}
                    handleGenerate={generateDescription}
                    isPending={isSegmentPending}
                    isDisabled={false}
                />
            )}

            <div ref={containerRef} className={`relative overflow-y-auto shadow-xl ${theme === "light" ? '!border !border-textColor-100/40' : '!border !border-textColor-200/40'} mt-4 w-full p-2 rounded-md h-full bg-[radial-gradient(circle_at_20%_20%,rgba(171,95,199,0.10),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(119,83,237,0.08),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.06),transparent_50%)]
  backdrop-blur-sm [&::-webkit-scrollbar]:h-1
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700'}}`}>
                {
                    isSegmentPending ? (
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
                    ) : showSegmentList ? (
                        <TimeSegmentDescriptionList
                            setShowList={setShowSegmentList}
                            timeSegmentDescriptions={timeSegmentDescriptions}
                            setResults={setResults}
                            segmentDescriptions={segmentDescriptions}
                            setCurrentSegment={setCurrentSegment}
                            setSegmentDescriptions={setSegmentDescriptions}
                        />
                    ) : (
                        <SegmentDescriptionResult
                            setShowList={setShowSegmentList}
                            results={results}
                            currentSegment={currentSegment}
                            setCurrentSegment={setCurrentSegment}
                            isPending={isSegmentPending}
                            exportFn={(result) => exportSceneAnalysisToDocx(result)}
                            setTimeSegmentDescriptions={setTimeSegmentDescriptions}
                            setSegmentDescriptions={setSegmentDescriptions}
                        />
                    )
                }
            </div>


        </div>
    );
};

export default TimeSegmentDescription;