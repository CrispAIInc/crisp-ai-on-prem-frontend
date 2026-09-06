import { useContext, useEffect, useState } from "react";
import { Sparkles, Info, Clock, Search, Check } from "lucide-react";
import SourcesDropdown from "../SourcesDropdown";
import { MainContext } from '../../contexts/mainContext';
import SegmentDescription from '../SegmentDescription';
import TimestampPicker from '../TimestampPicker';
import { ProjectContext } from '../../contexts/projectContext';
import { formatTime, toSeconds } from '../../utils';
import makeApiRequest, { axiosInstance } from '../../api';
import useAuth from '../../hooks/useAuth';
import { useToast } from '../../contexts/toastContext';
import LoadingSpinner from '../LoadingSpinner';
import { MAIN_STUDIO_PANELS } from '../../globals';

const TABS = [
    { id: "time-segments", label: "Time segment description", icon: Sparkles, info: "Analyze a specific video time range and generate precise breakdown." },
    { id: "find-moments", label: "Find moments", icon: Clock },
];

export default function Analytics() {

    const {
        knowledgeBase,
        setActiveStudioPanel,
        setCurrentSegment,
        segmentDescriptions,
        setCurrentMoment,
        moments
    } = useContext(MainContext);

    const [activeTab, setActiveTab] = useState(TABS[0].id);
    const [sourceIds, setSourceIds] = useState([]);

    const videoAssets = knowledgeBase.filter(item => item.file_type === "video");

    useEffect(() => {
        setActiveStudioPanel(activeTab);

        switch (activeTab) {
            case "time-segments":
                setCurrentSegment(segmentDescriptions[0]);
        }
    }, [activeTab]);

    return (
        <div className="h-full min-h-0 overflow-y-auto px-[18px] bg-white py-4 flex flex-col gap-4">
            <Field label="Sources">
                <SourcesDropdown isMultiple={false} sources={videoAssets} selectedSourceIds={sourceIds} onSelectedSourceIdsChange={setSourceIds} />
            </Field>

            {/* Sub-navigation */}
            <nav className="pt-3.5 flex items-center gap-6">
                {TABS.map(({ id, label, icon: Icon }) => {
                    const active = activeTab === id;

                    return (
                        <button
                            key={id}
                            type="button"
                            aria-current={active ? "page" : undefined}
                            className={`flex items-center gap-2 text-[13px] font-semibold whitespace-nowrap ${active ? "text-primary-300 !border-b-primary-300" : "text-ink"
                                } pb-3 border-b -mb-px transition-colors`}
                            onClick={() => setActiveTab(id)}
                        >
                            <Icon size={14} strokeWidth={2} />
                            {label}
                        </button>
                    );
                })}
            </nav>

            {activeTab === TABS[0].id ? (
                <TimeSegmentPane
                    sourceIds={sourceIds}
                />
            ) : (
                <FindMomentsPane
                    sourceIds={sourceIds}
                />
            )}
        </div>
    );
}

