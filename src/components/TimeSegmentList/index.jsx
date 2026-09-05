import React, { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import { Film, Clock, Layers, PlayCircle, Pencil, Trash } from "lucide-react";
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
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import BaseHeading from '../BaseHeading';
import TalkingHeadPanel from '../TalkingHeadPanel';
import Chip from '../Chip';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';
import RippleButton from '../RippleButton';
import { sortByDate, urlToBase64 } from '../../utils';
import SaveSegmentModal from '../SaveSegmentModal';
import ActionMenu from '../ActionMenu';
import AnimatedText from '../AnimatedText';
import LoadingSpinner from '../LoadingSpinner';
import makeApiRequest from '../../api';
import { ProjectContext } from '../../contexts/projectContext';
import { ToastContext } from '../../contexts/toastContext';
import TimeSegmentTitleUpdaterModal from '../TimeSegmentTitleUpdaterModal';

function TimeSegmentList() {

    const {
        segmentDescriptions,
        currentSegment,
        setCurrentSegment
    } = useContext(MainContext);

    return (
        <div className={`h-full min-h-0 flex overflow-hidden`}>
            {/* Left column — list */}
            <div className="w-[280px] shrink-0 border-r border-border h-full min-h-0 overflow-y-auto p-3 flex flex-col gap-2">
                {segmentDescriptions.length === 0 ? (
                    <p className="text-center text-[12.5px] font-semibold text-ink-secondary py-8">No segments found</p>
                ) : (
                    <SegmentListItem />
                )}
            </div>

            {/* Right column — selected segment */}
            <div className="flex-1 min-w-0 h-full min-h-0 overflow-y-auto">
                {!currentSegment ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-2.5 px-6">
                        <div className="w-11 h-11 rounded-xl bg-surface-alt flex items-center justify-center text-ink-muted">
                            <Layers size={19} />
                        </div>
                        <strong className="text-ink text-[13px] font-semibold">Select a segment</strong>
                        <span className="text-[12.5px] text-ink-muted max-w-[260px]">
                            Pick a segment from the list to preview it and see its details.
                        </span>
                    </div>
                ) : (
                    <div className="p-4 flex flex-col gap-4">
                        <SegmentDetails />
                    </div>
                )}
            </div>
        </div>
    );
}

