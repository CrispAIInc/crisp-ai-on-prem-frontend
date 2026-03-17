import React, { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';
import LoadingSpinner from '../LoadingSpinner';
import DeleteIcon from "@mui/icons-material/Delete";
import makeApiRequest from '../../api';
import { ToastContext } from '../../contexts/toastContext';
import { ProjectContext } from '../../contexts/projectContext';
import ActionMenu from "../ActionMenu";
import AnimatedText from "../AnimatedText";

function TimeSegmentDescriptionList({ setCurrentSegment, setShowList, segmentDescriptions, setSegmentDescriptions }) {

    const {
        isProjectReadOnly
    } = useContext(ProjectContext);

    const {
        theme,
        knowledgeBase
    } = useContext(MainContext);

    const {
        notify
    } = useContext(ToastContext);

    function handleSelectResult(segment) {
        const segmentSource = knowledgeBase.find(item => item.source_path === segment.video);

        if (segmentSource) {
            setCurrentSegment({
                ...segment,
                timestampText: `${segmentSource.source_path} | ${segment.start}`,
                refs: [{
                    ...segmentSource,
                    timestamp: segment.start
                }]
            });
            setShowList(false);
        } else {
            notify({
                variant: "info",
                heading: "The source for this segment doesn not exist."
            });
        }
    }

    const [isSegmentDeleting, setIsSegmentDeleting] = useState(false);

    const [hoveredSegment, setHoveredSegment] = useState(null);

    const handleMouseEnterSegment = (id) => {
        setHoveredSegment(id);
    };
    const handleMouseLeaveSegment = () => {
        setHoveredSegment(null);
    };

    async function deleteSegment(segmentId) {
        try {
            setIsSegmentDeleting(true);
            const { success, message } = await makeApiRequest(`/segment-response/${segmentId}`, 'DELETE');

            if (success) {
                setSegmentDescriptions(prev => prev.filter(item => item.id !== segmentId));
                notify({
                    variant: "success",
                    heading: "Video segment deleted!"
                });
            } else {
                throw new Error(message);
            }
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Couldn't delete video segment",
                subheading: error.message || "",
            });
        } finally {
            setIsSegmentDeleting(false);
        }
    }

    return (
        <div className="flex flex-col gap-2 overflow-y-auto">
            <BaseHeading text="Saved segment responses" />
            <div className='flex flex-col gap-1'>
                {
                    segmentDescriptions.map(segment => (
                        <div key={segment.id}
                            className={`flex items-center  gap-2 ${theme === 'light'
                                ? 'hover:bg-textColor-100/10'
                                : 'hover:bg-light-hover-200/20'
                                } cursor-pointer p-2 rounded-md select-none`}
                            onClick={() => handleSelectResult(segment)}
                            onMouseEnter={() => handleMouseEnterSegment(segment.id)}
                            onMouseLeave={handleMouseLeaveSegment}
                        >

                            {
                                !isProjectReadOnly && (
                                    <ActionMenu
                                        actions={[
                                            {
                                                label: isSegmentDeleting ? <AnimatedText text='Deleting...' cssClasses="!font-semibold !text-sm" /> : "Delete",
                                                icon: isSegmentDeleting ? <LoadingSpinner isSmall /> : <DeleteIcon />,
                                                onClick: () => deleteSegment(segment.id),
                                            },
                                        ]}
                                    />
                                )}

                            <div>
                                <BaseHeading text={`${segment.start}-${segment.end} • ${segment.response_format.schema.talking_head.length > 0 ? `${segment.response_format.schema.talking_head.length} ${segment.response_format.schema.talking_head.length === 1 ? 'person' : 'people'}` : 'no people detected'}`} className="text-xs" />
                                <p className={`${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} cursor-pointer w-fit truncate`} key={segment.id}>{segment?.title || segment?.query}</p>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default TimeSegmentDescriptionList;