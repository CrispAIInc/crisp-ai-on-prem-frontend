import React, { useContext, useState } from 'react';
import Field from "../Field";
import SourcesDropdown from '../SourcesDropdown';
import { MainContext } from '../../contexts/mainContext';
import { useToast } from '../../contexts/toastContext';
import { ProjectContext } from '../../contexts/projectContext';
import {
    Sparkles
} from "lucide-react";

function BusinessIntelligence() {

    const { isProjectReadOnly } = useContext(ProjectContext);

    const {
        knowledgeBase
    } = useContext(MainContext);

    const {
        notify
    } = useToast();

    const [sourceIds, setSourceIds] = useState([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [context, setContext] = useState("");
    const [title, setTitle] = useState("");


    const sources = knowledgeBase.filter(item => item.file_type === "video" || item.file_type === "pdf");
    const canGenerate = !isProjectReadOnly && sourceIds.length > 0;


    return (
        <div className="h-full  px-[18px] min-h-0 flex flex-col overflow-hidden bg-white">
            <div className="pt-4 pb-3 border-b border-border shrink-0">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-[14.5px] font-semibold text-ink">Generate shorts</h2>
                </div>
                <p className="text-xs text-ink-secondary mt-0.5">Turn long-form content into engaging shorts in minutes.</p>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                <Field label="Sources">
                    <SourcesDropdown
                        sources={sources}
                        selectedSourceIds={sourceIds}
                        onSelectedSourceIdsChange={setSourceIds}
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

                <Field label="Title">
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
                    // onClick={generateShort}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg py-3 text-[13.5px] font-bold bg-gradient-to-br from-primary-200 to-primary-300 text-white text-xs hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                    <Sparkles size={14} className={`${isGenerating && "animate-customPulse"}`} />
                    <span className={`${isGenerating && "animate-customPulse"}`}>
                        {
                            isGenerating ? "Generating" : "Generate"
                        }
                    </span>
                </button>
            </div>
        </div>
    );
}

export default BusinessIntelligence;