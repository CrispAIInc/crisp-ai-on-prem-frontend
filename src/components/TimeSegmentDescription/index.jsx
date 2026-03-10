import React, { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import SegmentDescription from '../SegmentDescription';
import SegmentDescriptionResult from "../SegmentDescriptionResult";
import Chip from "../Chip";
import useReferenceLinkClick from "../../hooks/useReferenceLinkClick.js";
import { delay, formatTime, toSeconds, urlToBase64 } from "../../utils.js";
import { useToast } from '../../contexts/toastContext';
import { EventSourcePolyfill } from 'event-source-polyfill';
import useAuth from '../../hooks/useAuth.js';
import { ProjectContext } from '../../contexts/projectContext.jsx';
import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    AlignmentType,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    HeadingLevel,
    ImageRun
} from "docx";
import { saveAs } from "file-saver";

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const TimeSegmentDescription = ({
    start,
    setStart,
    end,
    setEnd,
    prompt,
    setPrompt,
    results,
    setResults
}) => {

    const {
        checkedSources,
        theme,
        currentChat,
        contentPanelContainerRef,
    } = useContext(MainContext);

    const { currentProject } = useContext(ProjectContext);

    const { token } = useAuth();

    const { notify } = useToast();

    // const [start, setStart] = useState({ h: "00", m: "00", s: "00" });
    // const [end, setEnd] = useState({ h: "00", m: "00", s: "00" });

    // const [prompt, setPrompt] = useState("");

    const [isPending, setIsPending] = useState(false);
    const [isFetchingRefs, setIsFetchingRefs] = useState(false);

    async function generateDescription() {
        if (toSeconds(end) <= toSeconds(start)) {
            notify({
                variant: "error",
                heading: "Timestamps invalid!",
                subheading: "Your timestamp range is invalid.",
            });
            throw new Error("Timestamps invalid");
        }

        try {
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
            url.append("video_filename", checkedSources[0].source_path);
            url.append("prompt", prompt);

            let sessionID = null; // Variable to store the session ID
            const eventSource = new EventSourcePolyfill(`${API_ENDPOINT}/message?${url.toString()}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    SessionId: currentChat?.sessionId,
                    ProjectId: currentProject?.project_id,
                },
                heartbeatTimeout: 75000,
            });

            let botMessage = '';
            eventSource.onmessage = async function (event) {

                const data = JSON.parse(event.data);

                if (data.type === "SESSION_ID") {
                    sessionID = data.session_id;
                } else if (data.text === "") {
                    setIsFetchingRefs(true);
                } else if (data.type === "MESSAGE") {
                    setIsPending(false);
                    const newToken = data.text;
                    botMessage += " " + newToken + (prompt.trim().length === 0 ? "<br /><br />" : "");
                    setResults(prev => ({
                        ...prev,
                        description: botMessage
                    }));
                } else if (data.type === "REFERENCES") {
                    setIsFetchingRefs(true);
                    setResults(prev => ({
                        ...prev,
                        refs: data.data.video_references.map(video => ({ ...video, displayText: `${video.source_path} | Timestamp: ${video.timestamp}` })),
                    }));
                }
            };

            eventSource.onerror = async function () {
                setIsPending(false);
                setIsFetchingRefs(false);
                eventSource.close();
            };

        } catch (error) {
            console.log(error);
        } finally {
            // setIsPending(false);
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

        const parts = description
            .split(/<br\s*\/?>/i)
            .map(p => p.trim())
            .filter(Boolean);

        const regex = /^\[(\d{2}:\d{2}:\d{2})\]\s*/;

        return parts.map(part => {

            const match = part.match(regex);

            if (!match) return null;

            const timestamp = match[1];
            const text = part.replace(regex, "");

            return new Paragraph({

                spacing: {
                    before: 120,
                    after: 320
                },

                children: [

                    new TextRun({
                        text: `⏱ ${timestamp}`,
                        bold: true,
                        color: "000000",
                        size: 20,
                        font: "Calibri"
                    }),

                    new TextRun({
                        break: 1
                    }),

                    new TextRun({
                        text: text,
                        size: 20,
                        font: "Calibri"
                    })
                ]
            });

        }).filter(Boolean);
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



    return (
        <div className="flex flex-col h-full  gap-2 overflow-y-hidden">
            <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Add more instructions for better results (optional)"
                className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-md resize-none focus:outline-none`}
            />
            <SegmentDescription
                start={start}
                setStart={setStart}
                end={end}
                setEnd={setEnd}
                handleGenerate={generateDescription}
                isPending={isPending}
            />

            <SegmentDescriptionResult
                results={results}
                isPending={isPending}
                exportFn={() => exportVideoReportToDocx(results)}
            />
        </div>
    );
};

export default TimeSegmentDescription;