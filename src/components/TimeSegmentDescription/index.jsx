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
                    botMessage += " " + newToken + "<br /><br />";
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
                handleGenerate={generateDescription} />

            <SegmentDescriptionResult
                results={results}
                isPending={isPending}
                exportFn={() => {
                    const textToExport = `Segment: ${results.start} - ${results.end}\nDescription: ${results.description}\nReferences: ${results.refs.map(ref => ref.displayText).join('\n')}`;
                    const blob = new Blob([textToExport], { type: "text/plain" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = "segment-description.txt";
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }}
            />
        </div>
    );
};

export default TimeSegmentDescription;