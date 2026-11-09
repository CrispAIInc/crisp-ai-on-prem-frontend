// import React, { useContext, useState } from 'react';
// import Field from '../Field';
// import SourcesDropdown from '../SourcesDropdown';
// import { MainContext } from '../../contexts/mainContext';
// import { DEFAULT_TOTAL_PDF_PAGES, MAIN_STUDIO_PANELS } from '../../globals';
// import TimestampPicker from '../TimestampPicker';
// import PageNumbersPicker from '../PageNumbersPicker';
// import { ProjectContext } from '../../contexts/projectContext';
// import {
//     Sparkles
// } from "lucide-react";
// import { formatTime, isValidPageFrame, isValidTimeFrame } from '../../utils';
// import useMetadata from '../../hooks/useMetadata';
// import makeApiRequest from '../../api';
// import { useToast } from '../../contexts/toastContext';


// const STEPS = [
//     "Generating metadata...",
//     "Generating business intelligence...",
//     "Generating blog content...",
//     "Almost there..."
// ];
// function Blogs({ embedded = false }) {

//     const { isProjectReadOnly } = useContext(ProjectContext);

//     const {
//         knowledgeBase,
//         setSelectedBlog,
//         setBlogs,
//         setActiveStudioPanel,
//     } = useContext(MainContext);

//     const { generateMetadata } = useMetadata();

//     const { notify } = useToast();


//     const [sourceIds, setSourceIds] = useState([]);
//     const [context, setContext] = useState("");
//     const [fullLength, setFullLength] = useState(false);
//     const [start, setStart] = useState({ h: "00", m: "00", s: "00" });
//     const [end, setEnd] = useState({ h: "00", m: "00", s: "00" });
//     const [from, setFrom] = useState("1");
//     const [step, setStep] = useState("");
//     const [isGenerating, setIsGenerating] = useState(false);

//     const sources = knowledgeBase.filter(item => item.file_type === "video" || item.file_type === "pdf");
//     const selectedSources = sources.filter(item => sourceIds.includes(item.source_id));
//     const [to, setTo] = useState(selectedSources[0]?.total_pages || DEFAULT_TOTAL_PDF_PAGES);
//     const selectedSourceType = selectedSources[0]?.file_type;
//     const canGenerate = !isProjectReadOnly && sourceIds.length > 0 && context.trim().length > 0;
//     const sourceHasMetadata = Boolean(selectedSources[0]?.metadata?.summary?.content?.length > 0 && selectedSources[0]?.metadata?.highlights?.content?.length > 0 && selectedSources[0]?.metadata?.chapters?.content?.length > 0);

//     async function generateBlog() {
//         try {
//             if (!canGenerate) return;

//             if (!fullLength && selectedSources[0].file_type === "video" && !isValidTimeFrame(selectedSources[0].source_duration, start, end)) {
//                 throw new Error("Invalid time frame selected.");
//             }

//             if (!fullLength && selectedSources[0].file_type === "pdf" && !isValidPageFrame(selectedSources[0].total_pages, from, to)) {
//                 throw new Error("Invalid page frame selected.");
//             }


//             setIsGenerating(true);

//             setStep("");

//             // ============== generating metadata =====================
//             if (!sourceHasMetadata) {
//                 setStep(STEPS[0]);
//                 await generateMetadata("", "medium", [{ id: "summary" }, { id: "highlights" }, { id: "chapters" }], [selectedSources[0]], { isGraph: true });
//             }

//             // =============== generating blog ===================
//             setStep(STEPS[2]);
//             const payload = {
//                 sources: { file_type: selectedSources[0].file_type, source_id: selectedSources[0].source_id, index_id: selectedSources[0].index_id },
//                 isFullSource: fullLength,
//                 from: selectedSources[0].file_type === "video" ? formatTime(start) : Number(from),
//                 to: selectedSources[0].file_type === "video" ? formatTime(end) : Number(to),
//                 context: context
//             };
//             const { success, message, ...newBlog } = await makeApiRequest('/blogs', 'POST', payload);

