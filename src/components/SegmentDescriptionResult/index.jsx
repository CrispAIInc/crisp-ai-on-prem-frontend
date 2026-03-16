// import React, { useContext, useEffect, useRef } from 'react';
// import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
// import BaseHeading from '../BaseHeading';
// import RippleButton from "../RippleButton";
// import { MainContext } from '../../contexts/mainContext';
// import { useToast } from "../../contexts/toastContext";
// import AnimatedText from '../AnimatedText';
// import MetadataSkeleton from '../Skeletons/MetadataSkeleton';
// import { Skeleton } from '@mui/material';
// import Chip from '../Chip';
// import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';

// const SegmentDescriptionResult = ({ exportFn, isPending, results, setTimeSegmentDescriptions, setShowList, currentSegment, setCurrentSegment }) => {

//     const {
//         theme,
//         contentPanelContainerRef,
//     } = useContext(MainContext);
//     const { notify } = useToast();

//     const { handleSourceLinkClick } = useReferenceLinkClick(true, contentPanelContainerRef);

//     function closeResultsTab() {
//         setCurrentSegment(null);
//         setShowList(true);
//     }

//     async function saveSegmentDescription() {
//         // TODO: call save endpoint...

//         setTimeSegmentDescriptions(prev => [...prev, results]);
//         setShowList(true);
//         console.log(results);
//     }

//     function copyToClipboard() {
//         const textToCopy = `Segment: ${results.start} - ${results.end}\nDescription: ${results.description} \nReferences: ${results.refs && results.refs.length > 0 ? results.refs.map(ref => ref.displayText).join("\n") : "None"}`;
//         navigator.clipboard.writeText(textToCopy)
//             .then(() => {
//                 notify({
//                     variant: "info",
//                     heading: "Description copied to clipboard!"
//                 });
//             })
//             .catch(err => {
//                 notify({
//                     variant: "error",
//                     heading: "Failed to copy description to clipboard!",
//                     subheading: err?.message || ""
//                 });
//             });
//     }

//     return (
//         <div>
//             {isPending ? (
//                 <div className="flex flex-col gap-2">
//                     <Skeleton width={'50%'} />
//                     <div>
//                         <Skeleton />
//                         <Skeleton />
//                         <Skeleton />
//                         <Skeleton />
//                         <Skeleton />
//                         <Skeleton />
//                     </div>
//                     <div className="flex items-center gap-2">
//                         <Skeleton width={'20%'} height={40} />
//                         <Skeleton width={'20%'} height={40} />
//                     </div>
//                 </div>
//             ) : (
//                 <div className="flex flex-col gap-3">
//                     <div className="flex items-center justify-between gap-2 ">
//                         <div className="flex items-center gap-2">
//                             <AccessTimeOutlinedIcon className="text-purple-400" />
//                             <BaseHeading text={`${currentSegment.start} - ${currentSegment.end}`} className="text-sm text-gradient-x" />
//                         </div>
//                         <BaseHeading text="close" className="text-sm cursor-pointer" onClick={closeResultsTab} />
//                     </div>

//                     <div className="flex flex-col ">
//                         <BaseHeading text="Prompt" className="font-bold text-sm" />
//                         <p className={`text-sm/6 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`}>{currentSegment.prompt}</p>
//                     </div>

//                     {/* <hr className="p-0 m-0 space-x-0" /> */}

//                     <div className="flex flex-col ">
//                         <BaseHeading text="Description" className="font-bold text-sm" />
// <p className={`text-sm/6 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`} dangerouslySetInnerHTML={{ __html: currentSegment.description }} />
//                     </div>

//                     {/* <hr className="p-0 m-0 space-x-0" /> */}

//                     {currentSegment.refs && currentSegment.refs.length > 0 && (
//                         <div className="">
//                             <BaseHeading text="References" className="font-bold text-sm mb-2" />
//                             <ul className="list-disc list-inside text-sm/6 text-textColor-300">
//                                 {currentSegment.refs.map((ref, index) => {
//                                     return (
//                                         <Chip key={index} content={currentSegment.timestampText} data-object={ref} onClick={(event) => handleSourceLinkClick(event, ref)} cssClasses="ml-0 cursor-pointer text-gradient-x" />
//                                     );
//                                 })}
//                             </ul>
//                         </div>
//                     )}

//                     {/* action buttons */}
//                     <div className="flex items-center gap-2">
//                         <RippleButton cssClasses="px-3 py-1 text-sm  rounded" onClick={exportFn}>Export</RippleButton>
//                         <RippleButton cssClasses="px-3 py-1 text-sm  rounded" noBg onClick={saveSegmentDescription}>Save</RippleButton>
//                     </div>
//                 </div>
//             )
//             }
//         </div>
//     );
// };

// export default SegmentDescriptionResult;


import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';
import BaseHeading from '../BaseHeading';
import Chip from '../Chip';
import RippleButton from "../RippleButton";
import TalkingHeadPanel from '../TalkingHeadPanel';

