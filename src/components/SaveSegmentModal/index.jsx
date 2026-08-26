import { useContext, useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import makeApiRequest from '../../api';
import LoadingSpinner from '../LoadingSpinner';
import { MainContext } from '../../contexts/mainContext';
import { useToast } from "../../contexts/toastContext";

const SaveSegmentModal = ({ show, onHide, segment, setSegmentDescriptions, onSaved }) => {
    console.log(segment);

    const { theme } = useContext(MainContext);
    const { notify } = useToast();

    const [title, setTitle] = useState(segment?.title || '');
    const [isLoading, setIsLoading] = useState(false);
    const isTitleValid = title.trim().length > 0;

    useEffect(() => {
        setTitle(segment?.title || '');
    }, [segment]);

    const handleSave = async () => {
        if (!isTitleValid) return;

        try {
            setIsLoading(true);

            const payload = {
                video_filename: segment.video,
                response: { ...segment, title: title.trim() }
            };

            const { success, message, id } = await makeApiRequest('/segments/save', 'POST', payload);

            if (success) {
                // Add saved segment to local list (if setter provided)
                console.log("setting vsd", segment);
                setSegmentDescriptions(prev => [
                    { ...segment, title: title.trim(), id },
                    ...(prev || [])
                ]);
                notify({ variant: 'success', heading: 'Segment saved' });
                if (typeof onSaved === 'function') {
                    try { onSaved(id); }
                    catch (e) { console.error(e); }
                }
                onHide();
            } else {
                throw new Error(message);
            }
        } catch (error) {
            console.error("Error saving segment:", error.message || error);
            notify({ variant: 'error', heading: 'Error saving segment', subheading: error.message || 'Could not save segment.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (!show) return null;

    return (
        <Modal show={show} onHide={onHide} size="md" aria-labelledby="save-segment" centered dialogClassName='text-left'>
            <Modal.Header className={`border-0 pb-0 ${theme === 'dark' ? '!bg-textColor-300 !text-white' : ''}`}>
                <div className="flex flex-col gap-1">
                    <Modal.Title id="save-segment" className={`text-lg font-semibold ${theme === 'dark' ? 'text-textColor-100' : 'text-gray-900'}`}>
                        Save segment
                    </Modal.Title>
                    <p className={`text-sm m-0 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Provide a title to save this generated segment.
                    </p>
                </div>
            </Modal.Header>

            <Modal.Body className={`${theme === 'dark' ? 'bg-textColor-300 text-white' : ''}`}>
                <div className='flex flex-col items-start justify-center gap-3'>
                    <div className="flex flex-col w-full">
                        <label htmlFor="segmentTitle" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Segment title
                        </label>
                        <input id="segmentTitle" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter a title" className={`flex-1 block w-full p-2 mt-1 rounded-xl outline-none transition ${theme === 'dark' ? '!border !border-textColor-200 bg-textColor-300 text-white' : '!border !border-gray-300 bg-white text-gray-900'}`} onKeyDown={(e) => e.key === 'Enter' && handleSave()} />
                    </div>
                </div>
            </Modal.Body>

            <Modal.Footer className={`flex items-center justify-end gap-3 ${theme === 'dark' ? '!bg-textColor-300 !text-white !border-t !border-t-textColor-200' : ''}`}>
                <button type="button" className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`} onClick={onHide}>
                    <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Cancel</span>
                </button>

                <button type="button" className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${!isTitleValid || isLoading ? 'cursor-not-allowed text-gray-400' : theme === 'dark' ? 'hover:bg-purple-500/20 text-purple-300' : 'hover:bg-purple-50 text-purple-600'}`} onClick={handleSave} disabled={!isTitleValid || isLoading}>
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium`}>Save segment</span>}
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default SaveSegmentModal;
