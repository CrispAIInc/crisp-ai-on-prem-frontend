import { useContext, useState } from "react";
import { MainContext } from '../../contexts/mainContext';

import { Search, Flame, Star } from "lucide-react";
import IndexSearchBar from "../IndexSearchBar";
import DiscoveryNotFound from "../DiscoveryNotFound";
import makeApiRequest from '../../api';
import { timeToSeconds } from '../../utils';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';
import { useToast } from '../../contexts/toastContext';
import MediaCard from '../MediaCard';

/**
 * Discovery — search results panel (header + search box + grouped results).
 *
 * Card rendering is NOT this component's job: pass already-built card
 * elements in via `groups[].cards`. This component only owns the search
 * bar, the empty/no-results states, group headers, and the grid/scroll
 * shell around whatever cards you give it.
 *
 * Fills 100% of its parent's height (parent must have a bounded height,
 * e.g. flex + min-h-0) and scrolls internally — it never grows the
 * surrounding app layout.
 *
 * Props:
 *  - query, onQueryChange: controlled search text (optional — falls back
 *    to internal state if omitted)
 *  - indexOptions: [{ id, value, name }] — optional list of indexes the user can
 *    filter by, shown as removable chips. Omit/leave empty to hide index
 *    selection entirely and fall back to a plain search bar.
 *  - selectedIndexes, onSelectedIndexesChange: controlled index selection
 *    (optional — falls back to internal state if omitted)
 *  - onDiscover(query, selectedIndexes): fired when "Discover" runs
 *  - hasSearched: force the "not searched yet" vs "results" state. If
 *    omitted, inferred from whether Discover has been triggered yet.
 *  - className: extra classes on the root element
 */
export default function Discovery({
    query,
    onQueryChange,
    selectedIndexes,
    onSelectedIndexesChange,
    hasSearched: hasSearchedProp,
    className = "",
}) {

    const {
        categoryOptions,
        currentResource,
        selectedCategory,
        selectedFormat,
        discoveredSources,
        setDiscoveredSources,
        setShowSearchModal,
        knowledgeBase,
        isPlayerReady,
        player,
        handleCheckboxChange,
        onThumbnailClick
    } = useContext(MainContext);
    const { handleSourceLinkClick } = useReferenceLinkClick();
    const { notify } = useToast();


    const [triggered, setTriggered] = useState(false);
    const [lastQuery, setLastQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchOutcome, setSearchOutcome] = useState(null);

    const hasSearched = hasSearchedProp ?? triggered;

    const handleDiscover = async (q, indexes) => {
        setTriggered(true);
        setLastQuery(q);
        setSearchOutcome(null);

        setIsSearching(true);

        try {
            const { found, additional_sources, score, timestamp, page, message, success, ...rest } = await makeApiRequest('/process-query', 'POST', JSON.stringify({
                selectedCategory,
                searchQuestion: q,
                currentResource,
                selectedFormat,
                indexes
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
        <div className={`h-full min-h-0 flex flex-col overflow-hidden bg-white ${className}`}>
            {/* Header */}
            <div className="px-[18px] pt-4 pb-3 border-b border-border shrink-0">
                <h2 className="font-display text-[14.5px] font-semibold text-ink">Search results</h2>
                <p className="text-xs text-ink-secondary mt-0.5">Ranked matches across your workspace catalog.</p>
            </div>

            {/* Search bar — index selection is optional, see indexOptions above */}
            <div className="px-[18px] pt-3.5 pb-3 shrink-0">
                <IndexSearchBar
                    query={query}
                    onQueryChange={onQueryChange}
                    indexOptions={categoryOptions?.filter(item => item.value !== "all")}
                    selectedIndexes={selectedIndexes}
                    onSelectedIndexesChange={onSelectedIndexesChange}
                    onDiscover={handleDiscover}
                    isSearching={isSearching}
                />
            </div>

            {/* Scrollable results area — this is the only part that scrolls */}
            <div className="flex-1 min-h-0 overflow-y-auto px-[18px] pb-4">
                {!hasSearched ? (
                    <StatePlaceholder
                        title="Search to discover sources"
                        description="Type a topic, name, or phrase above to find matching moments across your catalog."
                    />
                ) : isSearching ? (
                    <StatePlaceholder
                        title="Searching your sources"
                        description="Looking for matching moments across your catalog."
                    />
                ) : searchOutcome === "not-found" ? (
                    <div className="mt-4">
                        <DiscoveryNotFound searchQuestion={lastQuery} />
                    </div>
                ) : discoveredSources?.mainSource ? (
                    <>
                        <ResultGroup
                            label="Most relevant"
                            icon={Flame}
                            tone="relevant"
                            count={1}
                            cards={[
                                <MediaCard
                                    key={discoveredSources.mainSource.source_path}
                                    source={discoveredSources.mainSource}
                                    onOpen={onThumbnailClick}
                                    onToggle={handleCheckboxChange}
                                    isProjectReadOnly={true}
                                />
                            ]}
                        />
                        <ResultGroup
                            label="Additional sources"
                            icon={Star}
                            count={discoveredSources.additionalSources?.length || 0}
                            cards={(discoveredSources.additionalSources || []).map((source, index) => (
                                <MediaCard
                                    key={`${source.source_path}-${index}`}
                                    source={source}
                                    onOpen={onThumbnailClick}
                                    onToggle={handleCheckboxChange}
                                    isProjectReadOnly={true}
                                />
                            ))}
                        />
                    </>
                ) : (
                    null
                )}
            </div>
        </div>
    );
}

function ResultGroup({ label, icon: Icon = Star, tone = "default", count, cards = [] }) {
    if (!cards.length) return null;

    return (
        <div className="mb-[18px] last:mb-0">
            <div
                className={`flex items-center gap-1.5 mb-2.5 font-display font-semibold text-[13px] ${tone === "relevant" ? "text-[#B85A2E]" : "text-ink"
                    }`}
            >
                <Icon size={14} className="fill-current shrink-0" />
                {label}
                <span className="text-ink-muted font-medium">({count ?? cards.length})</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">{cards}</div>
        </div>
    );
}

function StatePlaceholder({ title, description }) {
    return (
        <div className="flex flex-col items-center justify-center text-center gap-2.5 h-full py-8 px-2">
            <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center text-ink-muted shrink-0">
                <Search size={18} />
            </div>
            <strong className="text-ink text-[13px] font-semibold">{title}</strong>
            <span className="text-[12.5px] text-ink-muted max-w-[240px]">{description}</span>
        </div>
    );
}

// Handy default icons for common group tones, in case the caller wants them.
export const DiscoveryIcons = { Flame, Star };
