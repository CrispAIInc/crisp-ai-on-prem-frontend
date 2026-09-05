import { useContext, useState } from "react";
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

// No props coming in — replace this with real data from wherever your app
// keeps its sources (context, a store, a fetch, etc).
const MOCK_SOURCES = [
    { source_id: "ast_1", source_path: "Usain Bolt.mp4", thumbnail: "" },
    { source_id: "ast_2", source_path: "Bill Gates.mp4", thumbnail: "" },
];

const TABS = [
    { id: "segment", label: "Time segment description", icon: Sparkles, info: "Analyze a specific video time range and generate precise breakdown." },
    { id: "moments", label: "Find moments", icon: Clock },
];

/**
 * Analytics — "Time segment description" / "Find moments" panel.
 *
 * Fully self-contained: no props in, everything lives in local state.
 * Fills 100% of its parent's height (parent needs a bounded height, e.g.
 * flex + min-h-0) and scrolls internally so it never overflows the app
 * shell.
 */
export default function Analytics() {

    const {
        knowledgeBase
    } = useContext(MainContext);

    const [activeTab, setActiveTab] = useState("segment");
    const [sourceIds, setSourceIds] = useState([]);

    const videoAssets = knowledgeBase.filter(item => item.file_type === "video");

    return (
        <div className="h-full min-h-0 overflow-y-auto px-[18px] bg-white py-4 flex flex-col gap-4">
            <Field label="Sources">
                <SourcesDropdown isMultiple={false} sources={videoAssets} selectedSourceIds={sourceIds} onSelectedSourceIdsChange={setSourceIds} />
            </Field>

            <div className="flex items-center gap-4">
                {TABS.map((tab, i) => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.id;
                    return (
                        <div key={tab.id} className="flex items-center gap-4">
                            {i > 0 && <span className="w-px h-4 bg-border" />}
                            <button
                                type="button"
                                onClick={() => setActiveTab(tab.id)}
                                aria-current={active ? "page" : undefined}
                                className={`flex items-center gap-1.5 text-[13px] font-semibold whitespace-nowrap ${active ? "text-primary-300" : "text-ink"
                                    }`}
                            >
                                <Icon size={14} />
                                {tab.label}
                                {/* {tab.info && <Info size={13} className="text-ink-muted" />} */}
                            </button>
                        </div>
                    );
                })}
            </div>

            {activeTab === "segment" ? (
                <TimeSegmentPane
                    sourceIds={sourceIds}
                />
            ) : (
                <FindMomentsPane />
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
            <button onClick={() => setActiveStudioPanel(MAIN_STUDIO_PANELS.TIME_SEGMENTS)}>Show segments</button>
        </div>
    );
}

function FindMomentsPane() {
    const [context, setContext] = useState("");
    const [title, setTitle] = useState("");

    return (
        <div className="flex flex-col gap-3">
            <InstructionsInput
                value={context}
                onChange={setContext}
                actionIcon={Search}
                onAction={() => {
                    /* wire up the moment search here */
                }}
            />

            <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Write a title for this moment"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-[12.5px] text-ink placeholder:text-ink-muted outline-none focus:border-primary"
            />

            <GenerateButton disabled={!title.trim()} onClick={() => { /* wire up the moment search here */ }} />
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

function TimeParts({ value, onChange }) {
    const handlePart = (part, raw) => {
        const num = Math.max(0, Math.min(59, Number(raw.replace(/\D/g, "")) || 0));
        onChange({ ...value, [part]: String(num).padStart(2, "0") });
    };

    return (
        <div className="flex items-center gap-1 shrink-0">
            {["h", "m", "s"].map((part, i) => (
                <span key={part} className="flex items-center gap-1">
                    {i > 0 && <span className="text-ink-muted text-[11.5px]">:</span>}
                    <input
                        type="text"
                        inputMode="numeric"
                        maxLength={2}
                        value={value[part]}
                        onChange={(e) => handlePart(part, e.target.value)}
                        className="w-8 text-center bg-surface border border-border rounded-md px-1 py-1 text-[12px] text-ink outline-none focus:border-primary"
                    />
                </span>
            ))}
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
