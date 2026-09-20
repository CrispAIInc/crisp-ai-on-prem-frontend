import { Pencil, Trash } from "lucide-react";
import { useContext, useState } from 'react';
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext';
import { ProjectContext } from '../../contexts/projectContext';
import { ToastContext } from '../../contexts/toastContext';
import ActionMenu from '../ActionMenu';
import AnimatedText from '../AnimatedText';
import BaseHeading from '../BaseHeading';
import LoadingSpinner from '../LoadingSpinner';
import TimeSegmentTitleUpdaterModal from '../TimeSegmentTitleUpdaterModal';

export default function SegmentListItem() {

    const {
        isProjectReadOnly
    } = useContext(ProjectContext);

    const {
        knowledgeBase,
        segmentDescriptions,
        setSegmentDescriptions,
        currentSegment,
        setCurrentSegment
    } = useContext(MainContext);

    const {
        notify
    } = useContext(ToastContext);

    const [isSegmentDeleting, setIsSegmentDeleting] = useState(false);
    const [hoveredSegment, setHoveredSegment] = useState(null);
    const [selectedSegment, setSelectedSegment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const handleMouseEnterSegment = (id) => {
        setHoveredSegment(id);
    };
    const handleMouseLeaveSegment = () => {
        setHoveredSegment(null);
    };

    function handleSelectResult(segment) {
        // const segmentSource = knowledgeBase.find(item => item.source_id === segment.source_id);

        // setCurrentSegment({
        //     ...segment,
        //     timestampText: `${segmentSource?.source_path} | ${segment.start}`,
        //     refs: segmentSource ? [{
        //         ...segmentSource,
        //         timestamp: segment.start
        //     }] : []
        // });
        setCurrentSegment(segment);
    }

    async function deleteSegment(segmentId) {
        try {
            setIsSegmentDeleting(true);
            const { success, message } = await makeApiRequest(`/segments/${segmentId}`, 'DELETE');

            if (success) {
                setSegmentDescriptions(prev => prev.filter(item => item.id !== segmentId));
                // SET CURRENT SEGMENT TO NULL IF IT'S THE ONE BEING DELETED
                if (currentSegment && currentSegment?.id === segmentId) {
                    setCurrentSegment(null);
                }
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
        <div className={`flex flex-col gap-1 bg-gray-200/20 rounded-md p-2 cursor-pointer hover:bg-gray-100`}>
            {
                segmentDescriptions.map(segment => {
                    const source = knowledgeBase.find(item => item.source_id === segment?.source_id);

                    return (
                        <div key={segment.id}
                            className={`flex items-center ${segment?.id === currentSegment?.id ? ' bg-gray-200' : '!border !border-transparent'} gap-2 hover:bg-textColor-100/25 cursor-pointer p-2 rounded-md select-none`}
                            onClick={() => handleSelectResult(segment)}
                            onMouseEnter={() => handleMouseEnterSegment(segment.id)}
                            onMouseLeave={handleMouseLeaveSegment}
                        >

                            {
                                !isProjectReadOnly && (
                                    hoveredSegment === segment.id && (<ActionMenu
                                        direction="right"
                                        actions={[
                                            {
                                                label: "Edit title",
                                                icon: <Pencil size={13} />,
                                                onClick: (e) => {
                                                    e.stopPropagation();
                                                    setSelectedSegment(segment);
                                                    setIsModalOpen(true);
                                                },
                                            },
                                            {
                                                label: isSegmentDeleting ? <AnimatedText text='Deleting...' cssClasses="!font-semibold !text-sm" /> : "Delete",
                                                icon: isSegmentDeleting ? <LoadingSpinner isSmall /> : <Trash size={13} />,
                                                onClick: () => deleteSegment(segment.id),
                                            },
                                        ]}
                                    />)
                                )
                            }

                            <div className="overflow-x-hidden">
                                {/* <BaseHeading text={`${segment.start}-${segment.end} ${segment.response_format?.schema?.talking_head?.length > 0 ? `• ${segment.response_format?.schema?.talking_head?.length} ${segment.response_format?.schema?.talking_head?.length === 1 ? 'person' : 'people'}` : (segment.response_format?.schema?.talking_head !== undefined && segment.response_format?.schema?.talking_head !== null) ? '• no people detected' : ''}`} className="text-xs !font-bold !italic !text-primary-300" /> */}
                                <BaseHeading text={`${segment.start}-${segment.end} • ${source?.source_path}`} className="text-xs !font-bold !italic !text-primary-300" />

                                <p className="block cursor-pointer text-[12.5px] font-semibold text-ink" key={segment.id}>{segment?.title}</p>
                            </div>
                        </div>
                    );
                })
            }

            {
                isModalOpen && (
                    <TimeSegmentTitleUpdaterModal show={isModalOpen} onHide={() => setIsModalOpen(false)} segment={selectedSegment} setSegmentDescriptions={setSegmentDescriptions} />
                )
            }
        </div>
    );
}