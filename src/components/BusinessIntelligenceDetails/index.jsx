import {
    Braces,
    Download,
    SaveCheck,
    X
} from "lucide-react";
import { useContext, useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext';
import { useToast } from '../../contexts/toastContext';
import JsonViewer from '../JsonViewer';
import RippleButton from '../RippleButton';

export default function BusinessIntelligenceDetails() {

    const {
        selectedJsonEntity,
        setSelectedJsonEntity,
        setJsonEntities
    } = useContext(MainContext);

    const { notify } = useToast();

    const [showTitleModal, setShowTitleModal] = useState(false);
    const [entityTitleValue, setEntityTitleValue] = useState(selectedJsonEntity?.title || '');
    const [isEntitySaving, setIsEntitySaving] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        setEntityTitleValue(selectedJsonEntity?.title);
    }, [selectedJsonEntity?.graph_id, selectedJsonEntity?.title, showTitleModal]);


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
        const nextTitle = (titleOverride || '')?.trim();

        if (!nextTitle) {
            notify({
                variant: "error",
                heading: "Title required",
                subheading: "Please enter a title before saving the entity.",
            });
            return;
        }

        try {
            setIsEntitySaving(true);

            const updatedEntity = {
                ...selectedJsonEntity,
                title: nextTitle,
            };

            setSelectedJsonEntity(updatedEntity);

            const { success, message, graph_id } = await makeApiRequest("/graphs/save", 'POST', updatedEntity.graph);
            if (success) {
                setJsonEntities(prev => [...prev, { ...updatedEntity, graph_id }]);
                setSelectedJsonEntity({ ...updatedEntity, graph_id });
                notify({
                    variant: "success",
                    heading: "Entity saved!",
                    subheading: "Your entity has been saved successfully.",
                });
                setShowTitleModal(false);
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
        } finally {
            setIsEntitySaving(false);
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <div id="contained-modal-title-vcenter" className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1">
                    <Braces size={20} />
                    <p>JSON Structure</p>
                </div>
                <div className="flex items-center gap-2">
                    {
                        (selectedJsonEntity?.graph_id === null || selectedJsonEntity?.graph_id === undefined) ? (
                            <RippleButton
                                cssClasses='flex items-center gap-1 disabled:cursor-not-allowed p-2'
                                disabled={isEntitySaving}
                                onClick={() => setShowTitleModal(true)}
                            >
                                <SaveCheck size={18} />
                                {
                                    isEntitySaving ? <span className="animate-customPulse">Saving...</span> : "Save entity"
                                }
                            </RippleButton>
                        ) : (
                            <RippleButton
                                cssClasses='flex items-center gap-1 disabled:cursor-not-allowed p-2'
                                disabled={isDownloading}
                                onClick={handleDownload}
                            >
                                <Download size={16} />
                                {isDownloading ? <span className="animate-customPulse">Downloading...</span> : 'Export JSON'}
                            </RippleButton>
                        )
                    }

                    <RippleButton
                        cssClasses="px-2 flex items-center gap-1 py-2 text-sm rounded"
                        onClick={() => setSelectedJsonEntity(null)}
                    >
                        <X size={16} />
                        Close
                    </RippleButton>
                </div>
            </div>
            <JsonViewer />

            {/* saving modal */}
            <Modal
                show={showTitleModal}
                onHide={() => setShowTitleModal(false)}
                size="md"
                centered
                dialogClassName='text-left'
            >
                <Modal.Header>
                    <div className="flex flex-col gap-1">
                        <Modal.Title className={`text-lg font-semibold text-gray-900`}>
                            Save entity
                        </Modal.Title>
                        <p className={`text-sm m-0 text-gray-500`}>
                            Choose a title before saving this JSON entity.
                        </p>
                    </div>
                </Modal.Header>

                <Modal.Body>
                    <div className="flex flex-col w-full">
                        <label htmlFor="entityTitle" className={`block text-sm font-medium text-gray-700`}>
                            Entity title
                        </label>
                        <input
                            type="text"
                            id="entityTitle"
                            name="entityTitle"
                            value={entityTitleValue}
                            onChange={(e) => setEntityTitleValue(e.target.value)}
                            placeholder="Enter a title for this entity"
                            className={`flex-1 block w-full p-2 mt-1 rounded-xl outline-none transition border border-gray-300 bg-white text-gray-900`}
                            onKeyDown={(e) => e.key === 'Enter' && saveEntity(entityTitleValue)}
                        />
                    </div>
                </Modal.Body>

                <Modal.Footer>
                    <button
                        type="button"
                        className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition hover:bg-light-hover-100`}
                        onClick={() => setShowTitleModal(false)}
                    >
                        <span className={`select-none font-medium text-textColor-100`}>
                            Cancel
                        </span>
                    </button>

                    <button
                        type="button"
                        className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${!entityTitleValue?.trim()
                            ? 'cursor-not-allowed text-gray-400'
                            : 'hover:bg-purple-50 text-purple-600'}`}
                        onClick={() => saveEntity(entityTitleValue)}
                        disabled={!entityTitleValue?.trim()}
                    >
                        <span className="select-none font-medium">
                            Save entity
                        </span>
                    </button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}