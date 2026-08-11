import React, { useContext, useEffect, useRef } from 'react';
import BaseHeading from '../BaseHeading';
import RippleButton from "../RippleButton";
import { MainContext } from '../../contexts/mainContext';
import { useToast } from "../../contexts/toastContext";
import { Skeleton } from '@mui/material';
import Chip from '../Chip';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';

const FindMomentsResult = ({ isPending, captionResults, currentMoment, setShowList, moments, saveMoment }) => {

    const {
        theme,
        contentPanelContainerRef,
    } = useContext(MainContext);
    const { notify } = useToast();


    const { handleSourceLinkClick } = useReferenceLinkClick(true, contentPanelContainerRef);

    const containerRef = useRef(null);

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
                            {!moments.some(item => item.id === currentMoment.id) && (
                                <RippleButton
                                    onClick={saveMoment}
                                    cssClasses="p-2 text-[8px]"
                                >
                                    Save
                                </RippleButton>
                            )}
                            <BaseHeading text="X" className="text-sm cursor-pointer" onClick={closeResultsTab} />
                        </div>
                    </div>

                    <div>
                        <BaseHeading text="Result" className="text-sm text-gradient-x mt-3 mb-1" />
                        {
                            currentMoment.results.map((segment, index) => (
                                <div key={index} className="mb-4">
                                    <p className={`text-sm/6 mb-2 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>{segment.context}</p>

                                    <Chip content={segment.timestampText} data-object={segment?.source} handleClick={(event) => handleSourceLinkClick(event, segment?.source)} cssClasses="ml-0 cursor-pointer " />
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