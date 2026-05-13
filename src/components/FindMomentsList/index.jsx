import React, { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';
import { ProjectContext } from '../../contexts/projectContext';
import { ToastContext } from '../../contexts/toastContext';
import makeApiRequest from '../../api';
import LoadingSpinner from '../LoadingSpinner';
import DeleteIcon from "@mui/icons-material/Delete";
import ActionMenu from '../ActionMenu';
import AnimatedText from '../AnimatedText';
import MomentTitleUpdaterModal from "../MomentTitleUpdaterModal";
import { sortByDate } from '../../utils';

import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

function FindMomentsList({ setCurrentMoment, setShowList, moments, setMoments }) {

    const {
        isProjectReadOnly
    } = useContext(ProjectContext);

    const {
        notify
    } = useContext(ToastContext);

    const {
        theme,
        knowledgeBase
    } = useContext(MainContext);

    function handleSelectResult(item) {
        const fullShapeResult = item.results.map(result => {
            let source = knowledgeBase.find(item => item.source_id === result.source_id);

            return {
                ...result,
                timestampText: `${result.video} | ${result.timestamp}`,
                source: {
                    ...source,
                    timestamp: source ? result.timestamp : null,
                },
            };
        });
        setCurrentMoment({
            ...item,
            results: fullShapeResult
        });
        setShowList(false);
    }

    const [selectedMoment, setSelectedMoment] = useState(null);
    const [isSegmentDeleting, setIsSegmentDeleting] = useState(false);

    const [hoveredSegment, setHoveredSegment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleMouseEnterSegment = (id) => {
        setHoveredSegment(id);
    };
    const handleMouseLeaveSegment = () => {
        setHoveredSegment(null);
    };

    async function deleteSegment(momentId) {
        try {
            setIsSegmentDeleting(true);
            const { success, message } = await makeApiRequest(`/moment/${momentId}`, 'DELETE');

            if (success) {
                setMoments(prev => prev.filter(item => item.id !== momentId));
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
        <>
            <div className="flex flex-col gap-2 overflow-y-auto h-full">
                <BaseHeading text="All moments" />
                <div className='flex flex-col gap-1'>
                    {
                        sortByDate(moments, "created_at", "desc").map(item => (
                            <div key={item.id}
                                className={`flex items-center gap-2 ${theme === 'light'
                                    ? 'hover:bg-textColor-100/10'
                                    : 'hover:bg-light-hover-200/20'
                                    } cursor-pointer p-2 rounded-md select-none`}
                                onClick={() => handleSelectResult(item)}
                                onMouseEnter={() => handleMouseEnterSegment(item.id)}
                                onMouseLeave={handleMouseLeaveSegment}
                            >

                                {
                                    !isProjectReadOnly && (
                                        <ActionMenu
                                            actions={[
                                                {
                                                    label: "Edit title",
                                                    icon: <EditOutlinedIcon />,
                                                    onClick: (e) => {
                                                        e.stopPropagation();
                                                        setSelectedMoment(item);
                                                        setIsModalOpen(true);
                                                    },
                                                },
                                                {
                                                    label: isSegmentDeleting ? <AnimatedText text='Deleting...' cssClasses="!font-semibold !text-sm" /> : "Delete",
                                                    icon: isSegmentDeleting ? <LoadingSpinner isSmall /> : <DeleteIcon />,
                                                    onClick: () => deleteSegment(item.id),
                                                },
                                            ]}
                                        />
                                    )
                                }

                                <p onClick={() => handleSelectResult(item)} key={item.id} className={`${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} cursor-pointer w-fit hover:font-medium truncate`}>{item.title}</p>
                            </div>
                        ))
                    }
                </div>
            </div>

            {
                isModalOpen && (
                    <MomentTitleUpdaterModal show={isModalOpen} onHide={() => setIsModalOpen(false)} moment={selectedMoment} setMoments={setMoments} />
                )
            }
        </>
    );
}

export default FindMomentsList;