//             if (success) {
//                 setStep(STEPS[3]);
//                 setBlogs(prev => [...prev, newBlog]);
//                 setSelectedBlog(newBlog);
//                 setActiveStudioPanel(MAIN_STUDIO_PANELS.BLOGS);
//                 // setShowBlogModal(true);
//             } else {
//                 throw new Error(message || "couldn't donwload the blog");
//             }

//         } catch (error) {
//             console.log(error);
//             notify({
//                 variant: "error",
//                 heading: "Couldn't generate blog",
//                 subheading: error.message || "Something went wrong. Please verify your inputs and try again..",
//             });
//         } finally {
//             setIsGenerating(false);
//             setStep("");
//         }
//     }

//     const horizontalPadding = embedded ? "px-[14px]" : "px-[14px]";

//     return (
//         <div className="h-full min-h-0 flex flex-col overflow-hidden bg-white">
//             {!embedded && (
//                 <div className={`${horizontalPadding} pt-4 pb-3 border-b border-border shrink-0`}>
//                     <div className="flex items-center justify-between gap-2">
//                         <h2 className="font-display text-[14.5px] font-semibold text-ink">Generate Blogs</h2>
//                     </div>
//                     <p className="text-xs text-ink-secondary mt-0.5">Extract insights from your files and turn them into well-structured, publish-ready blogs.</p>
//                 </div>
//             )}

//             <div className={`flex-1 min-h-0 overflow-y-auto ${horizontalPadding} ${embedded ? "pt-3.5 pb-3 mb-0" : "mb-3"}`}>
//                 <Field label="Sources">
//                     <SourcesDropdown
//                         sources={sources}
//                         selectedSourceIds={sourceIds}
//                         onSelectedSourceIdsChange={setSourceIds}
//                         isMultiple={false}
//                     />
//                 </Field>

//                 <Field label="Context">
//                     <textarea
//                         value={context}
//                         onChange={(e) => setContext(e.target.value)}
//                         placeholder="Add context to guide the generation (e.g. travel, finance, etc.)"
//                         className="w-full min-h-[78px] border border-border rounded-lg px-2.5 py-2.5 text-[12.5px] text-ink placeholder:text-ink-muted outline-none focus:border-primary resize-y bg-gray-100"
//                     />
//                 </Field>

//                 {/* FULL ASSET LENGTH */}
//                 <Field label="">
//                     {
//                         selectedSources.length > 0 && (
//                             <label className="flex items-center gap-2 text-[12.5px] font-medium text-ink cursor-pointer w-fit">
//                                 <input
//                                     type="checkbox"
//                                     checked={fullLength}
//                                     onChange={(e) => setFullLength(e.target.checked)}
//                                     className="w-4 h-4 rounded accent-primary"
//                                 />
//                                 Include full asset length
//                             </label>
//                         )
//                     }

//                     {
//                         !fullLength && (
//                             <>
//                                 {
//                                     selectedSourceType === "video" ? (
//                                         <TimestampPicker
//                                             start={start}
//                                             setStart={setStart}
//                                             end={end}
//                                             setEnd={setEnd}
//                                         />
//                                     ) : selectedSourceType === "pdf" ? (
//                                         <PageNumbersPicker
//                                             totalPages={selectedSources[0]?.total_pages || DEFAULT_TOTAL_PDF_PAGES}
//                                             setStart={setFrom}
//                                             setEnd={setTo}
//                                             isDisabled={fullLength}
//                                         />
//                                     ) : null
//                                 }
//                             </>
//                         )
//                     }
//                 </Field>
//             </div>

//             <div className={`${horizontalPadding} py-3.5 border-t border-border shrink-0`}>
//                 <button
//                     type="button"
//                     disabled={!canGenerate}
//                     onClick={generateBlog}
//                     className="w-full flex items-center justify-center gap-1.5 rounded-lg py-3 text-[13.5px] font-bold gradient-primary text-white text-xs hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
//                 >
//                     <Sparkles size={14} className={`${isGenerating && "animate-customPulse"}`} />
//                     <span className={`${isGenerating && "animate-customPulse"}`}>
//                         {
//                             isGenerating ? "Generating..." : "Generate"
//                         }
//                     </span>
//                 </button>
//             </div>
//         </div>
//     );
// }

// export default Blogs;


