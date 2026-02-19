import { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import makeApiRequest from '../../api';
import LoadingSpinner from '../LoadingSpinner';
import { MainContext } from '../../contexts/mainContext';
import { useToast } from "../../contexts/toastContext";

const JsonEntityTitleUpdaterModal = ({ show, onHide, jsonEntity }) => {

    const {
        setJsonEntities,
    } = useContext(MainContext);

    const { notify } = useToast();

    const [newJsonEntityName, setNewJsonEntityName] = useState(jsonEntity.title);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        try {
            setIsLoading(true);

            const { success, message } = await makeApiRequest(`/graph/${jsonEntity.graph_id}`, 'PUT', { title: newJsonEntityName });

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
                            Json Entity title
                        </label>
                        <div className="flex items-center gap-1">
                            <input
                                type="text"
                                name="entityName"
                                placeholder='Entity name'
                                id='entityName'
                                value={newJsonEntityName}
                                onChange={(e) => setNewJsonEntityName(e.target.value)}
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

export default JsonEntityTitleUpdaterModal;