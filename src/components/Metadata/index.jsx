import { useContext, useEffect, useState } from "react";
import { Search, Globe, SearchX } from "lucide-react";
import { MainContext } from '../../contexts/mainContext';
import TimelineHorizontal from '../TimelineHorizontal';
import HorizontalCard from '../HorizontalCard';
import makeApiRequest from '../../api';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';
import { useToast } from '../../contexts/toastContext';
import { timeToSeconds } from '../../utils';
import Chip from '../Chip';

const TAB_SETS = {
    video: ["search", "transcription", "summary", "chapters", "highlights", "keywords", "faqs"],
    pdf: ["search", "summary", "chapters", "highlights", "keywords", "faqs"],
    img: ["search", "summary", "keywords", "faqs"],
};

const TAB_LABELS = {
    search: "Search",
    transcription: "Transcription",
    summary: "Summary",
    chapters: "Chapters",
    highlights: "Highlights",
    keywords: "Keywords",
    faqs: "FAQs"
};

// "00:00:05" -> "0:05", "00:01:30" -> "1:30", "01:02:03" -> "1:02:03"
function formatTimestamp(value) {
    if (!value) return "";
    const parts = value.split(":").map(Number);
    const [h, m, s] = parts.length === 3 ? parts : [0, parts[0], parts[1]];
    return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${s}`;
}

/**
 * Metadata — tabbed Search / Transcription / Summary panel for the current
 * source. Built one tab at a time: Search is implemented now, the other
 * two tabs are wired up as placeholders until they're built out.
 *
 * Fills 100% of its parent's height (parent needs a bounded height, e.g.
 * flex + min-h-0) — the tab bar stays put, only each pane's own content
 * scrolls.
 *
 * Search props:
 *  - query, onQueryChange: controlled search text (optional)
 *  - language: current transcript language label shown top-right
 *  - results: [{ id, title, content, start_time, end_time }] — matches the
 *    transcription/chapter shape (search hits pulled from the transcript)
 *  - onSearch(query): fired when Search is clicked / Enter is pressed
 *  - onResultClick(result): fired when a result row is clicked (e.g. to
 *    seek the player to that timestamp)
 */
export default function Metadata({
    query,
    onQueryChange,
    language = "English",
    results = [],
    onSearch,
    onResultClick,
    className = "",
    translatedResource
}) {

    const {
        currentResource
    } = useContext(MainContext);

    const sourceType = currentResource.file_type;

    const availableTabIds = TAB_SETS[sourceType] ?? TAB_SETS.video;
    const tabs = availableTabIds.map((id) => ({ id, label: TAB_LABELS[id] }));
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    // Reset to the first available tab if the source (and its tab set) changes
    useEffect(() => {
        if (!availableTabIds.includes(activeTab)) setActiveTab(availableTabIds[0]);
    }, [activeTab, availableTabIds]);

    return (
        <div className={`h-full min-h-0 flex flex-col gap-3.5 ${className}`}>
            <div className="flex gap-1 bg-surface-alt p-1 rounded-[10px] w-fit bg-gray-200/30 shrink-0">
                {tabs.map((t) => (
                    <button
                        key={t.id}
                        type="button"
                        onClick={() => setActiveTab(t.id)}
                        aria-current={activeTab === t.id ? "page" : undefined}
                        className={`rounded-[7px] px-3.5 py-1.5 text-[12.5px] font-semibold transition-colors ${activeTab === t.id ? "bg-white text-primary shadow-sm2" : "bg-transparent backdrop-blur-sm text-ink-secondary hover:text-ink"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="flex-1 min-h-0 bg-white border border-border rounded-xl flex flex-col overflow-hidden">
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
                {activeTab === "keywords" && (
                    <KeywordsPane
                        keywords={translatedResource?.keywords?.content}
                    />
                )}
            </div>
        </div>
    );
}

