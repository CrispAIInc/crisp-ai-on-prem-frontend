import React, { useContext, useEffect, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import EmptyState from '../EmptyState';
import {
    Info,
    Braces,
    Pencil,
    Trash,
    SaveCheck,
    Download,
    X
} from "lucide-react";
import ActionMenu from '../ActionMenu';
import AnimatedText from '../AnimatedText';
import LoadingSpinner from '../LoadingSpinner';
import { ProjectContext } from '../../contexts/projectContext';
import BaseHeading from '../BaseHeading';
import { formatReadableDate } from '../../utils';
import JsonEntityTitleUpdaterModal from '../JsonEntityTitleUpdaterModal';
import makeApiRequest from '../../api';
import { useToast } from '../../contexts/toastContext';
import JsonViewer from '../JsonViewer';
import RippleButton from '../RippleButton';
import Modal from 'react-bootstrap/Modal';

function BusinessIntelligenceList() {

    const {
        jsonEntities,
        selectedJsonEntity
    } = useContext(MainContext);

    return (
        <div className={`h-full min-h-0 flex overflow-hidden`}>
            {/* Left column — list */}
            <div className="w-[280px] shrink-0 border-r border-border h-full min-h-0 overflow-y-auto p-3 flex flex-col gap-2">
                {jsonEntities.length === 0 ? (
                    <EmptyState
                        icon={<Info size={20} />}
                        title="No entities found"
                        description="Use left panel to start generating entities."
                    />
                ) : (
                    <BusinessIntelligenceListItem />
                )}
            </div>

            {/* Right column — selected segment */}
            <div className="flex-1 min-w-0 h-full min-h-0 overflow-y-auto">
                {(selectedJsonEntity === undefined || selectedJsonEntity === null) ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-2.5 px-6">
                        <div className="w-11 h-11 rounded-xl bg-surface-alt flex items-center justify-center text-ink-muted">
                            <Braces size={20} />
                        </div>
                        <strong className="text-ink text-[13px] font-semibold">Select an Entity</strong>
                        <span className="text-[12.5px] text-ink-muted max-w-[260px]">
                            Pick an Entity from the list to see its details.
                        </span>
                    </div>
                ) : (
                    <div className="p-4 flex flex-col gap-4">
                        <BusinessIntelligenceDetails />
                    </div>
                )}
            </div>
        </div>
    );
}

function BusinessIntelligenceListItem() {

    const {
        isProjectReadOnly
    } = useContext(ProjectContext);

    const {
        jsonEntities,
        setJsonEntities,
        selectedJsonEntity,
        setSelectedJsonEntity
    } = useContext(MainContext);

    const { notify } = useToast();


    const [isEntityDeleting, setIsEntityDeleting] = useState(false);
    const [hoveredEntity, setHoveredEntity] = useState(null);
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);


    const deleteEntity = async (jsonEntityId) => {
        setIsDeleting(true);
        try {
            const { success, message } = await makeApiRequest(`/graphs/${jsonEntityId}`, 'DELETE');
            if (success) {
                setJsonEntities(prev => prev.filter(g => g.graph_id !== jsonEntityId));
                //SET CURRENT ENTITY TO NULL IF IT'S THE ONE BEING DELETED
                if (selectedJsonEntity.graph_id === jsonEntityId) {
                    setSelectedJsonEntity(null);
                }
                notify({
                    variant: 'success',
                    heading: 'Entity deleted',
                });
            }
            else {
                throw new Error(message);
            }
        } catch (error) {
            console.error("Error deleting entity:", error.message);
            notify({
                variant: 'error',
                heading: 'Error deleting entity',
                subheading: error.message || "An error occurred while deleting the entity. Please try again.",
            });
        } finally {
            setIsDeleting(false);
        }
    };


    return (
        <div className={`flex flex-col gap-2 bg-gray-200/20 rounded-md p-2 cursor-pointer hover:bg-gray-100`}>
            {
                jsonEntities.map(entity => {
                    const entityObjectKeysCount = Object.keys(entity?.graph ?? {}).length;

                    return (
                        <div key={entity.graph_id}
                            className={`flex items-center ${entity.graph_id === selectedJsonEntity?.graph_id ? ' bg-gray-200' : '!border !border-transparent'} gap-2 hover:bg-textColor-100/25 cursor-pointer p-2 rounded-md select-none`}
                            onClick={() => setSelectedJsonEntity(entity)}
                            onMouseEnter={() => setHoveredEntity(entity.graph_id)}
                            onMouseLeave={() => setHoveredEntity(null)}
                        >

                            {
                                !isProjectReadOnly && (
                                    hoveredEntity === entity.graph_id && (<ActionMenu
                                        direction="right"
                                        actions={[
                                            {
                                                label: "Edit title",
                                                icon: <Pencil size={13} />,
                                                onClick: (e) => {
                                                    e.stopPropagation();
                                                    setSelectedEntity(entity);
                                                    setIsModalOpen(true);
                                                },
                                            },
                                            {
                                                label: isEntityDeleting ? <AnimatedText text='Deleting...' cssClasses="!font-semibold !text-sm" /> : "Delete",
                                                icon: isEntityDeleting ? <LoadingSpinner isSmall /> : <Trash size={13} />,
                                                onClick: () => deleteEntity(entity.graph_id),
                                            },
                                        ]}
                                    />)
                                )
                            }

                            <div className="overflow-x-hidden">
                                {/* creation date */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        {
                                            entity?.created_at !== undefined && (
                                                <>
                                                    <BaseHeading text={`${formatReadableDate(entity?.created_at)}`} className="text-xs !font-bold !italic" />
                                                    <BaseHeading text="•" />
                                                </>
                                            )
                                        }
                                        <BaseHeading text={`${entityObjectKeysCount} Key insights`} className="!text-primary-300" />
                                    </div>

                                    <label className="block cursor-pointer text-[12.5px] font-semibold text-ink" key={entity.graph_id}>{entity?.title}</label>
                                </div>
                            </div>

                            {
                                isModalOpen && (
                                    <JsonEntityTitleUpdaterModal show={isModalOpen} onHide={() => setIsModalOpen(false)} jsonEntity={selectedEntity} />
                                )
                            }
                        </div>
                    );
                })
            }
        </div>
    );
}

function BusinessIntelligenceDetails() {

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

export default BusinessIntelligenceList;