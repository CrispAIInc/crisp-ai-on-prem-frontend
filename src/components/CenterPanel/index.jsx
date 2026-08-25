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
        setCurrentResource
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
        setCurrentResource(null);
    }

    const centerPanelRef = useRef(null);

    return (
        <div
            id="combined_summary"
            className="relative flex flex-col max-w-4xl pt-3 mx-auto"
            ref={centerPanelRef}
        >

            {showMetadata && (
                <div className="w-full max-w-full">
                    <div className="flex items-center justify-between gap-3 mb-3">
                        {/* <BaseHeading text={`Source: ${currentResource.source_path}`} className="truncate" /> */}
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
        </div>
    );
};
export default CenterPanel;
