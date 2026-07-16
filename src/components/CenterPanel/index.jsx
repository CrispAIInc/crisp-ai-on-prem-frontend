import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { useContext, useEffect, useRef, useState } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { MainContext } from "../../contexts/mainContext.jsx";
import { generateRandomHash, isRtlLanguage } from '../../utils.js';
import Accordion from '../Accordion/index.jsx';
import RippleButton from '../RippleButton/index.jsx';
import TextSkeleton from '../Skeletons/Base/TextSkeleton.jsx';
import MetadataPanel from '../MetadataPanel/index.jsx';
import { useResizableSidebar } from '../../hooks/useResizableSidebar.js';
import BaseHeading from '../BaseHeading/index.jsx';
import CloseIcon from '@mui/icons-material/Close';

const CenterPanel = ({ messages, combinedSummary, setCombinedSummary, isCombinedSummaryPending, selectedLanguage }) => {
    const {
        currentResource,
        displayedSources,
        activeView,
        selectedNote,
        theme,
        setShowEditor,
        notes,
        setIsNewNote,
        setNoteIndex,
        setSelectedNote,
        setIsManualNote,
        setShowNoteDetails,
        getCombinedSum,
        showMetadata,
        setShowMetadata,
        workspaceContainer,
    } = useContext(MainContext);

    const { sidebarWidth: leftWidth, maxWidth } = useResizableSidebar(200, true);

    const [selectedSources, setSelectedSources] = useState(0);

    function refreshSummary() {
        setSelectedSources(displayedSources?.filter(item => (item?.is_checked && !('progress' in item)))?.length);
        if ((displayedSources?.every(item => !('progress' in item))) || (displayedSources?.every(item => !('progress' in item)) && activeView === "resource")) {
            getCombinedSum();
        } else {
            setCombinedSummary(currentResource?.metadata?.summary?.content || "");
        }
    }


    useEffect(() => {
        refreshSummary();
    }, []);

    const addToInsight = async (textToAdd, file, question = '', models = "", refs = { pdfLinks: [], videoLinks: [], imageLinks: [] }) => {
        const newText = {
            id: generateRandomHash(5),
            model: models,
            question,
            answer: textToAdd,
            refs,
        };
        const newNote = {
            ...selectedNote,
            note_name: `new title ${Math.floor(Math.random() * 100)}`,
            text: [{
                ...newText
            }]
        };
        setIsNewNote(true);
        setShowEditor(true);
        setNoteIndex(notes.length);
        setSelectedNote(newNote);
        setIsManualNote(false);
        setShowNoteDetails(true);
        // setActiveView('note');
    };

    const textDirection = isRtlLanguage(selectedLanguage) ? "rtl" : "ltr";

    function closeMetadataPanel() {
        setShowMetadata(false);
    }

    const centerPanelRef = useRef(null);

    return (
        <div
            id="combined_summary"
            className="relative flex flex-col max-w-4xl pt-10 mx-auto"
            ref={centerPanelRef}
        >

            {showMetadata && (
                <div className="w-full max-w-full">
                    <div className="flex items-center justify-between gap-3 mb-3">
                        <BaseHeading text={`Source: ${currentResource.source_path}`} className="truncate" />
                        <div className="justify-end w-fit flex items-center cursor-pointer " onClick={closeMetadataPanel} >
                            <CloseIcon className={`text-[10px] ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} />
                            <BaseHeading text="Close metadata" />
                        </div>
                    </div>
                    <MetadataPanel
                        leftWidth={leftWidth}
                        maxWidth={maxWidth}
                        workspaceContainer={workspaceContainer}
                        centerPanelRef={centerPanelRef}
                    />

                </div>
            )}

            {
                (activeView === 'resource' && displayedSources.length > 0) && (


                    <Accordion isFirstOpen={Boolean(messages.length === 0)} chosenLanguage={"en"} heading={`Sources Summary ${selectedSources > 0 ? `(${selectedSources} Source${selectedSources > 1 ? "s" : ""})` : ""}`} >

                        <div className="flex-1">
                            <div className={`${theme === "light"
                                ? "text-textColor-300"
                                : "text-textColor-100"
                                }`}>
                            </div>

                            {/* refresh summary */}
                            <RippleButton cssClasses="flex items-center gap-2 mb-3 py-2 pl-2 !pr-3" onClick={() => refreshSummary()}>
                                {isCombinedSummaryPending ? <span className="loader-atom"></span> :
                                    <RefreshOutlinedIcon />}
                                <span>Refresh summary</span>
                            </RippleButton>


                            {!isCombinedSummaryPending ? <div>
                                <p
                                    className={`text-sm leading-7 ${theme === "light"
                                        ? "text-textColor-300"
                                        : "text-textColor-100"
                                        }`}
                                    dir={textDirection}
                                    dangerouslySetInnerHTML={{ __html: `<p>${combinedSummary !== "" ? combinedSummary?.replace(/\n/gi, '<br />') : (currentResource?.metadata?.summary?.content !== undefined) ? currentResource?.metadata?.summary?.content : ""}</p>` }}
                                ></p>
                                {
                                    (combinedSummary === "" && currentResource?.metadata?.summary?.content === undefined && displayedSources.length > 0) &&
                                    <div className="flex items-center gap-2 mt-3">
                                        <WarningAmberOutlinedIcon style={{ color: theme === 'light' ? '#FBBF24' : '#F59E0B' }} />
                                        <span className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Summary not available.</span>
                                    </div>
                                }
                                {/* {
                                    combinedSummary !== "" && (
                                        <RippleButton
                                    cssClasses={`mt-3 flex items-center justify-center py-1 pl-1 !pr-4`}
                                    onClick={() => addToInsight(combinedSummary !== "" ? combinedSummary?.replace(/\n/gi, '<br />') : currentResource?.metadata?.summary?.content)}
                                >
                                    <AddIcon />
                                    <span className={`!text-[12px]`}>Add to insight</span>
                                        </RippleButton>
                                        )
                                } */}
                            </div> : (
                                <div className="animate-pulse">
                                    {new Array(10).fill(null).map((_, index) => (
                                        <TextSkeleton key={index} className='h-3 mb-2' />
                                    ))}
                                </div>
                            )}
                        </div>
                    </Accordion>
                )
            }


        </div>
    );
};
export default CenterPanel;
