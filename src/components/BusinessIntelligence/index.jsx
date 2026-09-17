import React, { useContext, useRef, useState } from 'react';
import Field from "../Field";
import SourcesDropdown from '../SourcesDropdown';
import { MainContext } from '../../contexts/mainContext';
import { useToast } from '../../contexts/toastContext';
import { ProjectContext } from '../../contexts/projectContext';
import {
    Sparkles,
    Info
} from "lucide-react";
import BaseHeading from '../BaseHeading';
import TimestampPicker from '../TimestampPicker';
import PageNumbersPicker from '../PageNumbersPicker';
import { DEFAULT_TOTAL_PDF_PAGES } from '../../globals';
import useMetadata from '../../hooks/useMetadata';
import { formatTime } from '../../utils';
import makeApiRequest from '../../api';


const STEPS = [
    "Generating metadata...",
    "Generating business intelligence...",
    "Generating graph content...",
    "Almost there..."
];

function BusinessIntelligence() {

    const { isProjectReadOnly } = useContext(ProjectContext);

    const {
        knowledgeBase,
        setSelectedJsonEntity,
        sourceIds, setSourceIds,
        isGenerating, setIsGenerating,
        context, setContext,
        title, setTitle,
        isInfoTooltipOpen, setIsInfoTooltipOpen,
        formatted, setFormatted,
        jsonInput, setJsonInput,
        fileInputRef,
        error, setError,
        fullLength, setFullLength,
        start, setStart,
        end, setEnd,
        from, setFrom,
        to, setTo,
        step, setStep,
    } = useContext(MainContext);

    const {
        notify
    } = useToast();

    const { generateMetadata } = useMetadata();



    const sources = knowledgeBase.filter(item => item.file_type === "video" || item.file_type === "pdf");
    const selectedSources = sources.filter(item => sourceIds.includes(item.source_id));
    // This state displays the current process description during the generation phase.


    const selectedSourceType = selectedSources[0]?.file_type;
    const canGenerate = !isProjectReadOnly && sourceIds.length > 0 && context.trim().length > 0;
    const sourceHasMetadata = Boolean(selectedSources[0]?.metadata?.summary?.content?.length > 0 && selectedSources[0]?.metadata?.highlights?.content?.length > 0 && selectedSources[0]?.metadata?.chapters?.content?.length > 0);


    const formatJSON = (json) => {
        try {
            const parsed = JSON.parse(json);
            const pretty = JSON.stringify(parsed, null, 2);
            setFormatted(pretty);
            setError("");
        } catch (err) {
            setError("Invalid business schema!");
            setFormatted("");
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setJsonInput(value);
        formatJSON(value);
    };

    const handleFileUpload = (e) => {

        const file = e.target.files[0];
        if (!file) return;

        console.log("sd");
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            setJsonInput(text);
            formatJSON(text);
        };
        reader.readAsText(file);
    };

    const handleTabClick = (e) => {
        if (e.key === "Tab") {
            e.preventDefault();

            const start = e.target.selectionStart;
            const end = e.target.selectionEnd;

            if (e.shiftKey) {
                // Remove tab
                const before = jsonInput.substring(0, start);
                if (before.endsWith("\t")) {
                    const newValue =
                        jsonInput.substring(0, start - 1) +
                        jsonInput.substring(end);
                    setJsonInput(newValue);

                    setTimeout(() => {
                        e.target.selectionStart = e.target.selectionEnd = start - 1;
                    }, 0);
                }
            } else {
                // Add tab
                const newValue =
                    jsonInput.substring(0, start) +
                    "\t" +
                    jsonInput.substring(end);

                setJsonInput(newValue);

                setTimeout(() => {
                    e.target.selectionStart = e.target.selectionEnd = start + 1;
                }, 0);
            }
        }
    };

    async function handleGenerateEntity() {
        try {
            if (!canGenerate) return;

            setIsGenerating(true);
            setStep("");

            if (!sourceHasMetadata) {
                setStep(STEPS[0]);
                await generateMetadata("", "medium", [{ id: "summary" }, { id: "highlights" }, { id: "chapters" }], [selectedSources[0]], { isGraph: true });
            }

            setStep(STEPS[1]);
            const payload = {
                sources: { file_type: selectedSources[0].file_type, source_id: selectedSources[0].source_id, index_id: selectedSources[0].index_id },
                selectedOptions: ["graph"],
                inputContext: context,
                ontology: jsonInput,
                title,
                isFullSource: fullLength,
                from: selectedSources[0].file_type === "video" ? formatTime(start) : Number(from),
                to: selectedSources[0].file_type === "video" ? formatTime(end) : Number(to),
            };
            let response = await makeApiRequest('/graphs', 'POST', payload);

            setStep(STEPS.at(-1));
            setSelectedJsonEntity(response);
            notify({
                variant: "success",
                heading: "Entity generated successfully!"
            });
            setContext("");
        } catch (error) {
            console.log(error);
        } finally {
            setIsGenerating(false);
            setStep("");
        }

    }


    return (
        <div className="h-full  px-[14px] min-h-0 flex flex-col overflow-hidden bg-white">
            <div className="pt-4 pb-3 border-b border-border shrink-0">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-[14.5px] font-semibold text-ink">Business Intelligence</h2>
                </div>
                <p className="text-xs text-ink-secondary mt-0.5">Analyze videos and documents and turn their content into detailed, machine-readable JSON format.</p>
            </div>

            <div className="flex-1 min-h-0 mb-3 overflow-y-auto">
                <Field label="Assets">
                    <SourcesDropdown
                        sources={sources}
                        selectedSourceIds={sourceIds}
                        onSelectedSourceIdsChange={setSourceIds}
                    />
                </Field>

                <Field label="">
                    {/* FULL ASSET LENGTH */}
                    {
                        selectedSources.length > 0 && (
                            <label className="flex items-center gap-2 text-[12.5px] font-medium text-ink cursor-pointer w-fit">
                                <input
                                    type="checkbox"
                                    checked={fullLength}
                                    onChange={(e) => setFullLength(e.target.checked)}
                                    className="w-4 h-4 rounded accent-primary"
                                />
                                Include full asset length
                            </label>
                        )
                    }

                    {
                        !fullLength && (
                            <>
                                {
                                    selectedSourceType === "video" ? (
                                        <TimestampPicker
                                            start={start}
                                            setStart={setStart}
                                            end={end}
                                            setEnd={setEnd}
                                        />
                                    ) : selectedSourceType === "pdf" ? (
                                        <PageNumbersPicker
                                            totalPages={selectedSources[0]?.total_pages || DEFAULT_TOTAL_PDF_PAGES}
                                            setStart={setFrom}
                                            setEnd={setTo}
                                            isDisabled={fullLength}
                                        />
                                    ) : null
                                }
                            </>
                        )
                    }
                </Field>

                <Field label="Context">
                    <textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Add context to guide the generation (e.g. travel, finance, etc.)"
                        className="w-full min-h-[78px] border border-border rounded-lg px-2.5 py-2.5 text-[12.5px] text-ink placeholder:text-ink-muted outline-none focus:border-primary resize-y bg-gray-100"
                    />
                </Field>

                {/* JSON INPUT */}
                <div className="relative w-full pt-4">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="relative flex items-center gap-1 flex-1">
                            <label className="block text-[12.5px] font-semibold text-ink">Business Schema (optional)</label>
                            <Info onMouseOver={() => setIsInfoTooltipOpen(true)} onMouseLeave={() => setIsInfoTooltipOpen(false)} className={`!relative !w-5`} />

                            {
                                isInfoTooltipOpen && (
                                    <div className={`absolute right-0 p-2 bg-background_workspace shadow-lg rounded-md w-[300px] max-w-[300px] left-0 z-40 top-full text-textColor-200 !border !border-textColor-100/50 text-sm`}>If no business schema was provided, the generation will be based on the context.</div>
                                )
                            }
                        </div>
                        <button className={`font-medium text-sm p-2 bg-transparent border border-textColor-100 rounded-lg focus:outline-none`}
                            onClick={() => fileInputRef.current.click()}
                        >
                            Upload JSON
                        </button>
                        <input type="file" ref={fileInputRef} accept=".json" style={{ display: 'none' }} onChange={handleFileUpload} />
                    </div>
                    <textarea
                        value={jsonInput}
                        onChange={handleChange}
                        placeholder="Paste or type business schema here (in JSON format)..."
                        className="w-full min-h-[78px] border border-border rounded-lg px-2.5 py-2.5 text-[12.5px] text-ink placeholder:text-ink-muted outline-none focus:border-primary resize-y bg-gray-100"
                        onKeyDown={handleTabClick}
                    />

                    {/* Error */}
                    {(error && jsonInput.trim().length > 0) && (
                        <BaseHeading className="!text-red-500 font-medium" text={error} />
                    )}
                </div>

                <Field label="Title (Optional)">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder='Write a title for the entity'
                        className="flex-1 outline-none border border-gray-200 w-full text-[12.5px] text-ink placeholder:text-ink-muted bg-gray-100 rounded-lg px-3 py-2"
                    />
                </Field>
            </div>

            <div className="py-3.5 border-t border-border shrink-0">
                <button
                    type="button"
                    disabled={!canGenerate}
                    onClick={handleGenerateEntity}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg py-3 text-[13.5px] font-bold bg-gradient-to-br from-primary-200 to-primary-300 text-white text-xs hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    <Sparkles size={14} className={`${isGenerating && "animate-customPulse"}`} />
                    <span className={`${isGenerating && "animate-customPulse"}`}>
                        {
                            isGenerating ? `${step}` : "Generate"
                        }
                    </span>
                </button>
            </div>
        </div>
    );
}

export default BusinessIntelligence;