import React, { useContext, useEffect, useRef, useState } from 'react';
import BaseHeading from '../BaseHeading';
import RippleButton from "../RippleButton";
import { MainContext } from '../../contexts/mainContext';
import { useToast } from "../../contexts/toastContext";
import { Skeleton } from '@mui/material';
import Chip from '../Chip';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';
import Modal from 'react-bootstrap/Modal';
import ScoreChip from '../ScoreChip';

const FindMomentsResult = ({ isPending, captionResults, currentMoment, setShowList, moments, saveMoment }) => {

    const {
        theme,
        contentPanelContainerRef,
    } = useContext(MainContext);
    const { notify } = useToast();


    const { handleSourceLinkClick } = useReferenceLinkClick(true, contentPanelContainerRef);

    const containerRef = useRef(null);
    const [showSaveTitleModal, setShowSaveTitleModal] = useState(false);
    const [momentTitle, setMomentTitle] = useState(currentMoment?.title || "");
    const [isSaving, setIsSaving] = useState(false);

    const isContentEmpty = !captionResults.refs || captionResults.refs.length === 0;

    // auto scroll down whenever description changes
    useEffect(() => {
        if (!isContentEmpty && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [isContentEmpty]);

    function copyToClipboard() {
        const textToCopy = `Prompt: \n${captionResults.prompt} \n\nReferences: ${!isContentEmpty ? '\n' + captionResults.refs.map(ref => ref.displayText).join("\n") : "None"}`;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                notify({
                    variant: "info",
                    heading: "References copied to clipboard!"
                });
            })
            .catch(err => {
                notify({
                    variant: "error",
                    heading: "Failed to copy References to clipboard!",
                    subheading: err?.message || ""
                });
            });
    }

    function closeResultsTab() {
        setShowList(true);
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
        <div>
            {isPending ? (
                <div className="flex flex-col gap-2">
                    <div>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                    </div>
                    <div>
                        <Skeleton width={'50%'} />
                        <Skeleton width={'50%'} />
                        <Skeleton width={'50%'} />
                        <Skeleton width={'50%'} />
                        <Skeleton width={'50%'} />
                        <Skeleton width={'50%'} />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton width={'20%'} height={40} />
                        <Skeleton width={'20%'} height={40} />
                    </div>
                </div>
            ) : (
                <>
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
                            <BaseHeading text="X" className="text-sm cursor-pointer" onClick={closeResultsTab} />
                        </div>
                    </div>

                    <Modal
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
                    </Modal>

                    <div>
                        <BaseHeading text="Result" className="text-sm text-gradient-x mt-3 mb-1" />
                        {
                            currentMoment.results.map((segment, index) => (
                                <div key={index} className="mb-4">
                                    <p className={`text-sm/6 mb-2 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>{segment.context}</p>

                                    <div className="flex items-center gap-2 flex-wrap">
                                        <Chip content={segment.timestampText} data-object={segment?.source} handleClick={(event) => handleSourceLinkClick(event, segment?.source)} cssClasses="ml-0 cursor-pointer " />
                                        {
                                            segment?.score !== undefined && (
                                                <ScoreChip score={segment.score * 100} />
                                            )
                                        }
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                    {/* {captionResults.refs && captionResults.refs.length > 0 && (
                        <div className="mt-2">
                            <BaseHeading text="References" className="text-sm mb-2 text-gradient-x" />
                            <div className="flex flex-col gap-1">
                                {captionResults.refs.map((ref, index) => {
                                    return (
                                        <Chip key={index} content={ref.displayText} data-object={ref} handleClick={(event) => handleSourceLinkClick(event, ref)} cssClasses="ml-0 cursor-pointer " />
                                    );
                                })}
                            </div>
                        </div>
                    )} */}

                    {/* action buttons */}
                    {/* <div className="flex items-center gap-2 mt-4">
                        <RippleButton cssClasses="px-3 py-1 text-sm  rounded" onClick={exportFn}>Export</RippleButton>
                        <RippleButton cssClasses="px-3 py-1 text-sm  rounded" noBg onClick={copyToClipboard}>Copy</RippleButton>
                    </div> */}
                </>
            )
            }
        </div>
    );
};

export default FindMomentsResult;