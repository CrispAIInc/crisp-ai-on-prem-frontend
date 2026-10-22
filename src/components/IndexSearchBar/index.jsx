import { useState, useRef } from "react";
import { X, SlidersHorizontal, Search } from "lucide-react";
import LoadingSpinner from '../LoadingSpinner';
import { DiscoveryFiltersModal } from '../DiscoveryFiltersModal';
import { FILE_TYPES } from '../../globals';

const fileTypeOptions = Object.entries(FILE_TYPES).map(([value, label]) => ({ value, label }));

export default function IndexSearchBar({
    label = "Search in all assets",
    query: queryProp,
    onQueryChange,
    indexOptions = [],
    selectedIndexes: selectedProp,
    onSelectedIndexesChange,
    selectedFileTypes: selectedFileTypesProp,
    onSelectedFileTypesChange,
    onDiscover,
    isSearching
}) {
    const [internalQuery, setInternalQuery] = useState("");
    const [internalSelected, setInternalSelected] = useState([]);
    const [internalSelectedFileTypes, setInternalSelectedFileTypes] = useState([]);
    const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
    const queryInputRef = useRef(null);

    const query = queryProp ?? internalQuery;
    const setQuery = onQueryChange ?? setInternalQuery;
    const selectedIndexes = selectedProp ?? internalSelected;
    const setSelectedIndexes = onSelectedIndexesChange ?? setInternalSelected;
    const selectedFileTypes = selectedFileTypesProp ?? internalSelectedFileTypes;
    const setSelectedFileTypes = onSelectedFileTypesChange ?? setInternalSelectedFileTypes;

    const canDiscover = query.trim().length > 0 || selectedIndexes.length > 0 || selectedFileTypes.length > 0;
    const discover = () => onDiscover?.(query, selectedIndexes, selectedFileTypes);

    return (
        <div className="relative">
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
                                    onClick={() => setSelectedIndexes(selectedIndexes.filter((i) => i !== value))}
                                    aria-label={`Remove ${opt?.label ?? value}`}
                                    className="text-ink-muted hover:text-ink"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        );
                    })}

                    {selectedFileTypes.map((value) => {
                        const opt = fileTypeOptions.find((o) => o.value === value);
                        return (
                            <span
                                key={value}
                                className="inline-flex items-center gap-1 bg-teal-100 text-teal-800 text-xs text-[12px] font-medium pl-2.5 pr-1.5 py-1 rounded-lg shrink-0"
                            >
                                {opt?.label ?? value}
                                <button
                                    type="button"
                                    onClick={() => setSelectedFileTypes(selectedFileTypes.filter((type) => type !== value))}
                                    aria-label={`Remove ${opt?.label ?? value}`}
                                    className="text-teal-700 hover:text-teal-950"
                                >
                                    <X size={12} />
                                </button>
                            </span>
                        );
                    })}

                    <input
                        ref={queryInputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && canDiscover && discover()}
                        placeholder={label}
                        className="flex-1 min-w-[80px] bg-transparent outline-none text-[12.5px] text-ink placeholder:text-ink-muted"
                    />

                    <button
                        type="button"
                        onClick={() => setIsFiltersModalOpen(true)}
                        aria-label="Open discovery filters"
                        aria-expanded={isFiltersModalOpen}
                        className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-ink-muted hover:bg-surface-alt hover:text-ink"
                    >
                        <SlidersHorizontal size={14} />
                    </button>
                </div>

                <button
                    type="button"
                    disabled={!canDiscover}
                    onClick={discover}
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

            <DiscoveryFiltersModal
                show={isFiltersModalOpen}
                onHide={() => setIsFiltersModalOpen(false)}
                indexOptions={indexOptions}
                selectedIndexes={selectedIndexes}
                onSelectedIndexesChange={setSelectedIndexes}
                fileTypeOptions={fileTypeOptions}
                selectedFileTypes={selectedFileTypes}
                onSelectedFileTypesChange={setSelectedFileTypes}
                onClear={() => {
                    setSelectedIndexes([]);
                    setSelectedFileTypes([]);
                }}
            />
        </div>
    );
}
