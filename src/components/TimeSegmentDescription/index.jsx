import { Skeleton } from '@mui/material';
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
    BorderStyle,
    ImageRun,
    ShadingType
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
    isSegmentPending, setIsSegmentPending,
    showSegmentList, setShowSegmentList,
    currentSegment, setCurrentSegment,
    generateDescription,
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

    // const { currentProject } = useContext(ProjectContext);

    const { token } = useAuth();

    // const { notify } = useToast();

    // const [isPending, setIsPending] = useState(false);
    // const [isFetchingRefs, setIsFetchingRefs] = useState(false);
    // const [showList, setShowList] = useState(true);
    // const [currentSegment, setCurrentSegment] = useState(null);




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

    const canGenerate = checkedVideosCount > 0 && !isSegmentPending && prompt && prompt.trim().length > 0 && !isProjectReadOnly;

    // async function generateDescription() {
    //     try {
    //         if (!canGenerate) {
    //             throw new Error('Make sure you provided video sources and prompt');
    //         }

    //         if (toSeconds(end) <= toSeconds(start)) {
    //             throw new Error("Your timestamp range is invalid.");
    //         }

    //         setIsPending(true);
    //         setResults(prev => ({
    //             ...prev,
    //             start: formatTime(start),
    //             end: formatTime(end),
    //             refs: []
    //         }));

    //         let url = new URLSearchParams();

    //         url.append("start_timestamp", formatTime((start)));
    //         url.append("end_timestamp", formatTime((end)));
    //         url.append("video_filename", checkedSources.filter(items => items.file_type === "video")[0].source_path);
    //         url.append("prompt", prompt);

    //         axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    //         axiosInstance.defaults.headers.common['SessionId'] = currentChat?.sessionId;
    //         axiosInstance.defaults.headers.common['ProjectId'] = currentProject.project_id;

    //         const { data, success, message } = await makeApiRequest(`/segment-response?${url.toString()}`, 'GET', null, {
    //             Authorization: `Bearer ${token}`,
    //             SessionId: currentChat?.sessionId,
    //             ProjectId: currentProject?.project_id,
    //         });

    //         if (success) {

    //             notify({
    //                 variant: "success",
    //                 heading: "Description generated successfully",
    //             });

    //             setSegmentDescriptions(prev => [
    //                 ...prev,
    //                 data
    //             ]);
    //             setCurrentSegment(data);
    //             setShowList(false);
    //         } else {
    //             throw new Error(message);
    //         }

    //     } catch (error) {
    //         console.log(error);
    //         notify({
    //             variant: "error",
    //             heading: "Couldn't generate description",
    //             subheading: error?.message
    //         });
    //     } finally {
    //         setIsPending(false);
    //         setIsFetchingRefs(false);
    //     }
    // }

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
            const moods = schema.mood ? schema.mood.join(", ") : "N/A";
            const shotTypes = schema.shot_type ? schema.shot_type.join(", ") : "N/A";

            // 1. Handle Newline formatting in description
            const descriptionParagraphs = actionDesc.split('\n').filter(p => p.trim() !== "");

            // Process On-Screen Text into an array for chips
            const ocrText = schema.onscreen_text?.detected ? schema.onscreen_text.text_content : "";
            const ocrArray = ocrText.split(',').map(item => item.trim()).filter(i => i !== "");

            let onscreenText = "None detected";
            if (schema.onscreen_text?.detected) {
                onscreenText = schema.onscreen_text.text_content;
            }

            // 3. Define Theme Colors
            const primaryColor = "8E44AD"; // A nice Purple for a cinematic theme
            const secondaryColor = "595959"; // Dark Gray
            const accentColor = "E8DAEF"; // Light purple for borders
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
            <div className={`flex items-end gap-2 px-2 rounded-2xl pb-2 ${theme === "dark" ? "!border !border-textColor-200/50  text-textColor-200" : '!border !border-textColor-100 text-textColor-300'}`}>
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
                isPending={isSegmentPending}
            />

            <div ref={containerRef} className={`relative overflow-y-auto shadow-xl ${theme === "light" ? '!border !border-textColor-100/40' : '!border !border-textColor-200/40'} mt-4 w-full p-2 rounded-md h-full bg-[radial-gradient(circle_at_20%_20%,rgba(171,95,199,0.10),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(119,83,237,0.08),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.06),transparent_50%)]
  backdrop-blur-sm`}>
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
                        />
                    )
                }
            </div>


        </div>
    );
};

export default TimeSegmentDescription;