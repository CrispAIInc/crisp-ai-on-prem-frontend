import Modal from 'react-bootstrap/Modal';
import BaseHeading from '../BaseHeading';
import RippleButton from '../RippleButton';


export function DiscoveryFiltersModal(props) {
    const renderOptions = (options, selected, onChange) => {
        const allSelected = options.length > 0 && options.every((option) => selected.includes(option.value));
        const renderOption = (label, isSelected, onClick, key) => (
            <button
                key={key}
                type="button"
                onClick={onClick}
                aria-pressed={isSelected}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-[12.5px] text-left text-ink hover:bg-surface-alt"
            >
                <span
                    className={`w-4 h-4 rounded-[5px] border flex items-center justify-center shrink-0 ${isSelected ? "bg-primary border-primary text-white" : "border-border-strong"}`}
                >
                    {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M20 6 9 17l-5-5" />
                        </svg>
                    )}
                </span>
                {label}
            </button>
        );

        return (
            <>
                {renderOption(
                    "All",
                    allSelected,
                    () => onChange(allSelected ? [] : options.map((option) => option.value)),
                    "all"
                )}
                {options.map((option) => {
                    const isSelected = selected.includes(option.value);
                    return renderOption(
                        option.label,
                        isSelected,
                        () => onChange(
                            isSelected
                                ? selected.filter((value) => value !== option.value)
                                : [...selected, option.value]
                        ),
                        option.value
                    );
                })}
            </>
        );
    };

    return (
        <Modal
            show={props.show}
            onHide={props.onHide}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            className="note-modal"
        >
            <Modal.Header closeButton className="flex items-center justify-between gap-2 flex-wrap">
                <Modal.Title id="contained-modal-title-vcenter">
                    <BaseHeading text="Advanced Filters" />
                </Modal.Title>
                <RippleButton
                    onClick={props.onClear}
                    cssClasses="!px-3 !py-1.5 !text-xs"
                    disabled={!props.selectedIndexes.length && !props.selectedFileTypes.length}
                >
                    Clear Filters
                </RippleButton>
            </Modal.Header>
            <Modal.Body className="space-y-5">
                <section>
                    <h3 className="mb-2 text-sm font-semibold text-textColor-300">Indexes</h3>
                    {props.indexOptions.length > 0 ? (
                        <div className="max-h-48 overflow-y-auto">
                            {renderOptions(props.indexOptions, props.selectedIndexes, props.onSelectedIndexesChange)}
                        </div>
                    ) : (
                        <p className="text-sm text-ink-muted">No indexes available.</p>
                    )}
                </section>
                <section>
                    <h3 className="mb-2 text-sm font-semibold text-textColor-300">File type</h3>
                    <div className="max-h-48 overflow-y-auto">
                        {renderOptions(props.fileTypeOptions, props.selectedFileTypes, props.onSelectedFileTypesChange)}
                    </div>
                </section>
            </Modal.Body>
            <Modal.Footer>
                <button
                    type="button"
                    onClick={props.onHide}
                    className="flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit hover:bg-light-hover-100"
                >
                    <span className="font-medium text-textColor-300">Ok</span>
                </button>
            </Modal.Footer>
        </Modal>
    );
}