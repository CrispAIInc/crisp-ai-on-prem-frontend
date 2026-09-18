import { useContext, useEffect, useState } from "react";
import { Search, Globe, SearchX, SearchAlert } from "lucide-react";
import { MainContext } from '../../contexts/mainContext';
import TimelineHorizontal from '../TimelineHorizontal';
import HorizontalCard from '../HorizontalCard';
import makeApiRequest from '../../api';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';
import { useToast } from '../../contexts/toastContext';
import { timeToSeconds } from '../../utils';
import Chip from '../Chip';
import CustomSelectTwo from "../CustomSelectTwo";
import FaqItem from '../FaqItem';
import MetadataExportButton from './MetadataExportButton';

const TAB_SETS = {
    video: ["search", "transcription", "summary", "chapters", "highlights", "topics", "faqs"],
    pdf: ["search", "summary", "chapters", "highlights", "topics", "faqs"],
    img: ["summary", "topics"],
};

const TAB_LABELS = {
    search: "Search",
    transcription: "Transcription",
    summary: "Summary",
    chapters: "Chapters",
    highlights: "Highlights",
    topics: "Topics",
    faqs: "FAQs"
};

// "00:00:05" -> "0:05", "00:01:30" -> "1:30", "01:02:03" -> "1:02:03"
function formatTimestamp(value) {
    if (!value) return "";
    const parts = value.split(":").map(Number);
    const [h, m, s] = parts.length === 3 ? parts : [0, parts[0], parts[1]];
    return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${s}`;
}

export default function Metadata({
    query,
    onQueryChange,
    language = "English",
    results = [],
    onSearch,
    onResultClick,
    className = "",
    translatedResource,
    translateMetadata,
    activeTab: controlledActiveTab,
    onTabChange,
    chosenLanguage
}) {

    const {
        currentResource,
        languageOptions
    } = useContext(MainContext);

    const sourceType = currentResource?.file_type ?? "video";

    const availableTabIds = TAB_SETS[sourceType] ?? TAB_SETS.video;
    const tabs = availableTabIds.map((id) => ({ id, label: TAB_LABELS[id] }));
    const [internalTab, setInternalTab] = useState(tabs[0].id);
    const activeTab = controlledActiveTab ?? internalTab;

    const setActiveTab = (nextTab) => {
        if (onTabChange) {
            onTabChange(nextTab);
            return;
        }

        setInternalTab(nextTab);
    };

    // Reset to the first available tab if the source (and its tab set) changes
    useEffect(() => {
        const nextTab = availableTabIds[0];

        if (!availableTabIds.includes(activeTab)) {
            if (onTabChange) {
                onTabChange(nextTab);
                return;
            }

            setInternalTab(nextTab);
        }
    }, [activeTab, availableTabIds, onTabChange]);

    return (
        <div className={`h-full min-h-0 flex flex-col gap-3.5 overflow-hidden ${className}`}>
            <div className="flex gap-1 bg-surface-alt p-1 rounded-[10px] w-full bg-gray-200/30 shrink-0 overflow-x-auto">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTab(t.id)}
                        aria-current={activeTab === t.id ? "page" : undefined}
                        className={`rounded-[7px] px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${activeTab === t.id ? "bg-white text-primary-300 shadow-sm" : "bg-transparent backdrop-blur-sm text-ink-secondary hover:text-ink"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}

                {/* translation */}
                {
                    (currentResource?.metadata
                        && Object.keys(currentResource?.metadata).length > 0
                        && Object.keys(currentResource?.metadata).some(key => key !== "embeddings_generated")
                    ) && (
                        <div className={`flex items-center border px-1 border-gray-100 bg-light-hover-100/30 rounded-lg ml-auto`}>
                            <Globe size={13} />
                            <CustomSelectTwo
                                withIcon
                                options={languageOptions}
                                onChange={(lang) =>
                                    translateMetadata(lang.value, translatedResource, true)
                                }
                                placeholder="Language"
                                className="!border-none"
                            />
                        </div>
                    )}
            </div>

            <div className="flex-1 min-h-0 max-h-[420px] bg-white border border-border rounded-xl flex flex-col overflow-hidden">
                {activeTab === "search" && (
                    <SearchPane
                        query={query}
                        onQueryChange={onQueryChange}
                        language={language}
                        results={results}
                        onSearch={onSearch}
                        onResultClick={onResultClick}
                    />
                )}
                {activeTab === "transcription" && (
                    <TranscriptionPane
                        transcriptionObj={translatedResource?.transcription}
                    />
                )}
                {activeTab === "summary" && (
                    <SummaryPane
                        summaryObj={translatedResource?.summary}
                    />
                )}
                {activeTab === "chapters" && (
                    <ChaptersPane
                        chapters={translatedResource?.chapters?.content}
                    />
                )}
                {activeTab === "highlights" && (
                    <HighlightsPane
                        highlights={translatedResource?.highlights?.content}
                    />
                )}
                {activeTab === "topics" && (
                    <KeywordsPane
                        keywords={translatedResource?.keywords?.content}
                    />
                )}
                {activeTab === "faqs" && (
                    <FaqsPane
                        faqs={translatedResource?.faqs?.content}
                        chosenLanguage={chosenLanguage}
                    />
                )}
            </div>
        </div>
    );
}

