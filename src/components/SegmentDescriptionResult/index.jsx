import React, { useContext, useEffect, useRef } from 'react';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import BaseHeading from '../BaseHeading';
import RippleButton from "../RippleButton";
import { MainContext } from '../../contexts/mainContext';
import { useToast } from "../../contexts/toastContext";
import AnimatedText from '../AnimatedText';
import MetadataSkeleton from '../Skeletons/MetadataSkeleton';
import { Skeleton } from '@mui/material';
import Chip from '../Chip';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';

const SegmentDescriptionResult = ({ exportFn, isPending, results, setTimeSegmentDescriptions, setShowList }) => {

    const {
        theme,
        contentPanelContainerRef,
    } = useContext(MainContext);
    const { notify } = useToast();

    const { handleSourceLinkClick } = useReferenceLinkClick(true, contentPanelContainerRef);

    function closeResultsTab() {
        setShowList(true);
    }

    async function saveSegmentDescription() {
        // TODO: call save endpoint...

        setTimeSegmentDescriptions(prev => [...prev, results]);
        setShowList(true);
        console.log(results);
    }

    function copyToClipboard() {
        const textToCopy = `Segment: ${results.start} - ${results.end}\nDescription: ${results.description} \nReferences: ${results.refs && results.refs.length > 0 ? results.refs.map(ref => ref.displayText).join("\n") : "None"}`;
        navigator.clipboard.writeText(textToCopy)
            .then(() => {
                notify({
                    variant: "info",
                    heading: "Description copied to clipboard!"
                });
            })
            .catch(err => {
                notify({
                    variant: "error",
                    heading: "Failed to copy description to clipboard!",
                    subheading: err?.message || ""
                });
            });
    }

    return (
        <div>
            {isPending ? (
                <div className="flex flex-col gap-2">
                    <Skeleton width={'50%'} />
                    <div>
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                        <Skeleton />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton width={'20%'} height={40} />
                        <Skeleton width={'20%'} height={40} />
                    </div>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                            <AccessTimeOutlinedIcon className="text-purple-400" />
                            <BaseHeading text={`${results.start} - ${results.end}`} className="text-sm text-gradient-x" />
                        </div>
                        <BaseHeading text="close" className="text-sm cursor-pointer" onClick={closeResultsTab} />
                    </div>
                    <p className={`text-sm/6 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`} dangerouslySetInnerHTML={{ __html: results.description }} />

                    {results.refs && results.refs.length > 0 && (
                        <div className="mt-4">
                            <BaseHeading text="References" className="text-sm mb-2" />
                            <ul className="list-disc list-inside text-sm/6 text-textColor-300">
                                {results.refs.map((ref, index) => {
                                    return (
                                        <Chip key={index} content={ref.displayText} data-object={ref} onClick={(event) => handleSourceLinkClick(event, ref)} cssClasses="ml-0 cursor-pointer text-gradient-x" />
                                    );
                                })}
                            </ul>
                        </div>
                    )}

                    {/* action buttons */}
                    <div className="flex items-center gap-2 mt-4">
                        <RippleButton cssClasses="px-3 py-1 text-sm  rounded" onClick={exportFn}>Export</RippleButton>
                        <RippleButton cssClasses="px-3 py-1 text-sm  rounded" noBg onClick={saveSegmentDescription}>Save</RippleButton>
                    </div>
                </>
            )
            }
        </div>
    );
};

export default SegmentDescriptionResult;