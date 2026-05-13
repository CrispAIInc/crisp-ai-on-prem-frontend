import { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import makeApiRequest from '../../api';
import LoadingSpinner from '../LoadingSpinner';
import { useToast } from "../../contexts/toastContext";

const MomentTitleUpdaterModal = ({ show, onHide, moment, setMoments }) => {

    const { notify } = useToast();

    const [newMomentTitle, setNewMomentTitle] = useState(moment.title);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        try {
            setIsLoading(true);

            const { success, message, new_title } = await makeApiRequest(`/moment/${moment.id}`, 'PUT', { title: newMomentTitle });

            if (success) {
                setMoments(prev => prev.map(item => {
                    if (item.id === moment.id) {
                        return { ...item, title: new_title };
                    }
                    return item;
                }));
                notify({
                    variant: 'success',
                    heading: 'moment title updated',
                });
                onHide();
            }
            else {
                throw new Error(message);
            }
        } catch (error) {
            console.error("Error updating moment title:", error.message);
            notify({
                variant: 'error',
                heading: 'Error updating moment title',
                subheading: error.message || "An error occurred while updating the moment title. Please try again.",
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (!show) return null;

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
        >

            <Modal.Body>
                <div className='flex flex-col items-start justify-center gap-3'>
                    {/* project name */}
                    <div className="flex flex-col w-full">
                        <label htmlFor="indexName" className={`block text-sm font-medium`}>
                            moment title
                        </label>
                        <div className="flex items-center gap-1">
                            <input
                                type="text"
                                name="momentTitle"
                                placeholder='moment title'
                                id='momentTitle'
                                value={newMomentTitle}
                                onChange={(e) => setNewMomentTitle(e.target.value)}
                                className={`flex-1 block w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                                required
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            />
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center gap-3 `}>
                <div
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit hover:bg-light-hover-100`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium text-textColor-300`}>
                        Cancel
                    </span>
                </div>

                <div
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit hover:bg-light-hover-100`}
                    onClick={handleSave}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium text-purple-500`}>
                        rename
                    </span>}
                </div>
            </Modal.Footer>
        </Modal>
    );
};

export default MomentTitleUpdaterModal;