import { useContext, useState, useEffect } from 'react';
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext';

import DataObjectIcon from '@mui/icons-material/DataObject';
import JsonViewer from '../JsonViewer';
import RippleButton from '../RippleButton';
import makeApiRequest from '../../api';
import { useToast } from '../../contexts/toastContext';

const JsonEntityModal = ({ show, onHide }) => {

    const {
        theme,
        selectedJsonEntity,
        setSelectedJsonEntity,
        setJsonEntities,
        jsonEntities
    } = useContext(MainContext);

    const { notify } = useToast();

    const [isDownloading, setIsDownloading] = useState(false);
    const [showTitleModal, setShowTitleModal] = useState(false);
    const [entityTitleValue, setEntityTitleValue] = useState(selectedJsonEntity?.title || '');

    useEffect(() => {
        setEntityTitleValue(selectedJsonEntity?.title || '');
    }, [selectedJsonEntity?.title, show]);

    const handleDownload = () => {
        setIsDownloading(true);
        try {
            const jsonString = JSON.stringify(selectedJsonEntity.graph, null, 2); // formatted
            const blob = new Blob([jsonString], { type: "application/json" });
            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = `${selectedJsonEntity.title}.json`;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.log(error);
        } finally {
            setIsDownloading(false);
        }
    };

    const saveEntity = async (titleOverride = selectedJsonEntity?.title || '') => {
        const nextTitle = (titleOverride || '').trim();

        if (!nextTitle) {
            notify({
                variant: "error",
                heading: "Title required",
                subheading: "Please enter a title before saving the entity.",
            });
            return;
        }

        try {
            const updatedEntity = {
                ...selectedJsonEntity,
                title: nextTitle,
            };

            setSelectedJsonEntity(updatedEntity);

            const { success, message, id } = await makeApiRequest("/graph/save", 'POST', updatedEntity.graph);
            if (success) {
                setJsonEntities(prev => [...prev, { ...updatedEntity, graph_id: id }]);
                setSelectedJsonEntity({ ...updatedEntity, graph_id: id });
                setShowTitleModal(false);
                notify({
                    variant: "success",
                    heading: "Entity saved!",
                    subheading: "Your entity has been saved successfully.",
                });
            } else {
                throw new Error(message);
            }
        } catch (error) {
            console.error("Failed to save entity:", error.message);
            notify({
                variant: "error",
                heading: "Failed to save entity!",
                subheading: error?.message || "An error occurred while saving the entity.",
            });
        }
    };

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="lg"
            centered
            className="graph-modal p-0 flex-1"
        >
            <Modal.Header className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white !border-b-textColor-200/20'}`}>
                <Modal.Title id="contained-modal-title-vcenter" className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-1">
                        <DataObjectIcon className={`${theme === 'dark' && 'text-textColor-200'}`} fontSize="large" />
                        <p>JSON Structure</p>
                    </div>
                    <div>
                        <RippleButton cssClasses='flex items-center gap-1 disabled:cursor-not-allowed p-2'
                            disabled={isDownloading} onClick={handleDownload}>
                            {isDownloading ? <span className="animate-customPulse">Downloading...</span> : 'Download JSON'}
                        </RippleButton>
                    </div>
                    {/* JSON/Graph switched */}
                    {/* ... */}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body
                className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}  p-0 `}
            >
                <div className="flex flex-col h-[60vh]">

                    {/* Scrollable JSON Container */}
                    <div className={`flex-1 overflow-y-auto p-6 *:[&::-webkit-scrollbar]:h-1 [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700]'}`}>
                        <div className={`${theme === "light" ? 'bg-[#f5f5f5]' : 'bg-[#222]'} rounded-lg min-h-full`}>
                            <JsonViewer />
                        </div>
                    </div>

                </div>
            </Modal.Body>

            <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200/20"}`}>
                <div
                    className={`flex items-center justify-center gap-2 p-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-primary-100/50' : 'hover:bg-primary-100/15'}`}
                    onClick={onHide}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Cancel</span>
                </div>
                {
                    (!('graph_id' in selectedJsonEntity)) && (
                        <RippleButton onClick={() => {
                            setEntityTitleValue(selectedJsonEntity?.title || '');
                            setShowTitleModal(true);
                        }} cssClasses={`flex items-center gap-1 p-2 ${theme === 'light' ? 'bg-primary-500 hover:bg-primary-600 text-white' : 'bg-primary-500/20 hover:bg-primary-500/30 text-white'}`}>
                            Save JSON
                        </RippleButton>
                    )
                }
            </Modal.Footer>

            <Modal
                show={showTitleModal}
                onHide={() => setShowTitleModal(false)}
                size="md"
                centered
                dialogClassName='text-left'
            >
                <Modal.Header className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white !border-b-textColor-200/20'}`}>
                    <div className="flex flex-col gap-1">
                        <Modal.Title className={`text-lg font-semibold ${theme === 'dark' ? 'text-textColor-100' : 'text-gray-900'}`}>
                            Save entity
                        </Modal.Title>
                        <p className={`text-sm m-0 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            Choose a title before saving this JSON entity.
                        </p>
                    </div>
                </Modal.Header>

                <Modal.Body className={`${theme === 'dark' ? 'bg-textColor-300 text-white' : ''}`}>
                    <div className="flex flex-col w-full">
                        <label htmlFor="entityTitle" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                            Entity title
                        </label>
                        <input
                            type="text"
                            id="entityTitle"
                            name="entityTitle"
                            value={entityTitleValue}
                            onChange={(e) => setEntityTitleValue(e.target.value)}
                            placeholder="Enter a title for this entity"
                            className={`flex-1 block w-full p-2 mt-1 rounded-xl outline-none transition ${theme === 'dark'
                                ? '!border !border-textColor-200 bg-textColor-300 text-white placeholder:text-gray-400'
                                : '!border !border-gray-300 bg-white text-gray-900'}`}
                            onKeyDown={(e) => e.key === 'Enter' && saveEntity(entityTitleValue)}
                        />
                    </div>
                </Modal.Body>

                <Modal.Footer className={`${theme === 'light' ? '' : '!bg-textColor-300 !text-white !border-t !border-t-textColor-200/20'}`}>
                    <button
                        type="button"
                        className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                        onClick={() => setShowTitleModal(false)}
                    >
                        <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                            Cancel
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${!entityTitleValue.trim()
                            ? 'cursor-not-allowed text-gray-400'
                            : theme === 'dark'
                                ? 'hover:bg-purple-500/20 text-purple-300'
                                : 'hover:bg-purple-50 text-purple-600'}`}
                        onClick={() => saveEntity(entityTitleValue)}
                        disabled={!entityTitleValue.trim()}
                    >
                        <span className="select-none font-medium">
                            Save entity
                        </span>
                    </button>
                </Modal.Footer>
            </Modal>
        </Modal>
    );
};

export default JsonEntityModal;