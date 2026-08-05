import React, {
    createContext,
    useContext,
    useState,
    useRef,
    useEffect,
    useMemo,
    useCallback,
} from "react";
import { ChevronDown, X, Check, Search, Moon, Sun } from "lucide-react";
import { MainContext } from '../../contexts/mainContext';

/* ------------------------------------------------------------------ */
/*  Theming tokens                                                     */
/* ------------------------------------------------------------------ */
const styles = {
    light: {
        trigger: "bg-white border-slate-200 hover:border-slate-300 text-slate-800 shadow-sm",
        triggerOpen: "border-indigo-500 ring-4 ring-indigo-500/10",
        placeholder: "text-slate-400",
        panel: "bg-white border-slate-200 shadow-xl shadow-slate-900/10",
        search: "bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400",
        option: "text-slate-700 hover:bg-slate-50",
        optionActive: "bg-indigo-50 text-indigo-700",
        optionAll: "text-slate-500",
        divider: "border-slate-100",
        chip: "bg-slate-100 text-slate-700 hover:bg-slate-200",
        chipMore: "bg-primary-100/20 text-primary-300",
        check: "bg-indigo-600 border-indigo-600",
        checkEmpty: "border-slate-300",
        empty: "text-slate-400",
        scroll: "scrollbar-light",
    },
    dark: {
        trigger: "bg-slate-900 border-slate-700 hover:border-slate-600 text-slate-100 shadow-sm",
        triggerOpen: "border-indigo-400 ring-4 ring-indigo-400/10",
        placeholder: "text-slate-500",
        panel: "bg-slate-900 border-slate-700 shadow-xl shadow-black/30",
        search: "bg-slate-800 border-slate-700 text-slate-100 placeholder:text-slate-500 focus:border-indigo-400",
        option: "text-slate-200 hover:bg-slate-800",
        optionActive: "bg-indigo-500/10 text-indigo-300",
        optionAll: "text-slate-400",
        divider: "border-slate-800",
        chip: "bg-slate-800 text-slate-200 hover:bg-slate-700",
        chipMore: "bg-primary-300/10 text-primary-300",
        check: "bg-indigo-500 border-indigo-500",
        checkEmpty: "border-slate-600",
        empty: "text-slate-500",
        scroll: "scrollbar-dark",
    },
};

/* ------------------------------------------------------------------ */
/*  Select component                                                   */
/* ------------------------------------------------------------------ */
/**
 * @param {Object[]} options            [{ value, label }]
 * @param {*|Array}  value              selected value (single) or array of values (multi)
 * @param {Function} onChange           (nextValue) => void
 * @param {boolean}  multiple           enable multi-select + "All" option
 * @param {string}   placeholder
 * @param {string}   label              optional floating label above the control
 * @param {boolean}  searchable         show a search box inside the panel
 * @param {string}   className          wrapper className, lets you place it anywhere
 * @param {string}   width              tailwind width class, default 'w-full'
 */
