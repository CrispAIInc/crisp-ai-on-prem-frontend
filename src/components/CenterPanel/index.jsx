import { useContext, useRef, useState, useEffect } from "react";
import CopilotSection from "../CopilotSection";
import { MainContext } from "../../contexts/mainContext.js";
import makeApiRequest from "../../api/index.js";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useResizableSidebar } from '../../hooks/useResizableSidebar.js';
import TextSkeleton from '../Skeletons/Base/TextSkeleton.jsx';
import AddIcon from '@mui/icons-material/Add';
import { generateRandomHash } from '../../utils.js';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';

const MetadataPanel = ({ workspaceContainer }) => {
    const {
        currentResource,
        chatLoaded, setChatLoaded,
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
        setActiveView,
    } = useContext(MainContext);

    const { sidebarWidth } = useResizableSidebar(200, false);
    const metadataPanelContainer = useRef(null);

    const [selectedSources, setSelectedSources] = useState(0);
    const [combinedSummary, setCombinedSummary] = useState("");
    const [isCombinedSummaryPending, setIsCombinedSummaryPending] = useState(false);

    const [selectedLanguage, setSelectedLanguage] = useState("en"); // chat default language

    async function getCombinedSum() {
        try {
            setIsCombinedSummaryPending(true);
            setActiveView('resource');
            const summary = await makeApiRequest('/combine-summaries', "POST", JSON.stringify({
                sources: displayedSources?.map(item => ({ source_path: item?.source_path, category: item?.category })),
                lang: selectedLanguage
            }));
            setCombinedSummary(summary?.combined_summary || "");
        } catch (e) {
            console.log(e);
        } finally {
            setIsCombinedSummaryPending(false);

        }
    }

    function refreshSummary() {
        setSelectedSources(displayedSources?.length);
        if (displayedSources?.length > 1 || (displayedSources?.length > 1 && activeView === "resource")) {
            getCombinedSum();
        } else {
            setCombinedSummary(currentResource?.metadata?.summary?.content);
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

    return (
        <div className="relative flex flex-col max-w-4xl pt-10 mx-auto overflow-y-auto" ref={metadataPanelContainer}>
            {/* refresh summary */}
            <div
                className={`source-explorer flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                onClick={() => refreshSummary()}
            >
                <RefreshOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Refresh summary</span>
            </div>

            {(activeView === 'resource') && <div className="flex-1">
                <div className={`mb-4 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-textColor-100"
                    }`}>
                    <h2 className="text-3xl font-semibold break-words">
                        {/* {currentResource?.source_path.replace(/\.[^/.]+$/, '')} */}
                        Sources Summary
                    </h2>
                    {selectedSources > 0 && <span>{selectedSources} Source{selectedSources > 1 ? "s" : ""}</span>}
                </div>
                {!isCombinedSummaryPending ? <div>
                    <p
                        className={`text-md ${theme === "light"
                            ? "text-textColor-300"
                            : "text-textColor-100"
                            }`}
                        dangerouslySetInnerHTML={{ __html: `<p>${combinedSummary !== undefined ? combinedSummary?.replace(/\n/gi, '<br />') : currentResource?.metadata?.summary?.content}</p>` }}
                    ></p>
                    <div
                        className={`mt-3 flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                        onClick={() => addToInsight(combinedSummary !== undefined ? combinedSummary?.replace(/\n/gi, '<br />') : currentResource?.metadata?.summary?.content)}
                    >
                        <AddIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                        <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Add to insight</span>
                    </div>
                </div> : (
                    <div className="animate-pulse">
                        {new Array(10).fill(null).map((_, index) => (
                            <TextSkeleton key={index} className='h-3 mb-2' />
                        ))}
                    </div>
                )}
            </div>}

            <div className={`mt-10 overflow-y-hidden h-[700px]`}>
                <CopilotSection selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} setIsCombinedSummaryPending={setIsCombinedSummaryPending} combinedSummary={combinedSummary} setCombinedSummary={setCombinedSummary} chatLoaded={chatLoaded} setChatLoaded={setChatLoaded} sidebarWidth={sidebarWidth} key={0} name="genInsights" />
            </div>
        </div >
    );
};
export default MetadataPanel;
