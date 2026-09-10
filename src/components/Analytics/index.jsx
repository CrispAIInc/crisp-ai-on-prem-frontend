import { useContext, useEffect } from "react";
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
import Field from '../Field';

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
        moments,
        analyticsActiveTab,
        setAnalyticsActiveTab,
        analyticsSourceIds,
        setAnalyticsSourceIds
    } = useContext(MainContext);

    const videoAssets = knowledgeBase.filter(item => item.file_type === "video");

    useEffect(() => {
        setActiveStudioPanel(analyticsActiveTab);

        switch (analyticsActiveTab) {
            case "time-segments":
                setCurrentSegment(segmentDescriptions[0]);
                break;

            case "find-moments":
                setCurrentMoment(moments[0]);
                break;
        }
    }, [analyticsActiveTab]);

    return (
        <div className="h-full px-[14px] min-h-0 flex flex-col overflow-hidden bg-white">
            <div className="pt-4 pb-3 border-b border-border shrink-0">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-[14.5px] font-semibold text-ink">Generate analytics</h2>
                </div>
                <p className="text-xs text-ink-secondary mt-0.5">Analyze content to identify important information, events, and insights, linked directly to the timestamp or page where they appear.</p>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto pb-3">
                {/* Sub-navigation */}
                <nav className="pt-3.5 flex items-center gap-6">
                    {TABS.map(({ id, label, icon: Icon }) => {
                        const active = analyticsActiveTab === id;

                        return (
                            <button
                                key={id}
                                type="button"
                                aria-current={active ? "page" : undefined}
                                className={`flex items-center gap-2 text-[13px] font-semibold whitespace-nowrap ${active ? "text-primary-300 !border-b-primary-300" : "text-ink"
                                    } pb-3 border-b -mb-px transition-colors`}
                                onClick={() => setAnalyticsActiveTab(id)}
                            >
                                <Icon size={14} strokeWidth={2} />
                                {label}
                            </button>
                        );
                    })}
                </nav>

                <Field label="Sources">
                    <SourcesDropdown isMultiple={false} sources={videoAssets} selectedSourceIds={analyticsSourceIds} onSelectedSourceIdsChange={setAnalyticsSourceIds} />
                </Field>

                {analyticsActiveTab === TABS[0].id ? (
                    <TimeSegmentPane
                        sourceIds={analyticsSourceIds}
                    />
                ) : (
                    <FindMomentsPane
                        sourceIds={analyticsSourceIds}
                    />
                )}
            </div>
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
        setActiveStudioPanel,
        timeSegmentStart,
        setTimeSegmentStart,
        timeSegmentEnd,
        setTimeSegmentEnd,
        timeSegmentContext,
        setTimeSegmentContext,
        timeSegmentTitle,
        setTimeSegmentTitle,
        timeSegmentFullLength,
        setTimeSegmentFullLength,
        isGeneratingTimeSegment,
        setIsGeneratingTimeSegment,
        timeSegmentResultsDescription,
        setTimeSegmentResultsDescription
    } = useContext(MainContext);

    const { token } = useAuth();

    const { notify } = useToast();

    const source = knowledgeBase.find(item => item.source_id === sourceIds[0]);
    const canGenerate = !isProjectReadOnly && source && timeSegmentContext.trim() !== "";


    async function generateTimeSegmentDescription() {
        try {
            if (!canGenerate) {
                throw new Error('Make sure you provide video sources and context');
            }

            if (!timeSegmentFullLength && toSeconds(timeSegmentEnd) <= toSeconds(timeSegmentStart)) {
                throw new Error("Your timestamp range is invalid.");
            }

            setIsGeneratingTimeSegment(true);
            setTimeSegmentResultsDescription(prev => ({
                ...prev,
                start: formatTime(timeSegmentStart),
                end: formatTime(timeSegmentEnd),
                refs: []
            }));

            let url = new URLSearchParams();

            if (timeSegmentFullLength) {
                url.append("isFullSource", "true");
            } else {
                url.append("start_timestamp", formatTime(timeSegmentStart));
                url.append("end_timestamp", formatTime(timeSegmentEnd));
            }

            url.append("video_filename", source.source_path);
            url.append("prompt", timeSegmentContext);
            url.append("title", timeSegmentTitle);

            axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            axiosInstance.defaults.headers.common['SessionId'] = currentChat?.sessionId;
            axiosInstance.defaults.headers.common['ProjectId'] = currentProject.project_id;

            const payload = {
                isFullSource: timeSegmentFullLength,
                start_timestamp: formatTime(timeSegmentStart),
                end_timestamp: formatTime(timeSegmentEnd),
                prompt: timeSegmentContext,
                title: timeSegmentTitle,
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
            setIsGeneratingTimeSegment(false);
        }
    }

    return (
        <div className="flex flex-col">
            <Field label="Context">
                <InstructionsInput
                    value={timeSegmentContext}
                    onChange={setTimeSegmentContext}
                    actionIcon={Sparkles}
                    onAction={() => {
                        /* wire up generation here */
                    }}
                />
            </Field>

            <Field label="Title">
                <input
                    type="text"
                    value={timeSegmentTitle}
                    onChange={(e) => setTimeSegmentTitle(e.target.value)}
                    placeholder='Write a title for this segment'
                    className="flex-1 outline-none border border-gray-200 w-full text-[12.5px] text-ink placeholder:text-ink-muted bg-gray-100 rounded-lg px-3 py-2"
                />
            </Field>



            <Field label="">
                <label className="flex items-center gap-2 text-[12.5px] font-medium text-ink cursor-pointer">
                    <input
                        type="checkbox"
                        checked={timeSegmentFullLength}
                        onChange={(e) => setTimeSegmentFullLength(e.target.checked)}
                        className="w-4 h-4 rounded accent-primary"
                    />
                    Include full asset length
                </label>


                {!timeSegmentFullLength && (
                    <TimestampPicker
                        start={timeSegmentStart}
                        setStart={setTimeSegmentStart}
                        end={timeSegmentEnd}
                        setEnd={setTimeSegmentEnd}
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
            </Field>

            <Field label=""></Field>

            <GenerateButton
                isPending={isGeneratingTimeSegment}
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
        setCurrentMoment,
        findMomentsContext,
        setFindMomentsContext,
        findMomentsTitle,
        setFindMomentsTitle,
        isGeneratingMoments,
        setIsGeneratingMoments
    } = useContext(MainContext);

    const { notify } = useToast();


    const source = knowledgeBase.find(item => item.source_id === sourceIds[0]);
    const canGenerate = !isProjectReadOnly && source && findMomentsContext.trim() !== "";


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
            setIsGeneratingMoments(true);
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
            let { results, success, message, ...rest } = await handleCaptioning(findMomentsContext, findMomentsTitle);

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
                        title: findMomentsTitle,
                        results: finalResults
                    };

                    console.log(moment);

                    setCurrentMoment(moment);

                    setFindMomentsContext("");
                    setFindMomentsTitle("");
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
            setIsGeneratingMoments(false);
        }
    }

    return (
        <div className="flex flex-col">
            <Field label="Context">
                <InstructionsInput
                    value={findMomentsContext}
                    onChange={setFindMomentsContext}
                    actionIcon={Sparkles}
                />
            </Field>

            <Field label="Title">
                <input
                    type="text"
                    value={findMomentsTitle}
                    onChange={(e) => setFindMomentsTitle(e.target.value)}
                    placeholder='Write a title for this moment'
                    className="flex-1 outline-none border border-gray-200 w-full text-[12.5px] text-ink placeholder:text-ink-muted bg-gray-100 rounded-lg px-3 py-2"
                />
            </Field>

            <Field label=""></Field>

            <GenerateButton
                isPending={isGeneratingMoments}
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