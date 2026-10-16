import {
    SlidersHorizontal,
    X,
    Layers,
    LayoutGrid,
    CheckCircle2,
    PlayCircle,
    FileText,
    Image as ImageIcon,
} from "lucide-react";
import Modal from 'react-bootstrap/Modal';

const FILETYPE_ICON = {
    video: PlayCircle,
    pdf: FileText,
    img: ImageIcon,
};

const plural = (count, singular, pluralForm) => (count === 1 ? singular : pluralForm);

function IndexRow({ label, description, isSelected, onClick }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={isSelected}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-alt text-left transition-colors hover:border-border-strong ${isSelected ? "border border-primary-300/70" : "border border-border"}`}
        >
            <Layers size={16} className="shrink-0 text-ink-muted" />
            <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-ink truncate">{label}</span>
                {description && (
                    <span className="block text-[11px] text-ink-muted truncate">{description}</span>
                )}
            </span>
            <span
                className={`shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium ${isSelected ? "text-primary-300" : "text-ink-muted"
                    }`}
            >
                {isSelected ? "Selected" : "Not selected"}
            </span>
        </button>
    );
}

function FileTypeTile({ label, Icon, isSelected, onClick, className = "" }) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-pressed={isSelected}
            className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border text-left text-sm font-medium transition-colors ${isSelected
                ? "!border !border-primary-300/70 text-primary-300"
                : "!border !border-border bg-surface-alt text-ink hover:border-border-strong"
                } ${className}`}
        >
            <Icon size={15} className={`shrink-0 ${isSelected ? "text-primary-300" : "text-ink-muted"}`} />
            <span className="flex-1 truncate">{label}</span>
            {isSelected && <CheckCircle2 size={16} className="shrink-0 text-primary-300" />}
        </button>
    );
}

export function DiscoveryFiltersModal(props) {
    const toggleValue = (selected, onChange, value) =>
        onChange(
            selected.includes(value)
                ? selected.filter((item) => item !== value)
                : [...selected, value]
        );

    const toggleAll = (options, selected, onChange) => {
        const allSelected = options.length > 0 && options.every((o) => selected.includes(o.value));
        onChange(allSelected ? [] : options.map((o) => o.value));
    };

    const allIndexesSelected =
        props.indexOptions.length > 0 &&
        props.indexOptions.every((o) => props.selectedIndexes.includes(o.value));
    const allFileTypesSelected =
        props.fileTypeOptions.length > 0 &&
        props.fileTypeOptions.every((o) => props.selectedFileTypes.includes(o.value));

    const summaryParts = [];
    if (props.selectedIndexes.length) {
        summaryParts.push(
            `${props.selectedIndexes.length} ${plural(props.selectedIndexes.length, "index", "indexes")}`
        );
    }
    if (props.selectedFileTypes.length) {
        summaryParts.push(
            `${props.selectedFileTypes.length} ${plural(props.selectedFileTypes.length, "file type", "file types")}`
        );
    }
    const summary = summaryParts.length ? `${summaryParts.join(", ")} selected` : "No filters applied";

    const hasFilters = props.selectedIndexes.length > 0 || props.selectedFileTypes.length > 0;
    const handleApply = props.onApply ?? props.onHide;
    const handleCancel = props.onCancel ?? props.onHide;

    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            size="md"
            aria-labelledby="discovery-filters-title"
            scrollable={true}
            centered
            className="note-modal"
            contentClassName="!rounded-2xl overflow-hidden"
        >
            {/* Header */}
            <Modal.Header className="!flex !items-start !gap-3 !px-5 !py-4 !border-b border-border">
                <span className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <SlidersHorizontal size={16} />
                </span>
                <div className="flex-1 min-w-0">
                    <h2 id="discovery-filters-title" className="m-0 text-[15px] font-semibold text-ink">
                        Advanced filters
                    </h2>
                    <p className="m-0 mt-0.5 text-xs text-ink-muted">
                        Refine the sources displayed in your workspace.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={props.onHide}
                    aria-label="Close"
                    className="p-1 rounded-md text-ink-muted hover:bg-surface-alt hover:text-ink"
                >
                    <X size={18} />
                </button>
            </Modal.Header>

            {/* Body */}
            <Modal.Body className="!px-5 !py-4 space-y-5">
                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="m-0 text-sm font-semibold text-ink">Indexes</h3>
                        <span className="text-xs text-ink-muted">
                            {props.indexOptions.length} available
                        </span>
                    </div>
                    {props.indexOptions.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            <IndexRow
                                label="All"
                                description="Every available index"
                                isSelected={allIndexesSelected}
                                onClick={() =>
                                    toggleAll(props.indexOptions, props.selectedIndexes, props.onSelectedIndexesChange)
                                }
                            />
                            {props.indexOptions.map((option) => (
                                <IndexRow
                                    key={option.value}
                                    label={option.label}
                                    description={option.description}
                                    isSelected={props.selectedIndexes.includes(option.value)}
                                    onClick={() =>
                                        toggleValue(props.selectedIndexes, props.onSelectedIndexesChange, option.value)
                                    }
                                />
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-ink-muted">No indexes available.</p>
                    )}
                </section>

                <div className="border-t border-border" />

                <section>
                    <div className="mb-3 flex items-center justify-between">
                        <h3 className="m-0 text-sm font-semibold text-ink">File type</h3>
                        <span className="text-xs text-ink-muted">
                            {props.selectedFileTypes.length} selected
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <FileTypeTile
                            label="All"
                            Icon={LayoutGrid}
                            isSelected={allFileTypesSelected}
                            className="col-span-2"
                            onClick={() =>
                                toggleAll(props.fileTypeOptions, props.selectedFileTypes, props.onSelectedFileTypesChange)
                            }
                        />
                        {props.fileTypeOptions.map((option) => (
                            <FileTypeTile
                                key={option.value}
                                label={option.label}
                                Icon={FILETYPE_ICON[option.value] ?? FileText}
                                isSelected={props.selectedFileTypes.includes(option.value)}
                                onClick={() =>
                                    toggleValue(props.selectedFileTypes, props.onSelectedFileTypesChange, option.value)
                                }
                            />
                        ))}
                    </div>
                </section>
            </Modal.Body>

            {/* Footer */}
            <Modal.Footer className="!flex !flex-col !items-stretch !justify-start gap-3 !px-5 !py-4 !border-t border-border [&>*]:!m-0">
                <div className="flex items-center justify-between">
                    <span className="text-xs text-ink-muted">{summary}</span>
                    <button
                        type="button"
                        onClick={props.onClear}
                        disabled={!hasFilters}
                        className="text-xs font-medium text-ink-muted hover:text-ink disabled:opacity-40 disabled:pointer-events-none text-primary-300"
                    >
                        Clear filters
                    </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="rounded-xl border border-border bg-surface-alt px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:border-border-strong"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleApply}
                        className="rounded-xl px-3 py-2.5 text-sm font-medium text-white transition-colors gradient-primary"
                    >
                        Apply filters
                    </button>
                </div>
            </Modal.Footer>
        </Modal>
    );
}