function SearchPane({ query: queryProp, onQueryChange, language, results, onSearch, onResultClick }) {
    const {
        categoryOptions,
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
                selectedCategory,
                searchQuestion: query,
                currentResource,
                selectedFormat,
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
                const source = knowledgeBase?.find(item => item.source_path === rest.source_path);
                setDiscoveredSources({
                    mainSource: { ...source, timestamp, page: Number(page), score },
                    additionalSources: additional_sources?.map(item => {
                        const sourceItem = knowledgeBase.find(el => el.source_path === item?.source_path);
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
                <div className="flex items-center gap-1.5 border border-border rounded-lg px-2.5 py-1.5 text-[12px] text-ink-secondary">
                    <Globe size={13} />
                    {language}
                </div>
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
                            title="Search this video's transcript"
                            description="Find the exact moment a topic, name, or phrase comes up — results jump the player straight there."
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

function TranscriptionPane({ transcriptionObj }) {

    const {

        setCurrentResource,
        workspaceContainer
    } = useContext(MainContext);

    return (
        <>
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
                <h3 className="font-display text-[13.5px] font-semibold text-ink">Transcription</h3>
            </div>

            <div className="p-4 flex-1 min-h-0 overflow-y-auto flex flex-col">
                <div className="flex flex-col gap-3">
                    {
                        (transcriptionObj?.content && Array.isArray(transcriptionObj?.content)) ?
                            transcriptionObj?.content?.map((topic) => (
                                <div key={topic.content} className="flex flex-col">
                                    <div>
                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                                            setCurrentResource(prev => ({ ...prev, timestamp: topic.start_time }));
                                            workspaceContainer?.current.scrollTo({
                                                top: 0,
                                                behavior: "smooth", // Enables smooth scrolling
                                            });
                                        }}>
                                            <h6 className='mb-0 text-xs font-semibold text-primary-300 '>{topic.start_time} - {topic.end_time}</h6>
                                        </div>
                                    </div>
                                    <p className="select-text" dangerouslySetInnerHTML={{ __html: topic.content.replace(/\n/g, "<br>") }}></p>
                                </div>
                            )) : (
                                <p className="italic">Transcription not available for this source.</p>
                            )
                    }
                </div>
            </div>
        </>
    );
}

function SummaryPane({ summaryObj }) {
    return (
        <>
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
                <h3 className="font-display text-[13.5px] font-semibold text-ink">Summary</h3>
            </div>

            <div className="p-4 flex-1 min-h-0 overflow-y-auto flex flex-col">
                <div className="flex flex-col gap-3">
                    {
                        summaryObj?.content !== undefined ? (
                            <p
                                className={`text-md text-textColor-300`}
                                dangerouslySetInnerHTML={{ __html: `<p>${summaryObj?.content?.replace(/\n/gi, '<br />')}</p>` }}
                            ></p>
                        ) : (
                            <p className="italic">Summary not available for this source. Generate it in Contextual metadata section</p>
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
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
                <h3 className="font-display text-[13.5px] font-semibold text-ink">Chapters</h3>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
                {chapterItems.length > 0 ? (
                    <TimelineHorizontal
                        chapters={chapterItems}
                        workspaceContainer={workspaceContainer}
                        theme="light"
                    />
                ) : (
                    <p className="p-4 italic">Chapters not available for this source.</p>
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
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
                <h3 className="font-display text-[13.5px] font-semibold text-ink">Highlights</h3>
            </div>

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
                    <p className="italic">Highlights not available for this source.</p>
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
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-border shrink-0">
                <h3 className="font-display text-[13.5px] font-semibold text-ink">Keywords</h3>
            </div>

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
                    <p className="italic">Keywords not available for this source.</p>
                )}
            </div>
        </>
    );
}

function EmptyState({ title, description, isError }) {

    const Icon = isError ? <SearchX size={19} /> : <Search size={19} />;

    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2.5 py-6 px-4">
            <div className="w-11 h-11 rounded-xl bg-surface-alt flex items-center justify-center text-ink-muted">
                {Icon}
            </div>
            <strong className="text-ink text-[13px] font-semibold">{title}</strong>
            <span className="text-[12.5px] text-ink-muted max-w-[320px]">{description}</span>
        </div>
    );
}