function SearchPane({ query: queryProp, onQueryChange, language, results, onSearch, onResultClick }) {
    const {
        currentResource,
        selectedCategory,
        selectedFormat,
        setDiscoveredSources,
        setShowSearchModal,
        knowledgeBase,
        isPlayerReady,
        player,
    } = useContext(MainContext);

    const { handleSourceLinkClick } = useReferenceLinkClick();
    const { notify } = useToast();

    const [internalQuery, setInternalQuery] = useState("");
    const [searched, setSearched] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchOutcome, setSearchOutcome] = useState(null);

    const query = queryProp ?? internalQuery;
    const setQuery = onQueryChange ?? setInternalQuery;

    const canSearch = Boolean(query.trim());

    const handleDiscover = async () => {
        setSearched(true);

        setIsSearching(true);

        try {

            const { found, additional_sources, score, timestamp, page, message, success, ...rest } = await makeApiRequest('/discover', 'POST', JSON.stringify({
                searchQuestion: query,
                source_id: currentResource.source_id,
                format: currentResource.file_type
            })
            );

            if (!success) {
                throw new Error(message);
            }


            if (!found) {
                setDiscoveredSources(null);
                setSearchOutcome("not-found");
            }
            else {
                setSearchOutcome("found");
                const source = knowledgeBase?.find(item => item.source_id === rest.source_id);
                setDiscoveredSources({
                    mainSource: { ...source, timestamp, page: Number(page), score },
                    additionalSources: additional_sources?.map(item => {
                        const sourceItem = knowledgeBase.find(el => el.source_id === item?.source_id);
                        return {
                            ...sourceItem,
                            timestamp: item?.timestamp,
                            page: Number(item?.page) || -1,
                            score: item?.score
                        };
                    })
                });

                handleSourceLinkClick(null, { ...source, timestamp, page });
                if (isPlayerReady) player?.current?.seekTo(typeof timestamp === "number" ? timestamp : timeToSeconds(timestamp));
            }

            setShowSearchModal(true);
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: error.message || "An error occured while discovering",
            });
            setSearchOutcome("error");
        } finally {
            setIsSearching(false);
        }
    };

    return (
        <>
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
                <h3 className="font-display text-[13.5px] font-semibold text-ink">Search in current source</h3>
            </div>

            <div className="p-4 flex-1 min-h-0 overflow-y-auto flex flex-col">
                <div className="flex items-center gap-2.5 shrink-0">
                    <div className="flex-1 flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2.5">
                        <Search size={13} className="text-ink-muted shrink-0" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleDiscover()}
                            placeholder='e.g. "team collaboration", "career highlights"…'
                            className="flex-1 bg-transparent outline-none text-[12.5px] text-ink placeholder:text-ink-muted"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={handleDiscover}
                        disabled={!canSearch}
                        className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2.5 font-bold bg-gradient-to-br from-primary-200 to-primary-300 text-white hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                        <Search size={13} className={`${isSearching && 'animate-customPulse'}`} />
                        <span className={`text-xs font-bold ${isSearching && 'animate-customPulse'}`}>Search</span>
                    </button>
                </div>

                <div className="flex-1 min-h-0 flex flex-col mt-4">
                    {!searched ? (
                        <EmptyState
                            title="Search this asset's content"
                            description="Find the exact moment a topic, name, or phrase comes up — results jump straight to the right section."
                        />
                    ) : isSearching ? null :
                        searchOutcome === "not-found" ? (
                            <EmptyState
                                title="No matches found"
                                description={query ? `Nothing matched "${query}". Try a different phrase.` : "Try a different search."}
                            />
                        ) : searchOutcome === "error" ? (
                            <EmptyState
                                title="Couldn't generate results"
                                description="Please check your internet and try again later."
                                isError
                            />
                        ) : null}
                </div>
            </div>
        </>
    );
}

