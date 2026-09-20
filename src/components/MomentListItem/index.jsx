import { Clock, Pencil, Trash } from "lucide-react";
import { useContext, useState } from 'react';
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext';
import { ProjectContext } from '../../contexts/projectContext';
import { ToastContext } from '../../contexts/toastContext';
import { formatReadableDate, sortByDate } from '../../utils';
import ActionMenu from '../ActionMenu';
import AnimatedText from '../AnimatedText';
import BaseHeading from '../BaseHeading';
import LoadingSpinner from '../LoadingSpinner';
import MomentTitleUpdaterModal from "../MomentTitleUpdaterModal";


export default function MomentListItem() {

    const {
        isProjectReadOnly
    } = useContext(ProjectContext);

    const {
        moments,
        setMoments,
        currentMoment,
        setCurrentMoment
    } = useContext(MainContext);

    const {
        notify
    } = useContext(ToastContext);

    const [isMomentDeleting, setIsMomentDeleting] = useState(false);
    const [hoveredMoment, setHoveredMoment] = useState(null);
    const [selectedMoment, setSelectedMoment] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);


    const handleMouseEnterMoment = (id) => {
        setHoveredMoment(id);
    };
    const handleMouseLeaveMoment = () => {
        setHoveredMoment(null);
    };

    function handleSelectResult(moment) {
        setCurrentMoment(moment);
    }

    async function deleteMoment(momentId) {
        try {
            setIsMomentDeleting(true);
            const { success, message } = await makeApiRequest(`/moments/${momentId}`, 'DELETE');

            if (success) {
                setMoments(prev => prev.filter(item => item.id !== momentId));
                //SET CURRENT MOMENT TO NULL IF IT'S THE ONE BEING DELETED
                if (currentMoment && currentMoment?.id === momentId) {
                    setCurrentMoment(null);
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
            setIsMomentDeleting(false);
        }
    }

    return (
        <div className={`flex flex-col gap-1 bg-gray-200/20 rounded-md p-2 cursor-pointer hover:bg-gray-100`}>
            {
                sortByDate(moments, "created_at", "desc").map(moment => (
                    <div key={moment.id}
                        className={`flex items-center ${moment?.id === currentMoment?.id ? 'bg-gray-200' : '!border !border-transparent'} gap-2 hover:bg-textColor-100/25 cursor-pointer p-2 rounded-md select-none`}
                        onClick={() => handleSelectResult(moment)}
                        onMouseEnter={() => handleMouseEnterMoment(moment.id)}
                        onMouseLeave={handleMouseLeaveMoment}
                    >

                        {
                            !isProjectReadOnly && (
                                hoveredMoment === moment.id && (<ActionMenu
                                    direction="right"
                                    actions={[
                                        {
                                            label: "Edit title",
                                            icon: <Pencil size={13} />,
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                setSelectedMoment(moment);
                                                setIsModalOpen(true);
                                            },
                                        },
                                        {
                                            label: isMomentDeleting ? <AnimatedText text='Deleting...' cssClasses="!font-semibold !text-sm" /> : "Delete",
                                            icon: isMomentDeleting ? <LoadingSpinner isSmall /> : <Trash size={13} />,
                                            onClick: () => deleteMoment(moment.id),
                                        },
                                    ]}
                                />)
                            )
                        }

                        <div className="overflow-x-hidden">
                            {/* creation date */}
                            <div className="flex items-center gap-1">
                                <Clock size={13} className="text-primary-300" />
                                <BaseHeading text={`${formatReadableDate(moment.created_at)}`} className="text-xs !font-bold !italic !text-primary-300" />
                            </div>

                            <label className="block cursor-pointer text-[12.5px] font-semibold text-ink" key={moment.id}>{moment?.title}</label>
                        </div>
                    </div>
                ))
            }

            {
                isModalOpen && (
                    <MomentTitleUpdaterModal show={isModalOpen} onHide={() => setIsModalOpen(false)} moment={selectedMoment} setMoments={setMoments} />
                )
            }
        </div>
    );
}