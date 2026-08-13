import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import { useContext, useState, useEffect } from 'react';
import { MainContext } from '../../contexts/mainContext';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';
import BaseHeading from '../BaseHeading';
import Chip from '../Chip';
import RippleButton from "../RippleButton";
import SaveSegmentModal from '../SaveSegmentModal';
import TalkingHeadPanel from '../TalkingHeadPanel';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';

const SegmentDescriptionResult = ({ exportFn, isPending, results, setTimeSegmentDescriptions, setSegmentDescriptions, setShowList, currentSegment, setCurrentSegment }) => {

    const {
        video,
        start,
        end,
        timestampText,
        query,
        response_format: { schema }
    } = currentSegment;

    const {
        theme,
        contentPanelContainerRef,
        knowledgeBase,
        displayedSources
    } = useContext(MainContext);

    const { handleSourceLinkClick } = useReferenceLinkClick(true, contentPanelContainerRef);

    let source = knowledgeBase.find(item => item.source_path === video) || {};

    function closeResultsTab() {
        setCurrentSegment(null);
        setShowList(true);
    }

    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const [isSaved, setIsSaved] = useState(Boolean(currentSegment && currentSegment.id));

    // reset/update saved flag when currentSegment changes
    useEffect(() => {
        setIsSaved(Boolean(currentSegment && currentSegment.id));
    }, [currentSegment]);

    function timeToSeconds(time) {
        const [h, m, s] = time.split(":").map(Number);
        return h * 3600 + m * 60 + s;
    }

    function exportSegmentAsJson(segment) {
        const { id, timestampText, refs, ...rest } = segment;
        const safeFileName = `segment-${(segment.video || 'segment').replace(/[^a-zA-Z0-9-_]/g, '_')}-${segment.start || '0'}-${segment.end || '0'}.json`;
        const jsonData = JSON.stringify(rest, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = safeFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    return (
        <div className="flex flex-col gap-3">

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
                talkingHeads={schema?.talking_head}
                source={source}
            />

            {/* Onscreen Text */}
            {schema?.onscreen_text?.detected && (
                <div>
                    <BaseHeading text="Detected On-screen Text" className="mb-2" />

                    <div className="rounded-lg text-sm flex gap-1 flex-wrap">
                        {schema.onscreen_text?.text_content?.map((text) => (
                            // <div
                            //     key={text}
                            //     className="inline-block mr-2 mb-2 px-3 py-1 rounded bg-emerald-500/20 text-emerald-500"
                            // >
                            <Chip key={text} content={text.trim()} cssClasses="w-fit" />

                            // {/* </div> */ }
                        ))}
                    </div>
                </div>
            )}

            {/* refs */}
            {source && source.length > 0 && (
                <div>
                    <BaseHeading text="References" className="font-bold text-sm mb-2" />
                    <ul className="list-disc list-inside text-sm/6 text-textColor-300">
                        {source.map((ref, index) => {
                            return (
                                <Chip key={index} content={timestampText} data-object={ref} handleClick={(event) => handleSourceLinkClick(event, ref)} cssClasses="ml-0 cursor-pointer text-gradient-x" />
                            );
                        })}
                    </ul>
                </div>
            )}

            {/* action buttons */}
            <div className="flex items-center gap-2 relative">
                <div className="relative inline-block">
                    <RippleButton
                        cssClasses="px-2 flex items-center gap-1 py-1 text-sm rounded"
                        onClick={() => setExportMenuOpen((prev) => !prev)}
                    >
                        Export as
                        <UnfoldMoreIcon />
                    </RippleButton>

                    {exportMenuOpen && (
                        <div className={`absolute left-0 bottom-0 mt-2 min-w-[180px] rounded-lg border-textColor-300/20 shadow-xl z-10 mb-5 ${theme === "dark" ? 'bg-background_workspace text-textColor-100' : 'bg-white shadow-md border border-textColor-300'}`}>
                            <button
                                type="button"
                                className={`w-full text-left px-3 py-2 text-sm ${theme === "light" ? "hover:bg-gray-300/50" : "hover:bg-gray-700/20"}`}
                                onClick={() => {
                                    exportFn(currentSegment);
                                    setExportMenuOpen(false);
                                }}
                            >
                                DOCX format
                            </button>
                            <button
                                type="button"
                                className={`w-full text-left px-3 py-2 text-sm ${theme === "light" ? "hover:bg-gray-300/50" : "hover:bg-gray-700/20"}`}
                                onClick={() => {
                                    exportSegmentAsJson(currentSegment);
                                    setExportMenuOpen(false);
                                }}
                            >
                                JSON format
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div>
                {!isSaved && (
                    <RippleButton disabled={displayedSources.filter(item => item.is_checked).length !== 1} cssClasses="px-2 flex items-center gap-1 py-1 text-sm rounded" onClick={() => setIsSaveModalOpen(true)}>
                        Save
                    </RippleButton>
                )}
            </div>
            {isSaveModalOpen && (
                <SaveSegmentModal
                    show={isSaveModalOpen}
                    onHide={() => setIsSaveModalOpen(false)}
                    segment={currentSegment}
                    setSegmentDescriptions={setSegmentDescriptions}
                    onSaved={(id) => setIsSaved(true)}
                />
            )}
        </div>
    );
};

export default SegmentDescriptionResult;