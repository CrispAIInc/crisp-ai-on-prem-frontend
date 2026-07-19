import Modal from "react-bootstrap/Modal";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { useContext, useState, useEffect, useRef } from 'react';
import { ProjectContext } from '../../contexts/projectContext';
import LoadingSpinner from '../LoadingSpinner';

export default function ConfirmationModal({
    show,
    onHide,
    heading,
    subheading,
    targetName,           // e.g. "O-I" — the specific resource being deleted
    itemCount,            // e.g. 2 — optional, how many things get deleted
    itemLabel = "items",  // e.g. "sources"
    requireTypedConfirmation = false,
    confirmedFn,
    isDeleting,
}) {
    const { theme } = useContext(ProjectContext);
    const [typedValue, setTypedValue] = useState("");
    const [error, setError] = useState(null);
    const cancelRef = useRef(null);

    useEffect(() => {
        if (show) {
            setTypedValue("");
            setError(null);
            // Default focus on the safe option, not the destructive one
            requestAnimationFrame(() => cancelRef.current?.focus());
        }
    }, [show]);

    if (!show) return null;

    const isLight = theme === 'light';
    const confirmDisabled =
        isDeleting || (requireTypedConfirmation && typedValue !== targetName);

    const handleConfirm = async () => {
        setError(null);
        try {
            await confirmedFn();
        } catch (e) {
            setError("Couldn't delete right now. Try again.");
        }
    };

    const resolvedSubheading =
        subheading ??
        ((itemCount != null && itemCount > 0)
            ? `This permanently deletes ${itemCount} ${itemLabel} in "${targetName}". This can't be undone.`
            : `This can't be undone.`);

    return (
        <Modal
            show={show}
            onHide={isDeleting ? undefined : onHide}
            size="md"
            aria-labelledby="confirm-delete-title"
            aria-describedby="confirm-delete-body"
            scrollable
            centered
            dialogClassName="text-left"
        >
            <Modal.Body className={isLight ? '' : 'bg-textColor-300 text-white'}>
                <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <ErrorOutlineIcon className="text-red-500 !text-[48px]" />
                    <h2 id="confirm-delete-title" className={`text-xl font-semibold mb-0 ${isLight ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        {/* {heading ?? `Delete "${targetName}"?`} */}
                        Delete <span className="font-bold text-xl">{targetName}</span>?
                    </h2>
                    <p id="confirm-delete-body" className={`w-5/6 mx-auto text-sm ${isLight ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        {resolvedSubheading}
                    </p>

                    {requireTypedConfirmation && (
                        <div className="w-5/6 mx-auto mt-2 text-left">
                            <label className={`text-xs font-medium ${isLight ? 'text-textColor-300' : 'text-textColor-100'}`}>
                                Type <span className="font-semibold">{targetName}</span> to confirm
                            </label>
                            <input
                                type="text"
                                value={typedValue}
                                onChange={(e) => setTypedValue(e.target.value)}
                                disabled={isDeleting}
                                className={`mt-1 w-full rounded-md  px-3 py-2 text-sm outline-none  ${isLight ? '!border !border-gray-300 bg-white' : '!border !border-textColor-200/20 bg-textColor-300'
                                    }`}
                                autoComplete="off"
                            />
                        </div>
                    )}

                    {error && (
                        <p role="alert" className="text-sm text-red-500 mt-1">
                            {error}
                        </p>
                    )}
                </div>
            </Modal.Body>

            <Modal.Footer
                className={`flex items-center justify-end gap-2 ${isLight ? '' : '!bg-textColor-300 !text-white !border-t !border-t-textColor-200/20'
                    }`}
            >
                <button
                    ref={cancelRef}
                    type="button"
                    disabled={isDeleting}
                    onClick={onHide}
                    className={`rounded-md px-4 py-2 text-sm font-medium  transition-colors disabled:opacity-50 ${isLight
                        ? '!border !border-gray-300 text-textColor-300 hover:bg-gray-50'
                        : '!border !border-textColor-200/20 text-textColor-100 hover:bg-textColor-200/20'
                        }`}
                >
                    Cancel
                </button>

                <button
                    type="button"
                    disabled={confirmDisabled}
                    onClick={handleConfirm}
                    className="rounded-md px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isDeleting ? (
                        <span className="flex items-center gap-2">
                            <LoadingSpinner isSmall />
                            Deleting…
                        </span>
                    ) : (
                        `Delete ${itemLabel === 'items' ? '' : itemLabel}`.trim()
                    )}
                </button>
            </Modal.Footer>
        </Modal>
    );
}