function MetadataPaneHeader({ title, exportButton }) {
    return (
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-border shrink-0">
            <h3 className="font-display text-[13.5px] font-semibold text-ink">{title}</h3>
            {exportButton}
        </div>
    );
}

function TranscriptionPane({ transcriptionObj }) {

    const {

        setCurrentResource,
        workspaceContainer
    } = useContext(MainContext);

    const segments = Array.isArray(transcriptionObj?.content) ? transcriptionObj.content : [];
    const hasContent = segments.length > 0;

    return (
        <>
            <MetadataPaneHeader
                title="Transcription"
                exportButton={
                    <MetadataExportButton
                        metadataType="transcription"
                        disabled={!hasContent}
                        buildPayload={() => ({ segments })}
                    />
                }
            />

            <div className="p-4 flex-1 min-h-0 overflow-y-auto flex flex-col">
                <div className="flex flex-col gap-3">
                    {
                        (transcriptionObj?.content && Array.isArray(transcriptionObj?.content)) ?
                            transcriptionObj?.content?.map((topic) => (
                                <div key={topic.content} className="flex flex-col">
                                    <div>
                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                                            setCurrentResource(prev => ({ ...prev, timestamp: topic.start_time }));
                                            workspaceContainer?.current?.scrollIntoView({
                                                behavior: "smooth",
                                                block: "start",
                                            });
                                        }}>
                                            <h6 className='mb-0 text-xs font-semibold text-primary-300 '>{topic.start_time} - {topic.end_time}</h6>
                                        </div>
                                    </div>
                                    <p className="select-text" dangerouslySetInnerHTML={{ __html: topic.content.replace(/\n/g, "<br>") }}></p>
                                </div>
                            )) : (
                                <EmptyState
                                    title="Transcription not available for this asset."
                                    icon={<SearchAlert size={19} />}
                                />
                            )
                    }
                </div>
            </div>
        </>
    );
}

function SummaryPane({ summaryObj }) {
    const hasContent = summaryObj?.content !== undefined;

    return (
        <>
            <MetadataPaneHeader
                title="Summary"
                exportButton={
                    <MetadataExportButton
                        metadataType="summary"
                        disabled={!hasContent}
                        buildPayload={() => ({ content: summaryObj?.content })}
                    />
                }
            />

            <div className="p-4 flex-1 min-h-0 overflow-y-auto flex flex-col">
                <div className="flex flex-col gap-3">
                    {
                        summaryObj?.content !== undefined ? (
                            <div
                                className="text-md text-textColor-300"
                                dangerouslySetInnerHTML={{
                                    __html: summaryObj?.content?.replace(/\n/gi, "<br />")
                                }}
                            />
                        ) : (
                            <EmptyState
                                title="Summary not available for this asset."
                                description="You can generate summary using the Contextual Metadata panel."
                                icon={<SearchAlert size={19} />}
                            />
                        )
                    }
                </div>
            </div>
        </>
    );
}

function ChaptersPane({ chapters }) {
    const { workspaceContainer } = useContext(MainContext);
    const chapterItems = Array.isArray(chapters) ? chapters : [];

    return (
        <>
            <MetadataPaneHeader
                title="Chapters"
                exportButton={
                    <MetadataExportButton
                        metadataType="chapters"
                        disabled={chapterItems.length === 0}
                        buildPayload={() => ({ chapters: chapterItems })}
                    />
                }
            />

            <div className="flex-1 min-h-0 overflow-y-auto">
                {chapterItems.length > 0 ? (
                    <TimelineHorizontal
                        chapters={chapterItems}
                        workspaceContainer={workspaceContainer}
                        theme="light"
                    />
                ) : (
                    <EmptyState
                        title="Chapters not available for this asset."
                        description="You can generate chapters using the Contextual Metadata panel."
                        icon={<SearchAlert size={19} />}
                    />
                )}
            </div>
        </>
    );
}