export default function Select({
    options,
    value,
    onChange,
    multiple = false,
    placeholder = "Select…",
    searchable = true,
    className = "",
    width = "w-full",
}) {
    const { theme } = useContext(MainContext);
    const t = styles[theme === "dark" ? "dark" : "light"];

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const rootRef = useRef(null);
    const searchRef = useRef(null);

    const selectedValues = useMemo(
        () => (multiple ? (Array.isArray(value) ? value : []) : value != null ? [value] : []),
        [value, multiple]
    );

    const allSelected = multiple && options.length > 0 && selectedValues.length === options.length;

    const filteredOptions = useMemo(() => {
        if (!query.trim()) return options;
        const q = query.toLowerCase();
        return options.filter((o) => o.label.toLowerCase().includes(q));
    }, [options, query]);

    // close on outside click
    useEffect(() => {
        function handleClick(e) {
            if (rootRef.current && !rootRef.current.contains(e.target)) {
                setIsOpen(false);
                setQuery("");
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    useEffect(() => {
        if (isOpen && searchable) {
            const id = setTimeout(() => searchRef.current?.focus(), 10);
            return () => clearTimeout(id);
        }
    }, [isOpen, searchable]);

    const toggleOpen = () => setIsOpen((o) => !o);

    const commitSingle = useCallback(
        (val) => {
            onChange(val);
            setIsOpen(false);
            setQuery("");
        },
        [onChange]
    );

    const toggleMultiValue = useCallback(
        (val) => {
            if (val === "__all__") {
                onChange(allSelected ? [] : options.map((o) => o.value));
                return;
            }
            const next = selectedValues.includes(val)
                ? selectedValues.filter((v) => v !== val)
                : [...selectedValues, val];
            onChange(next);
        },
        [allSelected, options, selectedValues, onChange]
    );

    const removeChip = useCallback(
        (val, e) => {
            e.stopPropagation();
            onChange(selectedValues.filter((v) => v !== val));
        },
        [selectedValues, onChange]
    );

    const selectedLabels = useMemo(
        () => selectedValues.map((v) => options.find((o) => o.value === v)?.label).filter(Boolean),
        [selectedValues, options]
    );

    return (
        <div ref={rootRef} className={`relative inline-block ${width} ${className}`}>

            {/* Trigger */}
            <button
                type="button"
                onClick={toggleOpen}
                className={`flex w-full items-center justify-between rounded-xl px-1 py-2 text-sm font-medium transition-all duration-150 ease-out focus:outline-none ${t.trigger
                    } ${isOpen ? t.triggerOpen : ""}  ${theme === 'dark' ? '!border-none' : 'border'} !backdrop-blur-md`}
            >
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
                    {selectedValues.length === 0 && (
                        <span className={`truncate ${t.placeholder}`}>{placeholder}</span>
                    )}

                    {!multiple && selectedValues.length > 0 && (
                        <span className="truncate">{selectedLabels[0]}</span>
                    )}

                    {multiple &&
                        selectedLabels.slice(0, 2).map((lbl, i) => (
                            <span
                                key={selectedValues[i]}
                                className={`flex items-center gap-1 rounded-md px-2 py-0.5 !text-[10px] font-medium transition-colors ${t.chip}`}
                            >
                                <span className="max-w-[7rem] truncate !text-[12px]">{lbl}</span>
                                <X
                                    size={12}
                                    className="cursor-pointer opacity-60 hover:opacity-100"
                                    onClick={(e) => removeChip(selectedValues[i], e)}
                                />
                            </span>
                        ))}

                    {multiple && selectedValues.length > 2 && (
                        <span className={`rounded-md px-2 py-0.5 !text-[10px] font-semibold ${t.chipMore}`}>
                            +{selectedValues.length - 2}
                        </span>
                    )}
                </div>

                <ChevronDown
                    size={16}
                    className={`shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                        } ${theme === "dark" ? "text-slate-400" : "text-slate-400"}`}
                />
            </button>

            {/* Panel */}
            {isOpen && (
                <div
                    className={`absolute z-50 mt-2 w-full origin-top overflow-hidden rounded-xl animate-[fadeIn_120ms_ease-out] ${t.panel} ${theme === "light" && 'border'}`}
                >
                    {searchable && (
                        <div className={`flex items-center gap-2 border-b px-3 py-2 ${t.divider}`}>
                            <Search size={14} className={theme === "dark" ? "text-slate-500" : "text-slate-400"} />
                            <input
                                ref={searchRef}
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search…"
                                className={`w-full bg-transparent text-sm outline-none placeholder:text-inherit ${theme === "dark" ? "text-slate-100 placeholder:text-slate-500" : "text-slate-800 placeholder:text-slate-400"
                                    }`}
                            />
                        </div>
                    )}

                    <div className={`max-h-56 overflow-y-auto py-1 ${t.scroll}`}>
                        {multiple && !query && (
                            <>
                                <OptionRow
                                    label="All"
                                    checked={allSelected}
                                    onClick={() => toggleMultiValue("__all__")}
                                    t={t}
                                    emphasis
                                />
                                <div className={`my-1 border-t ${t.divider}`} />
                            </>
                        )}

                        {filteredOptions.length === 0 && (
                            <div className={`px-3 py-4 text-center text-sm ${t.empty}`}>No results found</div>
                        )}

                        {filteredOptions.map((opt) =>
                            multiple ? (
                                <OptionRow
                                    key={opt.value}
                                    label={opt.label}
                                    checked={selectedValues.includes(opt.value)}
                                    onClick={() => toggleMultiValue(opt.value)}
                                    t={t}
                                />
                            ) : (
                                <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => commitSingle(opt.value)}
                                    className={`flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors ${t.option
                                        } ${value === opt.value ? t.optionActive : ""}`}
                                >
                                    <span className="truncate">{opt.label}</span>
                                    {value === opt.value && <Check size={14} />}
                                </button>
                            )
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* Row used for multi-select checkboxes (and the "All" row) */
function OptionRow({ label, checked, onClick, t, emphasis }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors ${t.option}`}
        >
            <span
                className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${checked ? t.check : t.checkEmpty
                    }`}
            >
                {checked && <Check size={11} className="text-white" strokeWidth={3} />}
            </span>
            <span className={`truncate ${emphasis ? "font-semibold " + t.optionAll : ""}`}>{label}</span>
        </button>
    );
}