function SegmentListItem() {

    const {
        isProjectReadOnly
    } = useContext(ProjectContext);

    const {
        knowledgeBase,
        segmentDescriptions,
        setSegmentDescriptions,
        currentSegment,
        setCurrentSegment
    } = useContext(MainContext);

    const {
        notify
    } = useContext(ToastContext);

    const [isSegmentDeleting, setIsSegmentDeleting] = useState(false);
    const [hoveredSegment, setHoveredSegment] = useState(null);
    const [selectedSegment, setSelectedSegment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const handleMouseEnterSegment = (id) => {
        setHoveredSegment(id);
    };
    const handleMouseLeaveSegment = () => {
        setHoveredSegment(null);
    };

    function handleSelectResult(segment) {
        const segmentSource = knowledgeBase.find(item => item.source_id === segment.source_id);

        // if (segmentSource) {
        setCurrentSegment({
            ...segment,
            timestampText: `${segmentSource?.source_path} | ${segment.start}`,
            refs: segmentSource ? [{
                ...segmentSource,
                timestamp: segment.start
            }] : []
        });
    }

    async function deleteSegment(segmentId) {
        try {
            setIsSegmentDeleting(true);
            const { success, message } = await makeApiRequest(`/segments/${segmentId}`, 'DELETE');

            if (success) {
                setSegmentDescriptions(prev => prev.filter(item => item.id !== segmentId));
                notify({
                    variant: "success",
                    heading: "Video segment deleted!"
                });
            } else {
                throw new Error(message);
            }
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Couldn't delete video segment",
                subheading: error.message || "",
            });
        } finally {
            setIsSegmentDeleting(false);
        }
    }

    return (
        <div className={`flex flex-col gap-1 bg-white rounded-md p-2 cursor-pointer hover:bg-gray-100`}>
            {
                sortByDate(segmentDescriptions, "created_at", "desc").map(segment => (
                    <div key={segment.id}
                        className={`flex items-center ${segment?.id === currentSegment?.id ? '!border !border-primary-300' : '!border !border-transparent'} gap-2 hover:bg-textColor-100/25 cursor-pointer p-2 rounded-md select-none`}
                        onClick={() => handleSelectResult(segment)}
                        onMouseEnter={() => handleMouseEnterSegment(segment.id)}
                        onMouseLeave={handleMouseLeaveSegment}
                    >

                        {
                            !isProjectReadOnly && (
                                hoveredSegment === segment.id && (<ActionMenu
                                    direction="right"
                                    actions={[
                                        {
                                            label: "Edit title",
                                            icon: <Pencil size={13} />,
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                setSelectedSegment(segment);
                                                setIsModalOpen(true);
                                            },
                                        },
                                        {
                                            label: isSegmentDeleting ? <AnimatedText text='Deleting...' cssClasses="!font-semibold !text-sm" /> : "Delete",
                                            icon: isSegmentDeleting ? <LoadingSpinner isSmall /> : <Trash size={13} />,
                                            onClick: () => deleteSegment(segment.id),
                                        },
                                    ]}
                                />)
                            )
                        }

                        <div className="overflow-x-hidden">
                            <BaseHeading text={`${segment.start}-${segment.end} • ${segment.response_format.schema?.talking_head?.length > 0 ? `${segment.response_format.schema?.talking_head?.length} ${segment.response_format.schema?.talking_head?.length === 1 ? 'person' : 'people'}` : 'no people detected'}`} className="text-xs !font-bold !italic" />

                            <p className={`text-textColor-300 cursor-pointer w-full truncate`} key={segment.id}>{segment?.title}</p>
                        </div>
                    </div>
                ))
            }

            {
                isModalOpen && (
                    <TimeSegmentTitleUpdaterModal show={isModalOpen} onHide={() => setIsModalOpen(false)} segment={selectedSegment} setSegmentDescriptions={setSegmentDescriptions} />
                )
            }
        </div>
    );
}

