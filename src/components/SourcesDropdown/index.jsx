import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { ChevronDown, Film, Check } from "lucide-react";
import GsFile from '../GsFile';

/**
 * SourcesDropdown — multi-select for picking which sources to use.
 *
 * Each source is shaped like { source_id, source_path, thumbnail, ...rest }.
 * `thumbnail` is optional — falls back to a generic file icon when missing.
 *
 * Controlled-or-uncontrolled selection, same pattern as the rest of the app:
 * pass `selectedSourceIds` + `onSelectedSourceIdsChange` to control it, or
 * omit both to let it manage its own state.
 */
export default function SourcesDropdown({
    sources = [],
    selectedSourceIds: selectedProp,
    onSelectedSourceIdsChange,
    placeholder = "Select sources",
}) {
    const [internalSelected, setInternalSelected] = useState([]);
    const [open, setOpen] = useState(false);
    const [placement, setPlacement] = useState("bottom");
    const [menuMaxHeight, setMenuMaxHeight] = useState(240);
    const rootRef = useRef(null);
    const menuRef = useRef(null);

    const selectedSourceIds = selectedProp ?? internalSelected;
    const setSelectedSourceIds = onSelectedSourceIdsChange ?? setInternalSelected;

    useEffect(() => {
        if (!open) return;
        const handleClick = (e) => {
            if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    useLayoutEffect(() => {
        if (!open || !rootRef.current || !menuRef.current) return;

        const positionMenu = () => {
            const triggerRect = rootRef.current.getBoundingClientRect();
            const menuHeight = menuRef.current.scrollHeight;
            const gap = 6;
            const spaceAbove = Math.max(0, triggerRect.top - gap);
            const spaceBelow = Math.max(0, window.innerHeight - triggerRect.bottom - gap);
            const shouldOpenAbove = spaceBelow < menuHeight && spaceAbove > spaceBelow;
            const availableSpace = shouldOpenAbove ? spaceAbove : spaceBelow;

            setPlacement(shouldOpenAbove ? "top" : "bottom");
            setMenuMaxHeight(Math.min(240, Math.max(0, availableSpace)));
        };

        positionMenu();
        window.addEventListener("resize", positionMenu);
        window.addEventListener("scroll", positionMenu, true);
        return () => {
            window.removeEventListener("resize", positionMenu);
            window.removeEventListener("scroll", positionMenu, true);
        };
    }, [open, sources.length]);

    const toggleSource = (id) => {
        setSelectedSourceIds(
            selectedSourceIds.includes(id)
                ? selectedSourceIds.filter((s) => s !== id)
                : [...selectedSourceIds, id]
        );
    };

    const selected = sources.filter((s) => selectedSourceIds.includes(s.source_id));

    return (
        <div ref={rootRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="w-full flex items-center justify-between gap-2 border border-border rounded-lg px-3 py-2.5 text-[12.5px] text-ink bg-surface hover:border-border-strong"
            >
                {selected.length === 0 ? (
                    <span className="text-ink-muted">{placeholder}</span>
                ) : (
                    <span className="flex items-center gap-2 min-w-0">
                        <span className="flex -space-x-1.5 shrink-0">
                            {selected.slice(0, 3).map((s) => (
                                <Thumb key={s.source_id} source={s} size={20} ring />
                            ))}
                        </span>
                        <span className="truncate">
                            {selected.length} source{selected.length > 1 ? "s" : ""} selected
                        </span>
                    </span>
                )}
                <ChevronDown size={14} className={`text-ink-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
            </button>

            {open && (
                <div
                    ref={menuRef}
                    style={{ maxHeight: menuMaxHeight }}
                    className={`absolute z-30 left-0 bg-white right-0 bg-surface border border-border rounded-xl shadow-md2 p-1.5 overflow-y-auto ${placement === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]"}`}
                >
                    {sources.length === 0 && (
                        <div className="px-2.5 py-3 text-[12.5px] text-ink-muted text-center">No sources available</div>
                    )}
                    {sources.map((s) => {
                        const checked = selectedSourceIds.includes(s.source_id);
                        return (
                            <button
                                key={s.source_id}
                                type="button"
                                onClick={() => toggleSource(s.source_id)}
                                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left hover:bg-surface-alt"
                            >
                                <Thumb source={s} size={30} />
                                <span className="flex-1 min-w-0 text-[12.5px] text-ink truncate">{s.source_path}</span>
                                <span
                                    className={`w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 ${checked ? "bg-primary-300 border-primary-200 text-white" : "border-border-strong"
                                        }`}
                                >
                                    {checked && <Check size={10} strokeWidth={3} />}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function Thumb({ source, size, ring = false }) {
    const style = { width: size, height: size };
    const cls = `rounded-md object-cover shrink-0 ${ring ? "ring-2 ring-surface" : ""}`;
    if (source.thumbnail) {
        return <GsFile gsUrl={source.thumbnail} alt="" style={style} className={cls} />;
    }
    return (
        <span
            style={style}
            className={`${cls} bg-surface-alt flex items-center justify-center text-ink-muted`}
        >
            <Film size={size * 0.5} />
        </span>
    );
}
