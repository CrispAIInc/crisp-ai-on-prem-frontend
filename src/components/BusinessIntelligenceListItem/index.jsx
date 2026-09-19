import {
    Pencil,
    Trash
} from "lucide-react";
import { useContext, useState } from 'react';
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext';
import { ProjectContext } from '../../contexts/projectContext';
import { useToast } from '../../contexts/toastContext';
import { formatReadableDate } from '../../utils';
import ActionMenu from '../ActionMenu';
import AnimatedText from '../AnimatedText';
import BaseHeading from '../BaseHeading';
import JsonEntityTitleUpdaterModal from '../JsonEntityTitleUpdaterModal';
import LoadingSpinner from '../LoadingSpinner';

export default function BusinessIntelligenceListItem() {

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