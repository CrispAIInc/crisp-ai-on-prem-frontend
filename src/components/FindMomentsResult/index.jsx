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

const FindMomentsResult = ({ exportFn, isPending, prompt, refs }) => {

    const {
        theme,
        contentPanelContainerRef,
    } = useContext(MainContext);
    const { notify } = useToast();

    const { handleSourceLinkClick } = useReferenceLinkClick(true, contentPanelContainerRef);

    const containerRef = useRef(null);

    const isContentEmpty = !refs || refs.length === 0;

    // auto scroll down whenever description changes
    useEffect(() => {
        if (!isContentEmpty && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
        }
    }, [isContentEmpty]);

    function copyToClipboard() {
        const textToCopy = `Prompt: ${prompt} \nReferences: ${!isContentEmpty ? refs.map(ref => ref.displayText).join("\n") : "None"}`;
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
                    <p className={`text-sm/6 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>{prompt}</p>

                    {refs && refs.length > 0 && (
                        <div className="mt-4">
                            <BaseHeading text="References" className="text-sm mb-2" />
                            <ul className="list-disc list-inside text-sm/6 text-textColor-300">
                                {refs.map((ref, index) => {
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

export default FindMomentsResult;