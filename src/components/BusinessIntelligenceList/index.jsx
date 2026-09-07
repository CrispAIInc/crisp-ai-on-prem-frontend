import React, { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import EmptyState from '../EmptyState';
import {
    Info,
    Braces,
    Pencil,
    Trash,
    Clock,
    Sparkles
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
                {selectedJsonEntity === null ? (
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
                        {/* <BusinessIntelligenceDetails /> */}
                        <JsonViewer />
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


    const deleteEntity = async (jsonEntity) => {
        setIsDeleting(true);
        try {
            const { success, message } = await makeApiRequest(`/graphs/${jsonEntity.graph_id}`, 'DELETE');
            if (success) {
                setJsonEntities(prev => prev.filter(g => g.graph_id !== jsonEntity.graph_id));
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
                    const entityObjectKeysCount = Object.keys(entity.graph).length;

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

// function BusinessIntelligenceDetails() {

//     return
// }

export default BusinessIntelligenceList;