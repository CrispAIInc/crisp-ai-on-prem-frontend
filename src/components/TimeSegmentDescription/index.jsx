import React, { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import SegmentDescription from '../SegmentDescription';
import SegmentDescriptionResult from "../SegmentDescriptionResult";
import Chip from "../Chip";
import useReferenceLinkClick from "../../hooks/useReferenceLinkClick.js";
import { delay, formatTime, toSeconds } from "../../utils.js";
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
    BorderStyle,
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

    const exportDocx = async () => {
        const descriptionText = results.description.replace(/<br\s*\/?>/g, "\n");

        const doc = new Document({
            sections: [
                {
                    children: [
                        new Paragraph({
                            spacing: { after: 300 },
                            children: [
                                new TextRun({
                                    text: `Segment: ${results.start} - ${results.end}`,
                                    bold: true,
                                    size: 40,
                                }),
                            ],
                        }),
                        new Paragraph(""),
                        new Paragraph("Description:"),
                        new Paragraph(descriptionText.replace(/<br\s*\/?>/g, '\n')),
                        new Paragraph(""),
                        new Paragraph("References:"),
                        ...results.refs.map(
                            (ref) => new Paragraph(ref.displayText)
                        ),
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "segment-description.docx");
    };

    const exportToDocx = async (results) => {
        const brandColor = "2E74B5"; // Change this to your brand color

        // Replace all <br> variations
        const cleanedDescription = results.description.replace(
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
                                    text: "Crisp AI Segment Report",
                                    bold: true,
                                    size: 42, // 21pt
                                    color: brandColor,
                                }),
                            ],
                        }),

                        // ===== SUBTITLE / SEGMENT =====
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            spacing: { after: 300 },
                            children: [
                                new TextRun({
                                    text: `${results.start} — ${results.end}`,
                                    size: 24,
                                    bold: true,
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
                                    text: "Description",
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
                exportFn={() => exportToDocx(results)}
            />
        </div>
    );
};

export default TimeSegmentDescription;