function TimeSegmentPane({
    sourceIds
}) {

    const {
        currentProject,
        isProjectReadOnly
    } = useContext(ProjectContext);

    const {
        knowledgeBase,
        currentChat,
        setCurrentSegment,
        setActiveStudioPanel
    } = useContext(MainContext);

    const { token } = useAuth();

    const { notify } = useToast();

    const [start, setStart] = useState({ h: "00", m: "00", s: "00" });
    const [end, setEnd] = useState({ h: "00", m: "00", s: "00" });
    const [context, setContext] = useState("");
    const [title, setTitle] = useState("");
    const [fullLength, setFullLength] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const [resultsDescription, setResultsDescription] = useState({
        start: formatTime(start),
        end: formatTime(end),
        description: "",
        refs: []
    });

    const source = knowledgeBase.find(item => item.source_id === sourceIds[0]);
    const canGenerate = !isProjectReadOnly && source && context.trim() !== "";


    async function generateTimeSegmentDescription() {
        try {
            if (!canGenerate) {
                throw new Error('Make sure you provide video sources and context');
            }

            if (!fullLength && toSeconds(end) <= toSeconds(start)) {
                throw new Error("Your timestamp range is invalid.");
            }

            setIsPending(true);
            setResultsDescription(prev => ({
                ...prev,
                start: formatTime(start),
                end: formatTime(end),
                refs: []
            }));

            let url = new URLSearchParams();

            if (fullLength) {
                url.append("isFullSource", "true");
            } else {
                url.append("start_timestamp", formatTime(start));
                url.append("end_timestamp", formatTime(end));
            }

            url.append("video_filename", source.source_path);
            url.append("prompt", context);
            url.append("title", title);

            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axiosInstance.defaults.headers.common['SessionId'] = currentChat?.sessionId;
            axiosInstance.defaults.headers.common['ProjectId'] = currentProject.project_id;

            const payload = {
                isFullSource: fullLength,
                start_timestamp: formatTime(start),
                end_timestamp: formatTime(end),
                prompt: context,
                title: title,
                source_id: source.source_id
            };

            const { data, success, message } = await makeApiRequest(`/segments`, 'POST', payload, {
                Authorization: `Bearer ${token}`,
                SessionId: currentChat?.sessionId,
                ProjectId: currentProject?.project_id,
            });

            if (success) {

                notify({
                    variant: "success",
                    heading: "Description generated successfully",
                });

                // Do not persist generated segment automatically; user must explicitly save.
                console.log(data);
                setCurrentSegment(data);
                setActiveStudioPanel(MAIN_STUDIO_PANELS.TIME_SEGMENTS);
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
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <Field label="Context">
                <InstructionsInput
                    value={context}
                    onChange={setContext}
                    actionIcon={Sparkles}
                    onAction={() => {
                        /* wire up generation here */
                    }}
                />
            </Field>

            <Field label="Title">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='Write a title for this segment'
                    className="flex-1 outline-none border border-gray-200 w-full text-[12.5px] text-ink placeholder:text-ink-muted bg-gray-100 rounded-lg px-3 py-2"
                />
            </Field>

            <label className="flex items-center gap-2 text-[12.5px] font-medium text-ink cursor-pointer">
                <input
                    type="checkbox"
                    checked={fullLength}
                    onChange={(e) => setFullLength(e.target.checked)}
                    className="w-4 h-4 rounded accent-primary"
                />
                Include full asset length
            </label>

            {!fullLength && (
                <TimestampPicker
                    start={start}
                    setStart={setStart}
                    end={end}
                    setEnd={setEnd}
                />
            )}

            {/* is detailed mode */}
            {
                source?.withDetailedMode && (
                    <div className={`flex items-center gap-1 p-2 rounded-md bg-primary-100/50 text-primary-300`}>
                        <Info size={17} />
                        <p className="text-xs mt-1 font-medium">
                            This asset was ingested using <b>Detailed Mode</b>, therefore you will get <b>high detailed results</b>.
                        </p>
                    </div>
                )
            }

            <GenerateButton
                isPending={isPending}
                disabled={!canGenerate}
                onClick={generateTimeSegmentDescription}
            />
            {/* <button onClick={() => setActiveStudioPanel(MAIN_STUDIO_PANELS.TIME_SEGMENTS)}>Show segments</button> */}
        </div>
    );
}

function FindMomentsPane({
    sourceIds
}) {

    const {
        isProjectReadOnly
    } = useContext(ProjectContext);

    const {
        knowledgeBase,
        setCurrentMoment
    } = useContext(MainContext);

    const { notify } = useToast();


    const [context, setContext] = useState("");
    const [title, setTitle] = useState("");
    const [isPending, setIsPending] = useState(false);


    const source = knowledgeBase.find(item => item.source_id === sourceIds[0]);
    const canGenerate = !isProjectReadOnly && source && context.trim() !== "";


    async function handleCaptioning(context, title) {
        let response = await makeApiRequest('/moments', 'POST', JSON.stringify({
            prompt: context,
            title: title,
            sources: [source.source_id],
            fromCrispWiz: false
        }));

        return response;
    }

    async function generateMoment() {
        try {
            setIsPending(true);
            if (sourceIds.length > 0) {
                await makeApiRequest(
                    `/handle-embeddings`,
                    "post",
                    JSON.stringify({
                        sources: [{
                            source_id: source?.source_id,
                            index_id: source?.index_id
                        }],
                    })
                );
            }
            let { results, success, message, ...rest } = await handleCaptioning(context, title);

            if (success) {
                if (results.length > 0) {
                    const finalResults = results.map((segment) => {
                        const source = knowledgeBase.find(item => item.source_id === segment.source_id);

                        if (!source) return null;

                        return {
                            ...segment,
                            timestampText: `${source.source_path} | ${segment.timestamp}`,
                            source: {
                                ...source,
                                timestamp: segment.timestamp
                            }
                        };
                    }).filter(Boolean);
                    const moment = {
                        ...rest,
                        title: title,
                        results: finalResults
                    };

                    console.log(moment);

                    setCurrentMoment(moment);

                    setContext("");
                    setTitle("");
                } else {
                    notify({
                        variant: "info",
                        heading: "No moments found with the prompt you provided",
                        subheading: "Try providing another prompt for better results"
                    });
                }
            }
            else {
                throw new Error(message);
            }
        } catch (error) {
            notify({
                variant: "error",
                heading: "Couldn't generate moment",
                subheading: error?.message || ""
            });
            console.log(error);
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <Field label="Context">
                <InstructionsInput
                    value={context}
                    onChange={setContext}
                    actionIcon={Sparkles}
                />
            </Field>

            <Field label="Title">
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder='Write a title for this segment'
                    className="flex-1 outline-none border border-gray-200 w-full text-[12.5px] text-ink placeholder:text-ink-muted bg-gray-100 rounded-lg px-3 py-2"
                />
            </Field>
            <GenerateButton
                isPending={isPending}
                disabled={!canGenerate}
                onClick={generateMoment}
            />
        </div>
    );
}

function InstructionsInput({ value, onChange, actionIcon: ActionIcon, onAction }) {
    return (
        <div className="relative">
            <textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Add more instructions for better results"
                className="w-full min-h-[70px] border border-border rounded-lg pl-3 pr-12 py-2.5 text-[12.5px] text-ink bg-gray-100 placeholder:text-ink-muted outline-none focus:border-primary resize-y"
            />
            {/* <button
                type="button"
                onClick={onAction}
                aria-label="Run"
                className="absolute bottom-2 right-2 w-8 h-8 rounded-lg bg-grad text-white flex items-center justify-center hover:brightness-105"
            >
                <ActionIcon size={14} />
            </button> */}
        </div>
    );
}

function GenerateButton({ isPending, disabled, onClick }) {
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={onClick}
            className="w-full flex items-center justify-center gap-1.5 rounded-lg py-3 text-[13.5px] font-bold bg-gradient-to-br from-primary-200 to-primary-300 text-white text-xs hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
            {
                isPending ? (
                    <LoadingSpinner isSmall />
                ) : (
                    <Sparkles size={14} />
                )
            }
            Generate
        </button>
    );
}

function Field({ label, children }) {
    return (
        <div>
            <label className="block text-[12.5px] font-semibold text-ink mb-1.5">{label}</label>
            {children}
        </div>
    );
}
