import { Check, ChevronDown, Sparkles } from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext';
import { useToast } from '../../contexts/toastContext';
import { VERBOSITY_OPTIONS } from '../../globals';
import CollapsibleSection from "../CollapsibleSection";
import MetadataVerbosity from '../MetadataVerbosity';
import SourcesDropdown from "../SourcesDropdown";
import Field from '../Field';

export default function ContextualMetadata({
    className = "",
}) {

    const {
        knowledgeBase,
        setKnowledgeBase,
        selectedOptions,
        setSelectedOptions,
        metadataOptions,
        setGeneratedResources,
        currentResource,
        setCurrentResource,
        contextualMetadataSourceIds,
        setContextualMetadataSourceIds,
        isGeneratingMetadata,
        setIsGeneratingMetadata,
        contextualMetadataContext,
        setContextualMetadataContext,
        contextualMetadataVerbosity,
        setContextualMetadataVerbosity
    } = useContext(MainContext);

    const {
        notify
    } = useToast();

    // const videoSources = knowledgeBase.filter(item => item.file_type === "video");

    const canGenerate = contextualMetadataSourceIds.length > 0;


    function handleMetadataOptionValuesChange(newValues) {
        // newValues = ["sum", "high", ...]
        setSelectedOptions(() => {
            let newVals = metadataOptions.filter(item => newValues.includes(item.name));
            return newVals;
        });
    }

    async function handleGenerateMetadata({ sourceIds }) {
        setIsGeneratingMetadata(true);
        const sourcesUsed = knowledgeBase.filter(i => sourceIds.includes(i.source_id));

        try {

            const payload = {
                sources: sourcesUsed.map(source => ({ file_type: source.file_type, source_id: source.source_id, index_id: source.index_id })),
                context: contextualMetadataContext,
                selectedOptions: selectedOptions.map(({ id }) => id),
                verboverbosityValue: contextualMetadataVerbosity.toLowerCase()
            };

            let { results, success, message } = await makeApiRequest('/metadata', 'POST', payload);
            console.log(results);

            if (!success) {
                throw new Error(message);
            }

            setKnowledgeBase(prev => {
                // Build a lookup map from results
                const resultsMap = new Map(
                    results.map(r => [r.source_path, r.metadata])
                );

                return prev.map(item => {
                    // If this item exists in results, update metadata
                    if (resultsMap.has(item.source_path)) {
                        return {
                            ...item,
                            metadata: resultsMap.get(item.source_path),
                        };
                    }

                    // Otherwise, leave it unchanged
                    return item;
                });
            });
            setGeneratedResources(results);

            // SHOW FIRST ASSET IN MAIN STUDIO IF THERE IS NO ASSET ALREADY
            const firstSourceUsed = knowledgeBase.find(item => item.source_id === sourcesUsed[0].source_id);
            if (!currentResource || currentResource.source_id !== firstSourceUsed?.source_id) {
                setCurrentResource(firstSourceUsed);
            }

            notify({
                variant: "success",
                heading: message || "Metadata generated successfully!",
            });
        } catch (error) {
            console.error(error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: error.message || "You must check at least one metadata option",
            });
        } finally {
            setIsGeneratingMetadata(false);
        }
    }

    return (
        <div className={`h-full min-h-0 flex flex-col overflow-hidden bg-white ${className}`}>
            <div className="px-[18px] pt-4 pb-3 border-b border-border shrink-0">
                <h2 className="font-display text-[14.5px] font-semibold text-ink">Generate metadata</h2>
                <p className="text-xs text-ink-secondary mt-0.5">Create structured metadata for the selected source.</p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-[18px]">
                <Field label="assets">
                    <SourcesDropdown
                        sources={knowledgeBase}
                        selectedSourceIds={contextualMetadataSourceIds}
                        onSelectedSourceIdsChange={setContextualMetadataSourceIds}
                    />
                </Field>

                <Field label="Context">
                    <textarea
                        value={contextualMetadataContext}
                        onChange={(e) => setContextualMetadataContext(e.target.value)}
                        placeholder="Add context to guide the generation — audience, tone, or what to focus on…"
                        className="w-full min-h-[78px] border border-border rounded-lg px-2.5 py-2.5 text-[12.5px] text-ink placeholder:text-ink-muted outline-none focus:border-primary resize-y bg-gray-100"
                    />
                </Field>

                <Field label="Output format">
                    <MultiSelectDropdown values={selectedOptions.map(item => item.name)} onChange={(vals) => handleMetadataOptionValuesChange(vals)} options={metadataOptions.map(item => item.name)} />
                </Field>

                <CollapsibleSection title="Advanced settings" defaultOpen>
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <label className="text-[12px] font-medium text-ink-secondary">Verbosity</label>
                            {/* <span className="text-[12px] font-semibold px-1 rounded-md bg-primary-100/50 text-primary-300">{formatDuration(verbosity)}</span> */}
                        </div>
                        {/* <VerbositySlider value={contextualMetadataVerbosity} onChange={setContextualMetadataVerbosity} /> */}
                        <MetadataVerbosity options={VERBOSITY_OPTIONS} onChange={setContextualMetadataVerbosity} />
                        <p className="text-[11.5px] text-ink-muted mt-3">
                            Controls how much detail is included in the generated fields.
                        </p>
                    </div>
                </CollapsibleSection>
            </div>

            <div className="px-[18px] py-3.5 border-t border-border shrink-0">
                <button
                    type="button"
                    disabled={!canGenerate}
                    onClick={() => handleGenerateMetadata({ sourceIds: contextualMetadataSourceIds, context: contextualMetadataContext, selectedOptions, setSelectedOptions, verbosity: contextualMetadataVerbosity })}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg py-3 text-[13.5px] font-bold bg-gradient-to-br from-primary-200 to-primary-300 text-white text-xs hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    <Sparkles size={14} className={`${isGeneratingMetadata && "animate-customPulse"}`} />
                    <span className={`${isGeneratingMetadata && "animate-customPulse"}`}>
                        {
                            isGeneratingMetadata ? "Generating metadata" : "Generate metadata"
                        }
                    </span>
                </button>
            </div>
        </div>
    );
}

