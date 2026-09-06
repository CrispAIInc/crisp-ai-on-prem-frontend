import React from 'react';
import Field from "../Field";

function BusinessIntelligence() {
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

export default BusinessIntelligence;