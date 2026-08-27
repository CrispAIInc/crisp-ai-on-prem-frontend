import { useContext, useEffect, useState } from "react";
import { Search, Globe, PlayCircle } from "lucide-react";
import { MainContext } from '../../contexts/mainContext';

const TAB_SETS = {
    video: ["search", "transcription", "summary"],
    pdf: ["search", "transcription", "summary"],
    image: ["summary", "keywords"],
};

const TAB_LABELS = {
    search: "Search",
    transcription: "Transcription",
    summary: "Summary",
    keywords: "Keywords",
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

    const tabs = (TAB_SETS[sourceType] ?? TAB_SETS.video).map((id) => ({ id, label: TAB_LABELS[id] }));
    const [activeTab, setActiveTab] = useState(tabs[0].id);

    // Reset to the first available tab if the source (and its tab set) changes
    useEffect(() => {
        if (!tabs.some((t) => t.id === activeTab)) setActiveTab(tabs[0].id);
    }, [sourceType]);

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
            </div>
        </div>
    );
}

function SearchPane({ query: queryProp, onQueryChange, language, results, onSearch, onResultClick }) {
    const [internalQuery, setInternalQuery] = useState("");
    const [searched, setSearched] = useState(false);

    const query = queryProp ?? internalQuery;
    const setQuery = onQueryChange ?? setInternalQuery;

    const canSearch = Boolean(query.trim());

    const runSearch = () => {
        setSearched(true);
        onSearch?.(query);
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
                            onKeyDown={(e) => e.key === "Enter" && runSearch()}
                            placeholder='e.g. "team collaboration", "career highlights"…'
                            className="flex-1 bg-transparent outline-none text-[12.5px] text-ink placeholder:text-ink-muted"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={runSearch}
                        disabled={!canSearch}
                        className={`shrink-0 rounded-lg px-3 py-2.5 text-[12.5px] font-bold bg-gradient-to-br from-primary-200 to-primary-300 text-white hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed`}
                    >
                        Search
                    </button>
                </div>

                <div className="flex-1 min-h-0 flex flex-col mt-4">
                    {!searched ? (
                        <EmptyState
                            title="Search this video's transcript"
                            description="Find the exact moment a topic, name, or phrase comes up — results jump the player straight there."
                        />
                    ) : results.length === 0 ? (
                        <EmptyState
                            title="No matches found"
                            description={query ? `Nothing matched "${query}". Try a different phrase.` : "Try a different search."}
                        />
                    ) : (
                        <div className="flex flex-col gap-2 overflow-y-auto">
                            {results.map((r) => (
                                <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => onResultClick?.(r)}
                                    className="flex items-start gap-3 text-left border border-border rounded-lg p-3 hover:border-border-strong hover:bg-surface-alt transition-colors"
                                >
                                    <span className="flex items-center gap-1 shrink-0 text-[11px] font-mono font-semibold text-primary bg-surface-alt rounded-md px-2 py-1 mt-0.5">
                                        <PlayCircle size={12} />
                                        {formatTimestamp(r.start_time)}
                                    </span>
                                    <span className="min-w-0">
                                        {r.title && <span className="block text-[12.5px] font-semibold text-ink mb-0.5">{r.title}</span>}
                                        <span className="block text-[12.5px] text-ink-secondary line-clamp-2">{r.content}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
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
                            transcriptionObj?.content?.map((topic, index) => (
                                <div key={topic.content} className="flex flex-col">
                                    <div>
                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                                            setCurrentResource(prev => ({ ...prev, timestamp: topic.start_time }));
                                            workspaceContainer?.current.scrollTo({
                                                top: 0,
                                                behavior: "smooth", // Enables smooth scrolling
                                            });
                                        }}>
                                            <h6 className='mb-0 text-xs font-semibold text-primary-200 '>{topic.start_time} - {topic.end_time}</h6>
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

    const {

        setCurrentResource,
        workspaceContainer
    } = useContext(MainContext);

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

function EmptyState({ title, description }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-2.5 py-6 px-4">
            <div className="w-11 h-11 rounded-xl bg-surface-alt flex items-center justify-center text-ink-muted">
                <Search size={19} />
            </div>
            <strong className="text-ink text-[13px] font-semibold">{title}</strong>
            <span className="text-[12.5px] text-ink-muted max-w-[320px]">{description}</span>
        </div>
    );
}

// Placeholder for tabs not built yet — swap for TranscriptionPane / SummaryPane
// as each one is implemented.
function ComingSoonPane({ label }) {
    return (
        <div className="flex-1 flex items-center justify-center text-[12.5px] text-ink-muted">
            {label} — coming next
        </div>
    );
}