function MultiSelectDropdown({ values, onChange, options }) {

    const {
        metadataOptions
    } = useContext(MainContext);

    const [open, setOpen] = useState(false);
    const rootRef = useRef(null);

    const metadataOptionsDescriptions = metadataOptions.map(item => item.description);

    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    const toggleOption = (opt) => {
        onChange(values.includes(opt) ? values.filter((v) => v !== opt) : [...values, opt]);
    };

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-2 border border-border rounded-lg px-3 py-2.5 text-[12.5px] text-ink bg-surface hover:border-border-strong"
            >
                <div className="flex flex-col gap-1">
                    <span className="truncate">
                        {values.length === 0 ? <span className="text-ink-muted">Select output format</span> : values.join(", ")}
                    </span>
                </div>
                <ChevronDown size={14} className={`text-ink-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>
            {open && (
                <div className="absolute z-30 bg-white top-[calc(100%+6px)] left-0 right-0 bg-surface border border-border rounded-xl shadow-md2 p-1.5">
                    {options.map((opt, index) => {
                        const checked = values.includes(opt);
                        return (
                            <button key={opt} type="button" onClick={() => toggleOption(opt)} className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[12.5px] text-left text-ink hover:bg-surface-alt">
                                <div className="flex flex-col gap-1">
                                    {opt}
                                    <p className="text-xs text-ink-secondary mt-0.5">
                                        {metadataOptionsDescriptions[index]}
                                    </p>
                                </div>
                                <span className={`w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 ${checked ? "bg-primary border-primary text-white" : "border-border-strong"}`}>
                                    {checked && <Check size={10} strokeWidth={3} />}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
