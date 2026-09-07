import { Clock, Info, Layers, Pencil, Trash } from "lucide-react";
import { useContext, useEffect, useRef, useState } from 'react';
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext';
import { ProjectContext } from '../../contexts/projectContext';
import { ToastContext, useToast } from '../../contexts/toastContext';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';
import { formatReadableDate, sortByDate } from '../../utils';
import ActionMenu from '../ActionMenu';
import AnimatedText from '../AnimatedText';
import BaseHeading from '../BaseHeading';
import Chip from '../Chip';
import EmptyState from '../EmptyState';
import LoadingSpinner from '../LoadingSpinner';
import MomentTitleUpdaterModal from "../MomentTitleUpdaterModal";
import RippleButton from '../RippleButton';
import ScoreChip from '../ScoreChip';

function FindMomentsList() {

    const {
        segmentDescriptions,
        currentMoment,
        setCurrentMoment
    } = useContext(MainContext);

    return (
        <div className={`h-full min-h-0 flex overflow-hidden`}>
            {/* Left column — list */}
            <div className="w-[280px] shrink-0 border-r border-border h-full min-h-0 overflow-y-auto p-3 flex flex-col gap-2">
                {segmentDescriptions.length === 0 ? (
                    <EmptyState
                        icon={<Info size={20} />}
                        title="No moments found"
                        description="Use left panel to start generating moments."
                    />
                ) : (
                    <MomentListItem />
                )}
            </div>

            {/* Right column — selected segment */}
            <div className="flex-1 min-w-0 h-full min-h-0 overflow-y-auto">
                {currentMoment === null ? (
                    <EmptyState
                        twClasses='flex-1 h-full'
                        icon={<Layers size={20} />}
                        title="Select a moment"
                        description="Pick a moment from the list to see its details."
                    />
                ) : (
                    <div className="p-4 flex flex-col gap-4">
                        <MomentDetails />
                    </div>
                )}
            </div>
        </div>
    );
}