function HighlightsPane({ highlights }) {
    const { workspaceContainer } = useContext(MainContext);
    const highlightItems = Array.isArray(highlights) ? highlights : [];

    return (
        <>
            <MetadataPaneHeader
                title="Highlights"
                exportButton={
                    <MetadataExportButton
                        metadataType="highlights"
                        disabled={highlightItems.length === 0}
                        buildPayload={() => ({ highlights: highlightItems })}
                    />
                }
            />

            <div className="p-4 flex-1 min-h-0 overflow-y-auto">
                {highlightItems.length > 0 ? (
                    highlightItems.map((highlight, index) => (
                        <HorizontalCard
                            key={highlight.id ?? index}
                            item={highlight}
                            workspaceContainer={workspaceContainer}
                        />
                    ))
                ) : (
                    <EmptyState
                        title="Highlights not available for this asset."
                        description="You can generate highlights using the Contextual Metadata panel."
                        icon={<SearchAlert size={19} />}
                    />
                )}
            </div>
        </>
    );
}

function KeywordsPane({ keywords }) {
    const { workspaceContainer } = useContext(MainContext);
    const keywordItems = Array.isArray(keywords) ? keywords : [];

    return (
        <>
            <MetadataPaneHeader
                title="Topics"
                exportButton={
                    <MetadataExportButton
                        metadataType="topics"
                        disabled={keywordItems.length === 0}
                        buildPayload={() => ({ keywords: keywordItems })}
                    />
                }
            />

            <div className="p-4 flex-1 min-h-0 overflow-y-auto">
                {keywordItems.length > 0 ? (
                    <div className="flex items-center flex-wrap gap-1 max-w-full">
                        {
                            keywordItems.map((keyword, index) => (
                                <Chip
                                    key={keyword.id ?? index}
                                    content={keyword.keyword}
                                    cssClasses="bg-primary-100/50 !text-primary-200 !border-none"
                                />
                            ))
                        }
                    </div>
                ) : (
                    <EmptyState
                        title="Topics not available for this asset."
                        description="You can generate Topics using the Contextual Metadata panel."
                        icon={<SearchAlert size={19} />}
                    />
                )}
            </div>
        </>
    );
}

function FaqsPane({ faqs, chosenLanguage }) {
    const { workspaceContainer } = useContext(MainContext);
    const faqItems = Array.isArray(faqs) ? faqs : [];

    return (
        <>
            <MetadataPaneHeader
                title="FAQs"
                exportButton={
                    <MetadataExportButton
                        metadataType="faqs"
                        disabled={faqItems.length === 0}
                        buildPayload={() => ({ faqs: faqItems })}
                    />
                }
            />

            <div className="p-4 flex-1 min-h-0 overflow-y-auto">
                {faqItems.length > 0 ? (
                    <div className="flex items-center flex-wrap gap-1 max-w-full">
                        {
                            faqItems.map((faq, index) => (
                                <FaqItem chosenLanguage={chosenLanguage} key={faq.id ?? index} item={faq} isBoxed />
                            ))
                        }
                    </div>
                ) : (
                    <EmptyState
                        title="FAQs not available for this asset."
                        description="You can generate FAQs using the Contextual Metadata panel."
                        icon={<SearchAlert size={19} />}
                    />
                )}
            </div>
        </>
    );
}

function EmptyState({ title, description, isError = false, icon }) {

    const IconEl = icon ?? (isError ? <SearchX size={19} /> : <Search size={19} />);

    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2.5 py-6 px-4">
            <div className="w-11 h-11 rounded-xl bg-primary-100/50 flex items-center justify-center text-ink-muted">
                {IconEl}
            </div>
            <strong className="text-ink text-[13px] font-semibold">{title}</strong>
            <span className="text-[12.5px] text-ink-muted max-w-[320px]">{description}</span>
        </div>
    );
}

