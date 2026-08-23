import { useState } from "react";
import { Search, Flame, Star } from "lucide-react";

/**
 * Discovery — search results panel (header + search box + grouped results).
 *
 * Card rendering is NOT this component's job: pass already-built card
 * elements in via `groups[].cards`. This component only owns the search
 * input, the empty/no-results states, group headers, and the grid/scroll
 * shell around whatever cards you give it.
 *
 * Fills 100% of its parent's height (parent must have a bounded height,
 * e.g. flex + min-h-0) and scrolls internally — it never grows the
 * surrounding app layout.
 *
 * Props:
 *  - query, onQueryChange: controlled search input (optional — falls back
 *    to internal state if omitted)
 *  - placeholder: input placeholder text
 *  - hasSearched: force the "not searched yet" vs "results" state. If
 *    omitted, inferred from whether `query` is non-empty.
 *  - groups: [{ id, label, icon?, tone?: 'relevant' | 'default', count?, cards: ReactNode[] }]
 *  - className: extra classes on the root element
 */
export default function Discovery({
    query: queryProp,
    onQueryChange,
    placeholder = "Search in all sources…",
    groups = [],
    hasSearched: hasSearchedProp,
    className = "",
}) {
    const [internalQuery, setInternalQuery] = useState("");
    const isControlled = queryProp !== undefined;
    const query = isControlled ? queryProp : internalQuery;
    const setQuery = onQueryChange ?? setInternalQuery;

    const hasSearched = hasSearchedProp ?? query.trim().length > 0;
    const hasResults = groups.some((g) => g.cards && g.cards.length > 0);

    return (
        <div className={`h-full min-h-0 flex flex-col overflow-hidden ${className}`}>
            {/* Header */}
            <div className="px-[18px] pt-4 pb-3 border-b border-border shrink-0">
                <h2 className="font-display text-[14.5px] font-semibold text-ink">Search results</h2>
                <p className="text-xs text-ink-secondary mt-0.5">Ranked matches across your workspace catalog.</p>
            </div>

            {/* Search box */}
            <div className="px-[18px] pt-3.5 pb-3 shrink-0">
                <div className="flex items-center gap-2 bg-surface-alt rounded-lg px-3 py-2.5 focus-within:ring-1 focus-within:ring-primary">
                    <Search size={13} className="text-ink-muted shrink-0" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent outline-none text-[12.5px] text-ink placeholder:text-ink-muted"
                    />
                </div>
            </div>

            {/* Scrollable results area — this is the only part that scrolls */}
            <div className="flex-1 min-h-0 overflow-y-auto px-[18px] pb-4">
                {!hasSearched ? (
                    <StatePlaceholder
                        title="Search to discover sources"
                        description="Type a topic, name, or phrase above to find matching moments across your catalog."
                    />
                ) : !hasResults ? (
                    <StatePlaceholder
                        title="No matches found"
                        description={query ? `Nothing matched “${query}”. Try a different phrase.` : "Try a different search."}
                    />
                ) : (
                    groups.map((group) => <ResultGroup key={group.id} group={group} />)
                )}
            </div>
        </div>
    );
}

function ResultGroup({ group }) {
    const { label, icon: Icon = Star, tone = "default", count, cards = [] } = group;
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
            <div className="w-11 h-11 rounded-xl bg-surface-alt flex items-center justify-center text-ink-muted shrink-0">
                <Search size={18} />
            </div>
            <strong className="text-ink text-[13px] font-semibold">{title}</strong>
            <span className="text-[12.5px] text-ink-muted max-w-[240px]">{description}</span>
        </div>
    );
}

// Handy default icons for common group tones, in case the caller wants them.
export const DiscoveryIcons = { Flame, Star };
