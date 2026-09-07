import React, { useContext, useState } from 'react';
import Field from '../Field';
import SourcesDropdown from '../SourcesDropdown';
import { MainContext } from '../../contexts/mainContext';
import { DEFAULT_TOTAL_PDF_PAGES } from '../../globals';
import TimestampPicker from '../TimestampPicker';
import PageNumbersPicker from '../PageNumbersPicker';
import { ProjectContext } from '../../contexts/projectContext';
import {
    Sparkles
} from "lucide-react";

function Blogs() {

    const { isProjectReadOnly } = useContext(ProjectContext);

    const {
        knowledgeBase
    } = useContext(MainContext);


    const [sourceIds, setSourceIds] = useState([]);
    const [context, setContext] = useState("");
    const [fullLength, setFullLength] = useState(false);
    const [start, setStart] = useState({ h: "00", m: "00", s: "00" });
    const [end, setEnd] = useState({ h: "00", m: "00", s: "00" });
    const [from, setFrom] = useState("1");

    const [isGenerating, setIsGenerating] = useState(false);

    const sources = knowledgeBase.filter(item => item.file_type === "video" || item.file_type === "pdf");
    const selectedSources = sources.filter(item => sourceIds.includes(item.source_id));
    const [to, setTo] = useState(selectedSources[0]?.total_pages || DEFAULT_TOTAL_PDF_PAGES);
    const selectedSourceType = selectedSources[0]?.file_type;
    const canGenerate = !isProjectReadOnly && sourceIds.length > 0 && context.trim().length > 0;

    return (
        <div className="h-full px-[14px] min-h-0 flex flex-col overflow-hidden bg-white">
            <div className="pt-4 pb-3 border-b border-border shrink-0">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-[14.5px] font-semibold text-ink">Generate Blogs</h2>
                </div>
                <p className="text-xs text-ink-secondary mt-0.5">Extract insights from your files and turn them into well-structured, publish-ready blogs.</p>
            </div>

            <div className="flex-1 min-h-0 mb-3 overflow-y-auto">
                <Field label="Sources">
                    <SourcesDropdown
                        sources={sources}
                        selectedSourceIds={sourceIds}
                        onSelectedSourceIdsChange={setSourceIds}
                        isMultiple={false}
                    />
                </Field>

                <Field label="Context">
                    <textarea
                        value={context}
                        onChange={(e) => setContext(e.target.value)}
                        placeholder="Add context to guide the generation (e.g. travel, finance, etc.)"
                        className="w-full min-h-[78px] border border-border rounded-lg px-2.5 py-2.5 text-[12.5px] text-ink placeholder:text-ink-muted outline-none focus:border-primary resize-y bg-gray-100"
                    />
                </Field>

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
            </div>

            <div className="py-3.5 border-t border-border shrink-0">
                <button
                    type="button"
                    disabled={!canGenerate}
                    // onClick={handleGenerateEntity}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg py-3 text-[13.5px] font-bold bg-gradient-to-br from-primary-200 to-primary-300 text-white text-xs hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    <Sparkles size={14} className={`${isGenerating && "animate-customPulse"}`} />
                    <span className={`${isGenerating && "animate-customPulse"}`}>
                        {
                            isGenerating ? "Generating..." : "Generate"
                        }
                    </span>
                </button>
            </div>
        </div>
    );
}

export default Blogs;