import React, { useContext, useRef, useState } from 'react';
import Field from '../Field';
import SourcesDropdown from '../SourcesDropdown';
import { MainContext } from '../../contexts/mainContext';
import { DEFAULT_TOTAL_PDF_PAGES, MAIN_STUDIO_PANELS } from '../../globals';
import TimestampPicker from '../TimestampPicker';
import PageNumbersPicker from '../PageNumbersPicker';
import { ProjectContext } from '../../contexts/projectContext';
import {
    Info,
    Sparkles
} from "lucide-react";
import { formatTime, isValidPageFrame, isValidTimeFrame } from '../../utils';
import useMetadata from '../../hooks/useMetadata';
import makeApiRequest from '../../api';
import { useToast } from '../../contexts/toastContext';


const STEPS = [
    "Generating metadata...",
    "Generating business intelligence...",
    "Generating blog content...",
    "Almost there..."
];
function Blogs({ embedded = false }) {

    const { isProjectReadOnly } = useContext(ProjectContext);

    const {
        knowledgeBase,
        setSelectedBlog,
        setBlogs,
        setActiveStudioPanel,
    } = useContext(MainContext);

    const { generateMetadata } = useMetadata();

    const { notify } = useToast();


    const [sourceIds, setSourceIds] = useState([]);
    const [context, setContext] = useState("");
    const [fullLength, setFullLength] = useState(false);
    const [start, setStart] = useState({ h: "00", m: "00", s: "00" });
    const [end, setEnd] = useState({ h: "00", m: "00", s: "00" });
    const [from, setFrom] = useState("1");
    const [step, setStep] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [title, setTitle] = useState("");
    const [businessSchema, setBusinessSchema] = useState("");
    const [schemaError, setSchemaError] = useState("");
    const [isSchemaInfoOpen, setIsSchemaInfoOpen] = useState(false);
    const fileInputRef = useRef(null);

    const sources = knowledgeBase.filter(item => item.file_type === "video" || item.file_type === "pdf");
    const selectedSources = sources.filter(item => sourceIds.includes(item.source_id));
    const [to, setTo] = useState(selectedSources[0]?.total_pages || DEFAULT_TOTAL_PDF_PAGES);
    const selectedSourceType = selectedSources[0]?.file_type;
    const canGenerate = !isProjectReadOnly && sourceIds.length > 0 && context.trim().length > 0 && !schemaError;
    const sourceHasMetadata = Boolean(selectedSources[0]?.metadata?.summary?.content?.length > 0 && selectedSources[0]?.metadata?.highlights?.content?.length > 0 && selectedSources[0]?.metadata?.chapters?.content?.length > 0);

    function handleBusinessSchemaChange(value) {
        setBusinessSchema(value);
        if (!value.trim()) {
            setSchemaError("");
            return;
        }

        try {
            JSON.parse(value);
            setSchemaError("");
        } catch {
            setSchemaError("Invalid business schema!");
        }
    }

    function handleSchemaFileUpload(event) {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = () => {
            handleBusinessSchemaChange(String(reader.result || ""));
        };
        reader.onerror = () => {
            setSchemaError("Could not read the business schema file.");
        };
        reader.readAsText(file);
        event.target.value = "";
    }

    async function generateBlog() {
        try {
            if (!canGenerate) return;

            if (!fullLength && selectedSources[0].file_type === "video" && !isValidTimeFrame(selectedSources[0].source_duration, start, end)) {
                throw new Error("Invalid time frame selected.");
            }

            if (!fullLength && selectedSources[0].file_type === "pdf" && !isValidPageFrame(selectedSources[0].total_pages, from, to)) {
                throw new Error("Invalid page frame selected.");
            }


            setIsGenerating(true);

            setStep("");

            // ============== generating metadata =====================
            if (!sourceHasMetadata) {
                setStep(STEPS[0]);
                await generateMetadata("", "medium", [{ id: "summary" }, { id: "highlights" }, { id: "chapters" }], [selectedSources[0]], { isGraph: true });
            }

            // =============== generating blog ===================
            setStep(STEPS[2]);
            const payload = {
                sources: {
                    file_type: selectedSources[0].file_type,
                    source_id: selectedSources[0].source_id,
                    index_id: selectedSources[0].index_id,
                    source_path: selectedSources[0].source_path,
                    category: selectedSources[0].category,
                },
                isFullSource: fullLength,
                from: selectedSources[0].file_type === "video" ? formatTime(start) : Number(from),
                to: selectedSources[0].file_type === "video" ? formatTime(end) : Number(to),
                context,
                inputContext: context,
                title: title.trim(),
                ontology: businessSchema.trim(),
            };
            const { success, message, ...newBlog } = await makeApiRequest('/blog', 'POST', payload);

            if (success) {
                setStep(STEPS[3]);
                setBlogs(prev => [...prev, newBlog]);
                setSelectedBlog(newBlog);
                setActiveStudioPanel(MAIN_STUDIO_PANELS.BLOGS);
                // setShowBlogModal(true);
            } else {
                throw new Error(message || "couldn't donwload the blog");
            }

        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Couldn't generate blog",
                subheading: error.message || "Something went wrong. Please verify your inputs and try again..",
            });
        } finally {
            setIsGenerating(false);
            setStep("");
        }
    }

    const horizontalPadding = embedded ? "px-[14px]" : "px-[14px]";

    return (
        <div className="h-full min-h-0 flex flex-col overflow-hidden bg-white">
            {!embedded && (
                <div className={`${horizontalPadding} pt-4 pb-3 border-b border-border shrink-0`}>
                    <div className="flex items-center justify-between gap-2">
                        <h2 className="font-display text-[14.5px] font-semibold text-ink">Generate Blogs</h2>
                    </div>
                    <p className="text-xs text-ink-secondary mt-0.5">Extract insights from your files and turn them into well-structured, publish-ready blogs.</p>
                </div>
            )}

            <div className={`flex-1 min-h-0 overflow-y-auto ${horizontalPadding} ${embedded ? "pt-3.5 pb-3 mb-0" : "mb-3"}`}>
                <Field label="Assets">
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

                <div className="relative w-full pt-1">
                    <div className="mb-1 flex items-center gap-2">
                        <div className="relative flex flex-1 items-center gap-1">
                            <label className="text-[12.5px] font-semibold text-ink">Business Schema (Optional)</label>
                            <Info
                                aria-label="Business schema help"
                                onMouseEnter={() => setIsSchemaInfoOpen(true)}
                                onMouseLeave={() => setIsSchemaInfoOpen(false)}
                                className="relative w-5 cursor-help"
                            />
                            {isSchemaInfoOpen && (
                                <div className="absolute left-0 top-full z-40 w-[300px] max-w-full rounded-md border border-textColor-100/50 bg-background_workspace p-2 text-sm text-textColor-200 shadow-lg">
                                    Add a JSON schema to guide the blog&apos;s structure and the business information it covers. If omitted, the blog is based on the source and context.
                                </div>
                            )}
                        </div>
                        <button
                            type="button"
                            className="rounded-lg border border-textColor-100 bg-transparent p-2 text-sm font-medium focus:outline-none"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            Upload JSON
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".json,application/json"
                            className="hidden"
                            onChange={handleSchemaFileUpload}
                        />
                    </div>
                    <textarea
                        value={businessSchema}
                        onChange={(e) => handleBusinessSchemaChange(e.target.value)}
                        placeholder="Paste or type business schema here (in JSON format)..."
                        className="w-full min-h-[78px] resize-y rounded-lg border border-border bg-gray-100 px-2.5 py-2.5 text-[12.5px] text-ink placeholder:text-ink-muted outline-none focus:border-primary"
                    />
                    {schemaError && (
                        <p role="alert" className="mt-1 text-xs font-medium text-red-500">{schemaError}</p>
                    )}
                </div>

                {/* FULL ASSET LENGTH */}
                <Field label="">
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

                <Field label="Title (Optional)">
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Write a title for the blog"
                        className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-[12.5px] text-ink placeholder:text-ink-muted outline-none focus:border-primary"
                    />
                </Field>
            </div>

            <div className={`${horizontalPadding} py-3.5 border-t border-border shrink-0`}>
                <button
                    type="button"
                    disabled={!canGenerate}
                    onClick={generateBlog}
                    className="w-full flex items-center justify-center gap-1.5 rounded-lg py-3 text-[13.5px] font-bold gradient-primary text-white text-xs hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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