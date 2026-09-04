import { useState, useRef, useEffect, useContext } from "react";
import { MainContext } from '../../contexts/mainContext';
import {
    Sparkles,
    Pencil,
    Trash
} from "lucide-react";
import CollapsibleSection from "../CollapsibleSection";
import SourcesDropdown from "../SourcesDropdown";
import VerbositySlider from '../VerbositySlider';
import makeApiRequest from '../../api';
import { useToast } from '../../contexts/toastContext';
import { convertSecondsToHumanText, searchByKey, sortArrayOfObjects, sortBySourcePath } from '../../utils';
import FilenameUpdateModal from "../AppSingleValueModal";
import { ProjectContext } from '../../contexts/projectContext';
import BaseHeading from '../BaseHeading';
import useFirebase from '../../hooks/useFirebase';
import useResources from '../../hooks/useResources';
import ActionMenu from '../ActionMenu';
import AnimatedText from '../AnimatedText';
import LoadingSpinner from '../LoadingSpinner';
import { MAIN_STUDIO_PANELS } from '../../globals';
import RippleButton from '../RippleButton';


export default function Shorts() {

    const { isProjectReadOnly } = useContext(ProjectContext);
    const {
        knowledgeBase,
        reels,
        setReels,
        setSelectedReel,
        setActiveStudioPanel
    } = useContext(MainContext);

    const {
        notify
    } = useToast();

    const { getPublicUrl } = useFirebase();

    const { getReels } = useResources({ setReels });

    const videoSources = knowledgeBase.filter(item => item.file_type === "video");
    const [sourceIds, setSourceIds] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [context, setContext] = useState("");
    const [title, setTitle] = useState("");
    const [reelDuration, setReelDuration] = useState(30);

    const canGenerate = sourceIds.length > 0;


    const [reelsSearchValue, setReelsSearchValue] = useState("");
    const [reelsResults, setReelsResults] = useState(reels);
    useEffect(() => {
        setReelsResults(sortBySourcePath(reels));
    }, [reels]);
    const handleReelsSearch = (e) => {
        const value = e?.target?.value || "";
        setReelsSearchValue(value);

        if (value.trim() === "") {
            setReelsResults(sortArrayOfObjects(reels, "title"));
        } else {
            const filtered = searchByKey(reels, "title", value);
            setReelsResults(sortArrayOfObjects(filtered, "title"));
        }
    };

    useEffect(() => {
        handleReelsSearch();
    }, [JSON.stringify(reels)]);

    const [showUpdateReelTitleModal, setShowUpdateReelTitleModal] = useState(false);
    function handleOpenFilenameUpdateModal(event, reel) {
        event.stopPropagation();
        setReelTitleUpdateValue(reel.title);
        setShowUpdateReelTitleModal(true);
    }

    const showSelectedReel = (e, reel, index) => {
        setSelectedReel(reel);
        // setIsReelOpen(true);
    };

    const [hoveredReel, setHoveredReel] = useState(null);
    const hoveredReelRef = useRef(null);
    const handleMouseEnterReel = (id) => {
        setHoveredReel(id);
        hoveredReelRef.current = id;
    };
    const handleMouseLeaveReel = () => {
        setHoveredReel(null);
    };

    const [isReelDeleting, setIsReelDeleting] = useState(false);
    async function deleteReel(event, reel) {
        if (isProjectReadOnly) return;
        event.preventDefault();
        setIsReelDeleting(true);
        try {
            const publicReelUrl = await getPublicUrl(reel.reel_video_url);
            await makeApiRequest(`/reels/${reel.id}`, 'DELETE', JSON.stringify({
                videoUrl: publicReelUrl,
            }));

            notify({
                variant: "success",
                heading: "Reel deleted successfully!",
            });
            setReels(prev => prev.filter(item => item.id !== reel.id));
            // getReels();
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "An error occurred while deleting the reel",
            });
        } finally {
            setIsReelDeleting(false);
        }
    }

    const [reelTitleUpdateValue, setReelTitleUpdateValue] = useState('');


    async function generateShort() {
        if (isProjectReadOnly) return;

        const payload = {
            sources: knowledgeBase.filter(i => sourceIds.includes(i.source_id)).map(source => ({ source_id: source.source_id, index_id: source.index_id })),
            context,
            title: title,
            verbosityValue: "low" //reelDuration
        };

        try {
            setIsGenerating(true);
            const { success, message, newReel } = await makeApiRequest('/reels', 'POST', payload);
            console.log(newReel);

            if (!success) {
                throw new Error(message);
            }

            setSelectedReel(newReel);
            setActiveStudioPanel(MAIN_STUDIO_PANELS.SHORTS);

            // setIsReelGenerated(true);
            setContext('');

        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Couldn't generate reel!",
                subheading: error?.message || "",
            });
        } finally {
            setIsGenerating(false);
        }
    }

    return (
        <div className="h-full  px-[18px] min-h-0 flex flex-col overflow-hidden bg-white">
            <div className="pt-4 pb-3 border-b border-border shrink-0">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-[14.5px] font-semibold text-ink">Generate shorts</h2>

                    <button
                        type="button"
                        onClick={() => setActiveStudioPanel(MAIN_STUDIO_PANELS.SHORTS)}
                        className="shrink-0 rounded-[10px] p-2.5 text-xs font-bold text-white bg-gradient-to-r from-primary-200 to-primary-300 hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                    >
                        Saved Shorts
                    </button>
                </div>
                <p className="text-xs text-ink-secondary mt-0.5">Turn long-form content into engaging shorts in minutes.</p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                <Field label="Sources">
                    <SourcesDropdown
                        sources={videoSources}
                        selectedSourceIds={sourceIds}
                        onSelectedSourceIdsChange={setSourceIds}
                    />
                </Field>

                <Field label="Context">
                    <p className="text-xs text-ink-secondary mb-0.5">When no context or topic is provided, the Short will be based on the existing highlights.</p>
                    <textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Add context to guide the generation — audience, tone, or what to focus on…"
                        className="w-full min-h-[78px] border border-border rounded-lg px-2.5 py-2.5 text-[12.5px] text-ink placeholder:text-ink-muted outline-none focus:border-primary resize-y bg-gray-100"
                    />
                </Field>

                <Field label="Title">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder='Write a title for the Short'
                        className="flex-1 outline-none border border-gray-200 w-full text-[12.5px] text-ink placeholder:text-ink-muted bg-gray-100 rounded-lg px-3 py-2"
                    />
                </Field>

                <CollapsibleSection title="Advanced settings" defaultOpen>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="text-sm font-medium text-ink-secondary">Short duration</label>
                            <p className="text-sm p-1 rounded-md font-bolt bg-primary-100/50 text-primary-200">{convertSecondsToHumanText(reelDuration)}</p>
                        </div>
                        <VerbositySlider value={reelDuration} onChange={setReelDuration} />
                        <p className="text-[11.5px] text-ink-muted mt-3">
                            Controls how much detail is included in the generated Short.
                        </p>
                    </div>
                </CollapsibleSection>
            </div>

            <div className="py-3.5 border-t border-border shrink-0">
                <button
                    type="button"
                    disabled={!canGenerate}
                    onClick={generateShort}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg py-3 text-[13.5px] font-bold bg-gradient-to-br from-primary-200 to-primary-300 text-white text-xs hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    <Sparkles size={14} className={`${isGenerating && "animate-customPulse"}`} />
                    <span className={`${isGenerating && "animate-customPulse"}`}>
                        {
                            isGenerating ? "Generating Short" : "Generate Short"
                        }
                    </span>
                </button>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <div className="pt-4 first:pt-4">
            <label className="block text-[12.5px] font-semibold text-ink mb-1.5">{label}</label>
            {children}
        </div>
    );
}