function MomentListItem() {

    const {
        isProjectReadOnly
    } = useContext(ProjectContext);

    const {
        knowledgeBase,
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
        // const finalResults = moment.results.map((moment) => {
        //     const source = knowledgeBase.find(item => item.source_id === moment.source_id);

        //     if (!source) return null;

        //     return {
        //         ...moment,
        //         timestampText: `${source.source_path} | ${moment.timestamp}`,
        //         source: {
        //             ...source,
        //             timestamp: moment.timestamp
        //         }
        //     };
        // }).filter(Boolean);

        console.log(moment);

        setCurrentMoment(moment);
    }

    async function deleteMoment(momentId) {
        try {
            setIsMomentDeleting(true);
            const { success, message } = await makeApiRequest(`/moments/${momentId}`, 'DELETE');

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

function MomentDetails() {

    const {
        theme,
        currentMoment,
        setCurrentMoment,
        setMoments
    } = useContext(MainContext);
    const { notify } = useToast();


    const { handleSourceLinkClick } = useReferenceLinkClick(true);

    const containerRef = useRef(null);
    const [showSaveTitleModal, setShowSaveTitleModal] = useState(false);
    const [momentTitle, setMomentTitle] = useState(currentMoment?.title || "");
    const [isSaving, setIsSaving] = useState(false);

    const isContentEmpty = !currentMoment.refs || currentMoment.refs.length === 0;

    // auto scroll down whenever description changes
    useEffect(() => {
        if (!isContentEmpty && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [isContentEmpty]);

    async function saveMoment(moment) {
        const momentWithoutSource = {
            ...moment,
            results: moment.results.map(item => {
                const { source, ...rest } = item;

                return rest;
            })
        };

        try {
            const { success, message, id } = await makeApiRequest('/moments/save', 'POST', JSON.stringify({ momentWithoutSource }));

            if (!success) {
                throw new Error(message);
            }

            setMoments(prev => {
                return [
                    {
                        id,
                        ...moment,
                    },
                    ...prev,
                ];
            });
            setCurrentMoment({
                id,
                ...moment,
            });
            notify({
                variant: "success",
                heading: "Moment saved successfully"
            });
        } catch (error) {
            notify({
                variant: "error",
                heading: "Couldn't save moment",
                subheading: error?.message || ""
            });
        }
    }

    async function handleSaveMoment() {
        if (!momentTitle.trim() || isSaving) return;

        setIsSaving(true);
        try {
            await saveMoment({
                ...currentMoment,
                title: momentTitle.trim(),
            });
            setShowSaveTitleModal(false);
        } finally {
            setIsSaving(false);
        }
    }


    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <BaseHeading text="Prompt" className="text-sm text-gradient-x" />
                    <p className={`text-sm/6 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>{currentMoment.prompt}</p>
                </div>
                <div className="flex items-center gap-3">
                    {!('id' in currentMoment) && (
                        <RippleButton
                            onClick={() => {
                                setMomentTitle(currentMoment?.title || "");
                                setShowSaveTitleModal(true);
                            }}
                            cssClasses="p-2 text-[8px]"
                        >
                            Save
                        </RippleButton>
                    )}
                </div>
            </div>

            {/* <Modal
                show={showSaveTitleModal}
                onHide={() => setShowSaveTitleModal(false)}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                scrollable={true}
                centered
                dialogClassName='text-left'
            >
                <Modal.Header className={`border-0 pb-0 ${theme === 'dark' ? '!bg-textColor-300 !text-white' : ''}`}>
                    <div className="flex flex-col gap-1">
                        <Modal.Title id="contained-modal-title-vcenter" className={`text-lg font-semibold ${theme === 'dark' ? 'text-textColor-100' : 'text-gray-900'}`}>
                            Save moment
                        </Modal.Title>
                        <p className={`text-sm m-0 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                            Enter a title for this moment before saving.
                        </p>
                    </div>
                </Modal.Header>
                <Modal.Body className={`${theme === 'dark' ? 'bg-textColor-300 text-white' : ''}`}>
                    <div className='flex flex-col items-start justify-center gap-3'>
                        <div className="flex flex-col w-full">
                            <label htmlFor="saveMomentTitle" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                                Moment title
                            </label>
                            <input
                                type="text"
                                name="saveMomentTitle"
                                placeholder='Enter a title for the moment'
                                id='saveMomentTitle'
                                value={momentTitle}
                                onChange={(e) => setMomentTitle(e.target.value)}
                                className={`flex-1 block w-full p-2 mt-1 rounded-xl outline-none transition ${theme === 'dark'
                                    ? '!border !border-textColor-200 bg-textColor-300 text-white placeholder:text-gray-400'
                                    : '!border !border-gray-300 bg-white text-gray-900'}`}
                                required
                                onKeyDown={(e) => e.key === 'Enter' && handleSaveMoment()}
                            />
                        </div>
                    </div>
                </Modal.Body>
                <Modal.Footer className={`flex items-center justify-end gap-3 ${theme === 'dark' ? '!bg-textColor-300 !text-white !border-t !border-t-textColor-200' : ''}`}>
                    <button
                        type="button"
                        className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                        onClick={() => setShowSaveTitleModal(false)}
                    >
                        <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                            Cancel
                        </span>
                    </button>
                    <button
                        type="button"
                        className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${!momentTitle.trim() || isSaving
                            ? 'cursor-not-allowed text-gray-400'
                            : theme === 'dark'
                                ? 'hover:bg-purple-500/20 text-purple-300'
                                : 'hover:bg-purple-50 text-purple-600'}`}
                        onClick={handleSaveMoment}
                        disabled={!momentTitle.trim() || isSaving}
                    >
                        <span className={`select-none font-medium`}>
                            {isSaving ? 'Saving...' : 'Save moment'}
                        </span>
                    </button>
                </Modal.Footer>
            </Modal> */}

            <div>
                <BaseHeading text="Result" className="text-sm text-gradient-x mt-3 mb-1" />
                {
                    currentMoment?.results.map((moment, index) => (
                        <div key={index} className="mb-4">
                            <p className={`text-sm/6 mb-2 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>{moment.context}</p>

                            <div className="flex items-center gap-2 flex-wrap">
                                <Chip content={moment.timestampText} data-object={moment?.source} handleClick={(event) => handleSourceLinkClick(event, moment?.source)} cssClasses="ml-0 cursor-pointer " />
                                {
                                    moment?.score !== undefined && (
                                        <ScoreChip score={moment.score * 100} />
                                    )
                                }
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    );
}

export default FindMomentsList;