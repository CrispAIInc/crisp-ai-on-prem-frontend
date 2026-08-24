import { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Search } from "lucide-react";
import LoadingSpinner from '../LoadingSpinner';

/**
 * IndexSearchBar — "Search in all sources" input that optionally supports
 * picking one or more indexes as removable chips, plus a Discover action.
 *
 * Index selection is entirely optional: if `indexOptions` is omitted or
 * empty, the chevron/dropdown never renders and this behaves like a plain
 * search-and-discover bar. When `indexOptions` is provided, a chevron opens
 * a checklist and picks turn into removable chips inline with the input.
 *
 * Controlled-or-uncontrolled for both `query` and `selectedIndexes` — pass
 * the prop + its `on...Change` handler to control it, or omit both to let
 * the component manage its own state.
 *
 * Props:
 *  - label: caption shown above the field (default "Search in all sources")
 *  - query, onQueryChange
 *  - indexOptions: [{ id, label }] — omit/empty to hide index picking entirely
 *  - selectedIndexes, onSelectedIndexesChange: array of index ids
 *  - onDiscover(query, selectedIndexes): fired when "Discover" is clicked
 */
export default function IndexSearchBar({
    label = "Search in all sources",
    query: queryProp,
    onQueryChange,
    indexOptions = [],
    selectedIndexes: selectedProp,
    onSelectedIndexesChange,
    onDiscover,
    isSearching
}) {
    const [internalQuery, setInternalQuery] = useState("");
    const [internalSelected, setInternalSelected] = useState([]);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const rootRef = useRef(null);

    const query = queryProp ?? internalQuery;
    const setQuery = onQueryChange ?? setInternalQuery;
    const selectedIndexes = selectedProp ?? internalSelected;
    const setSelectedIndexes = onSelectedIndexesChange ?? setInternalSelected;

    const hasIndexOptions = indexOptions.length > 0;
    const canDiscover = query.trim().length > 0 || selectedIndexes.length > 0;

    // Close the dropdown on outside click.
    useEffect(() => {
        if (!dropdownOpen) return;
        const handleClick = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) setDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [dropdownOpen]);

    const toggleIndex = (id) => {
        setSelectedIndexes(
            selectedIndexes.includes(id) ? selectedIndexes.filter((i) => i !== id) : [...selectedIndexes || null, id]
        );
    };

    const allSelected = hasIndexOptions && selectedIndexes.length === indexOptions.length;

    const toggleAll = () => {
        setSelectedIndexes(allSelected ? [] : indexOptions.map((o) => o.value));
    };

    const removeIndex = (id) => setSelectedIndexes(selectedIndexes.filter((i) => i !== id));

    return (
        <div ref={rootRef} className="relative">
            <div className="flex items-stretch justify-between gap-1.5 rounded-xl bg-gray-100 !border !border-gray-200 p-1">
                <div className="flex-1 flex flex-wrap items-center gap-1.5 bg-surface rounded-[10px] pl-2.5 pr-1.5 py-1.5 min-h-[38px]">
                    {selectedIndexes.map((value) => {
                        const opt = indexOptions.find((o) => o.value === value);
                        return (
                            <span
                                key={value}
                                className="inline-flex items-center gap-1 bg-primary-100/50 text-primary-200 text-xs text-[12px] font-medium pl-2.5 pr-1.5 py-1 rounded-lg shrink-0"
                            >
                                {opt?.label ?? value}
                                <button
                                    type="button"
                                    onClick={() => removeIndex(value)}
                                    aria-label={`Remove ${opt?.label ?? value}`}
                                    className="text-ink-muted hover:text-ink"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        );
                    })}

                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && canDiscover && onDiscover?.(query, selectedIndexes)}
                        placeholder={selectedIndexes.length === 0 ? label : ""}
                        className="flex-1 min-w-[80px] bg-transparent outline-none text-[12.5px] text-ink placeholder:text-ink-muted"
                    />

                    {hasIndexOptions && (
                        <button
                            type="button"
                            onClick={() => setDropdownOpen((v) => !v)}
                            aria-label="Choose indexes"
                            aria-expanded={dropdownOpen}
                            className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-ink-muted hover:bg-surface-alt hover:text-ink"
                        >
                            <ChevronDown size={14} className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    disabled={!canDiscover}
                    onClick={() => onDiscover?.(query, selectedIndexes)}
                    className="shrink-0 rounded-[10px] px-2 py-1 text-xs font-bold text-white bg-gradient-to-r from-primary-200 to-primary-300 hover:brightness-105 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5"
                >
                    {
                        isSearching ? (
                            <LoadingSpinner isSmall />
                        ) : (
                            <Search size={13} />
                        )
                    }
                    Discover
                </button>
            </div>

            {hasIndexOptions && dropdownOpen && (
                <div className="absolute z-20 top-[calc(100%+6px)] left-0 right-0 bg-surface border border-border rounded-xl shadow-md2 p-1.5 max-h-56 overflow-y-auto">
                    <button
                        type="button"
                        onClick={toggleAll}
                        className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12.5px] text-left text-ink hover:bg-surface-alt"
                    >
                        <span
                            className={`w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 ${allSelected ? "bg-primary border-primary text-white" : "border-border-strong"
                                }`}
                        >
                            {allSelected && (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                    <path d="M20 6 9 17l-5-5" />
                                </svg>
                            )}
                        </span>
                        All
                    </button>
                    {indexOptions.map((opt) => {
                        const checked = selectedIndexes.includes(opt.value);
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => toggleIndex(opt.value)}
                                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12.5px] text-left text-ink hover:bg-surface-alt"
                            >
                                <span
                                    className={`w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 ${checked ? "bg-primary border-primary text-white" : "border-border-strong"
                                        }`}
                                >
                                    {checked && (
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <path d="M20 6 9 17l-5-5" />
                                        </svg>
                                    )}
                                </span>
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
