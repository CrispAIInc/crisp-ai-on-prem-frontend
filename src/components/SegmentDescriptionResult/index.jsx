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

const SegmentDescriptionResult = ({ exportFn, isPending, results }) => {

    const {
        theme,
        contentPanelContainerRef,
    } = useContext(MainContext);
    const { notify } = useToast();

    const { handleSourceLinkClick } = useReferenceLinkClick(true, contentPanelContainerRef);

    const containerRef = useRef(null);

    const isContentEmpty = !results.description || results.description.trim() === "";

    // auto scroll down whenever description changes
    useEffect(() => {
        if (!isContentEmpty && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [results.description, isContentEmpty]);

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
        <div ref={containerRef} className={`relative overflow-y-auto shadow-xl ${theme === "light" ? '!border !border-textColor-100/40' : '!border !border-textColor-200/40'} mt-4 w-full p-2 rounded-md h-full bg-[radial-gradient(circle_at_20%_20%,rgba(171,95,199,0.10),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(119,83,237,0.08),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.06),transparent_50%)]
  backdrop-blur-sm`}>
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
            ) : isContentEmpty ? (
                <></>
            ) : (
                <>
                    <div className="flex items-center gap-2">
                        <AccessTimeOutlinedIcon className="text-purple-400" />
                        <BaseHeading text={`${results.start} - ${results.end}`} className="text-sm text-gradient-x" />
                    </div>
                    <p className={`text-sm/6 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>{results.description}</p>

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
                        <RippleButton cssClasses="px-3 py-1 text-sm  rounded" noBg onClick={copyToClipboard}>Copy</RippleButton>
                    </div>
                </>
            )
            }
        </div>
    );
};

export default SegmentDescriptionResult;