function SegmentDetails() {

    const {
        currentSegment,
        knowledgeBase,
        setSegmentDescriptions
    } = useContext(MainContext);

    const { handleSourceLinkClick } = useReferenceLinkClick(true);

    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(Boolean(currentSegment && currentSegment.id));

    const {
        source_id,
        start,
        end,
        timestampText,
        query,
        response_format: { schema }
    } = currentSegment;

    let source = knowledgeBase.find(item => item.source_id === source_id) || {};



    function base64ToUint8Array(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

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

    function exportSegmentAsJson(segment) {
        const { id, timestampText, refs, ...rest } = segment;
        const safeFileName = `segment-${(segment.video || 'segment').replace(/[^a-zA-Z0-9-_]/g, '_')}-${segment.start || '0'}-${segment.end || '0'}.json`;
        const jsonData = JSON.stringify(rest, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = safeFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }



    return (
        <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                    <BaseHeading text="Scene analysis" className="text-md" />
                </div>

                <div className={`flex items-center gap-1 text-textColor-200`}>
                    <PlayCircle size={15} />
                    <p className={`text-sm/6 font-semibold`}>{source?.source_path}</p>
                </div>

                <div className={`flex items-center gap-1 text-textColor-200`}>
                    <Clock size={15} />
                    <p className={`text-sm/6 font-semibold`}>{start} - {end}</p>
                </div>
            </div>

            {/* query prompt */}
            <div>
                <BaseHeading text="Prompt" />
                <p className={`text-sm/6 text-textColor-300`} dangerouslySetInnerHTML={{ __html: query }} />
            </div>


            {/* Tags */}
            <div className="grid grid-cols-2 gap-6">

                <div>
                    <BaseHeading text="Mood" className="mb-2" />
                    <div className="flex flex-wrap gap-2">
                        {schema?.mood.map((m) => (
                            <span
                                key={m}
                                className="px-3 py-1 text-sm bg-blue-500/20 text-blue-500 rounded-full"
                            >
                                {m}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <BaseHeading text="Shot Type" className="mb-2" />
                    <div className="flex flex-wrap gap-2">
                        {schema?.shot_type.map((s) => (
                            <span
                                key={s}
                                className="px-3 py-1 text-sm bg-purple-500/20 text-purple-500 rounded-full"
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                </div>

            </div>



            {/* Scene Description */}
            <div>
                <BaseHeading text="generated response" className="mb-1" />
                <p className={`text-sm/6 text-textColor-300`} dangerouslySetInnerHTML={{ __html: schema?.action_description.replace(/\r?\n/g, '<br />') }} />
            </div>

            <TalkingHeadPanel
                talkingHeads={schema?.talking_head}
                source={source}
            />


            {/* Onscreen Text */}
            {schema?.onscreen_text?.detected && (
                <div>
                    <BaseHeading text="Detected On-screen Text" className="mb-2" />

                    <div className="rounded-lg text-sm flex gap-1 flex-wrap">
                        {schema?.onscreen_text?.text_content?.map((text) => (
                            <Chip key={text} content={text.trim()} cssClasses="w-fit" />
                        ))}
                    </div>
                </div>
            )}


            {/* refs */}
            {source && source.length > 0 && (
                <div>
                    <BaseHeading text="References" className="font-bold text-sm mb-2" />
                    <ul className="list-disc list-inside text-sm/6 text-textColor-300">
                        {source.map((ref, index) => {
                            return (
                                <Chip key={index} content={timestampText} data-object={ref} handleClick={(event) => handleSourceLinkClick(event, ref)} cssClasses="ml-0 cursor-pointer text-gradient-x" />
                            );
                        })}
                    </ul>
                </div>
            )}



            {/* action buttons */}
            <div className="flex items-center gap-2 relative">
                <div className="relative inline-block">
                    <RippleButton
                        cssClasses="px-2 flex items-center gap-1 py-1 text-sm rounded"
                        onClick={() => setExportMenuOpen((prev) => !prev)}
                    >
                        Export as
                        <UnfoldMoreIcon />
                    </RippleButton>

                    {exportMenuOpen && (
                        <div className={`absolute left-0 bottom-0 mt-2 min-w-[180px] rounded-lg border-textColor-300/20 shadow-xl z-10 mb-5 bg-background_workspace text-textColor-100`}>
                            <button
                                type="button"
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-300/50`}
                                onClick={() => {
                                    exportSceneAnalysisToDocx(currentSegment);
                                    setExportMenuOpen(false);
                                }}
                            >
                                DOCX format
                            </button>
                            <button
                                type="button"
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-300/50`}
                                onClick={() => {
                                    exportSegmentAsJson(currentSegment);
                                    setExportMenuOpen(false);
                                }}
                            >
                                JSON format
                            </button>
                        </div>
                    )}
                </div>
            </div>


            <div>
                {!isSaved && (
                    <RippleButton cssClasses="px-2 flex items-center gap-1 py-1 text-sm rounded" onClick={() => setIsSaveModalOpen(true)}>
                        Save
                    </RippleButton>
                )}
            </div>
            {isSaveModalOpen && (
                <SaveSegmentModal
                    show={isSaveModalOpen}
                    onHide={() => setIsSaveModalOpen(false)}
                    segment={currentSegment}
                    setSegmentDescriptions={setSegmentDescriptions}
                    onSaved={() => setIsSaved(true)}
                />
            )}
        </div>
    );
}

export default TimeSegmentList;