import { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import makeApiRequest from '../../api';
import LoadingSpinner from '../LoadingSpinner';
import { MainContext } from '../../contexts/mainContext';
import { useToast } from "../../contexts/toastContext";

const JsonEntityTitleUpdaterModal = ({ show, onHide, jsonEntity }) => {

    const {
        setJsonEntities,
        theme,
    } = useContext(MainContext);

    const { notify } = useToast();

    const [newJsonEntityName, setNewJsonEntityName] = useState(jsonEntity.title);
    const [isLoading, setIsLoading] = useState(false);
    const isTitleValid = newJsonEntityName.trim().length > 0;

    const handleSave = async () => {
        if (!isTitleValid) return;

        try {
            setIsLoading(true);

            const { success, message } = await makeApiRequest(`/graphs/${jsonEntity.graph_id}`, 'PATCH', { title: newJsonEntityName.trim() });

            if (success) {
                setJsonEntities(prev => prev.map(graph => {
                    if (graph.graph_id === jsonEntity.graph_id) {
                        return { ...graph, title: newJsonEntityName };
                    }
                    return graph;
                }));
                notify({
                    variant: 'success',
                    heading: 'Entity title updated',
                });
                onHide();
            }
            else {
                throw new Error(message);
            }
        } catch (error) {
            console.error("Error updating entity title:", error.message);
            notify({
                variant: 'error',
                heading: 'Error updating entity title',
                subheading: error.message || "An error occurred while updating the entity title. Please try again.",
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
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
        >
            <Modal.Header className={`border-0 pb-0 ${theme === 'dark' ? '!bg-textColor-300 !text-white' : ''}`}>
                <div className="flex flex-col gap-1">
                    <Modal.Title id="contained-modal-title-vcenter" className={`text-lg font-semibold ${theme === 'dark' ? 'text-textColor-100' : 'text-gray-900'}`}>
                        Update entity title
                    </Modal.Title>
                    <p className={`text-sm m-0 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Choose a clear title that describes this JSON entity.
                    </p>
                </div>
            </Modal.Header>

            <Modal.Body className={`${theme === 'dark' ? 'bg-textColor-300 text-white' : ''}`}>
                <div className='flex flex-col items-start justify-center gap-3'>
                    <div className="flex flex-col w-full">
                        <label htmlFor="entityName" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Json entity title
                        </label>
                        <input
                            type="text"
                            name="entityName"
                            placeholder='Enter a new entity title'
                            id='entityName'
                            value={newJsonEntityName}
                            onChange={(e) => setNewJsonEntityName(e.target.value)}
                            className={`flex-1 block w-full p-2 mt-1  rounded-xl outline-none transition ${theme === 'dark'
                                ? '!border !border-textColor-200 bg-textColor-300 text-white placeholder:text-gray-400'
                                : '!border !border-gray-300 bg-white text-gray-900'}`}
                            required
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center justify-end gap-3 ${theme === 'dark' ? '!bg-textColor-300 !text-white !border-t !border-t-textColor-200' : ''}`}>
                <button
                    type="button"
                    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Cancel
                    </span>
                </button>

                <button
                    type="button"
                    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${!isTitleValid || isLoading
                        ? 'cursor-not-allowed text-gray-400'
                        : theme === 'dark'
                            ? 'hover:bg-purple-500/20 text-purple-300'
                            : 'hover:bg-purple-50 text-purple-600'}`}
                    onClick={handleSave}
                    disabled={!isTitleValid || isLoading}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium`}>
                        Save title
                    </span>}
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default JsonEntityTitleUpdaterModal;