const SegmentDescriptionResult = ({ exportFn, isPending, results, setTimeSegmentDescriptions, setShowList, currentSegment, setCurrentSegment }) => {

    const {
        video,
        start,
        end,
        refs,
        timestampText,
        query,
        response_format: { schema }
    } = currentSegment;

    const {
        theme,
        contentPanelContainerRef,
        knowledgeBase,
    } = useContext(MainContext);

    const { handleSourceLinkClick } = useReferenceLinkClick(true, contentPanelContainerRef);

    function closeResultsTab() {
        setCurrentSegment(null);
        setShowList(true);
    }

    function orderTalkingHeadByTimestamp(talkingHead) {
        const segments = [];

        talkingHead.forEach(character => {
            if (!character.text_content) return;

            const lines = character.text_content
                .split("\n")
                .map(l => l.trim())
                .filter(Boolean);

            lines.forEach(line => {
                const match = line.match(/\[(.*?)\]\s*(.*)/);

                if (!match) return;

                const timeRange = match[1];
                const text = match[2];

                const [start] = timeRange.split("-");

                segments.push({
                    character_name: character.character_name,
                    detected: character.detected,
                    talking: character.talking,
                    text_content: `[${timeRange}] ${text}`,
                    startSeconds: timeToSeconds(start)
                });
            });
        });

        segments.sort((a, b) => a.startSeconds - b.startSeconds);

        return segments.map(({ startSeconds, ...rest }) => rest);
    }

    function timeToSeconds(time) {
        const [h, m, s] = time.split(":").map(Number);
        return h * 3600 + m * 60 + s;
    }

    return (
        <div className="flex flex-col gap-4">

            {/* header */}
            <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                    <BaseHeading text="Scene analysis" className="text-md" />
                    <BaseHeading text="close" className="text-sm cursor-pointer" onClick={closeResultsTab} />
                </div>

                <div className={`flex items-center gap-1 ${theme === 'light' ? 'text-textColor-200' : 'text-[#ABAEB4]'}`}>
                    <PlayCircleOutlineOutlinedIcon />
                    <p className={`text-sm/6 font-semibold`}>{video}</p>
                </div>

                <div className={`flex items-center gap-1 ${theme === 'light' ? 'text-textColor-200' : 'text-[#ABAEB4]'}`}>
                    <AccessTimeOutlinedIcon />
                    <p className={`text-sm/6 font-semibold`}>{start} - {end}</p>
                </div>
            </div>

            {/* query prompt */}
            <div>
                <BaseHeading text="Prompt" />
                <p className={`text-sm/6 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`} dangerouslySetInnerHTML={{ __html: query }} />
            </div>

            {/* Tags */}
            <div className="grid grid-cols-2 gap-6">

                <div>
                    <BaseHeading text="Mood" className="mb-2" />
                    <div className="flex flex-wrap gap-2">
                        {schema.mood.map((m) => (
                            <span
                                key={m}
                                className="px-3 py-1 text-sm bg-blue-500/20 text-blue-500 rounded-full"
                            >
                                {m}
                            </span>
                        ))}
                    </div>
                </div>

                <div>
                    <BaseHeading text="Shot Type" className="mb-2" />
                    <div className="flex flex-wrap gap-2">
                        {schema.shot_type.map((s) => (
                            <span
                                key={s}
                                className="px-3 py-1 text-sm bg-purple-500/20 text-purple-500 rounded-full"
                            >
                                {s}
                            </span>
                        ))}
                    </div>
                </div>

            </div>

            {/* Scene Description */}
            <div>
                <BaseHeading text="generated response" className="mb-1" />
                <p className={`text-sm/6 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"}`} dangerouslySetInnerHTML={{ __html: schema.action_description.replace(/\r?\n/g, '<br />') }} />
            </div>

            <TalkingHeadPanel
                talkingHeads={orderTalkingHeadByTimestamp(schema.talking_head)}
                source={refs[0] || knowledgeBase.find(item => item.source_path === video) || {}}
            />

            {/* Onscreen Text */}
            {schema.onscreen_text.detected && (
                <div>
                    <BaseHeading text="Detected On-screen Text" className="mb-2" />

                    <div className="rounded-lg text-sm">
                        {schema.onscreen_text.text_content
                            .split(",")
                            .map((text) => (
                                <div
                                    key={text}
                                    className="inline-block mr-2 mb-2 px-3 py-1 rounded bg-emerald-500/20 text-emerald-500"
                                >
                                    {text.trim()}
                                </div>
                            ))}
                    </div>
                </div>
            )}

            {/* refs */}
            {refs && refs.length > 0 && (
                <div className="">
                    <BaseHeading text="References" className="font-bold text-sm mb-2" />
                    <ul className="list-disc list-inside text-sm/6 text-textColor-300">
                        {refs.map((ref, index) => {
                            return (
                                <Chip key={index} content={timestampText} data-object={ref} onClick={(event) => handleSourceLinkClick(event, ref)} cssClasses="ml-0 cursor-pointer text-gradient-x" />
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* action buttons */}
            <div className="flex items-center gap-2">
                <RippleButton cssClasses="px-3 py-1 text-sm  rounded" onClick={() => exportFn(currentSegment)}>Export</RippleButton>
                {/* <RippleButton cssClasses="px-3 py-1 text-sm  rounded" noBg onClick={saveSegmentDescription}>Save</RippleButton> */}
            </div>
        </div>
    );
};

export default SegmentDescriptionResult;