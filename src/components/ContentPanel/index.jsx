import { useState, useEffect, useRef, useContext } from "react";
import Guide from "../Guide";
import makeApiRequest from "../../api";

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';

import SearchModal from "../SearchModal";

import NotesSection from "../NotesSection";
import ContentSection from "../ContentSection";
import { MainContext } from '../../contexts/mainContext';

import './content-panel.css';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';
import StoriesSection from '../StoriesSection';

const ContentPanel = () => {
    const { sidebarWidth: leftWidth, handleMouseDown: handleLeftMouseDown, handleDoubleClick, setSidebarWidth, maxWidth } = useResizableSidebar(200, true);

    const { setCurrentResource,
        setResourceURL,
        setNotes,
        showSearchModal,
        setShowSearchModal,
        handleCheckboxChange,
        knowledgeBase, setKnowledgeBase,
        setJumpToPage,
        isLeftSidebarOpen,
        setIsLeftSidebarOpen,
        setSummary, uploadedSources, setUploadedSources, setSelectedNote, theme, noteIndex, setNoteIndex, setSummaries, setActiveView } = useContext(MainContext);

    const [, setTranscription] = useState("");



    const noteIndexRef = useRef(noteIndex);

    useEffect(() => {
        noteIndexRef.current = noteIndex; // Always keep the ref current with the latest existingNote
    }, [noteIndex]);

    useEffect(() => {
        const makeRequest = async () => {
            try {
                const data = await makeApiRequest("/notes", "post");
                setNotes(data);
            } catch (error) {
                console.warn(error);
            } finally {
                setSelectedNote({
                    note_id: "",
                    text: [{
                        content: "", model: null, color: theme === 'light' ? "#333" : '#fff', question: '', references: {
                            videoLinks: [],
                            keyframeLinks: [],
                            pdfLinks: [],
                            imageLinks: [],
                        }
                    }],
                    images: [],
                    note_name: "",
                });
            }
        };

        makeRequest();
    }, []);

    const onThumbnailClick = (event, file) => {
        event.preventDefault();
        const resourceURL = `${import.meta.env.VITE_API_ENDPOINT
            }/${file.file_type}/all/${encodeURIComponent(file.source_path)}`;
        let fileToCommit = knowledgeBase.find((item) => item.source_path === file.source_path) || file;
        setCurrentResource(fileToCommit);
        setResourceURL(resourceURL);
        setTranscription(fileToCommit.metadata ? fileToCommit.metadata.transcription : "");
        if (fileToCommit.file_type != "img") {
            setSummary(fileToCommit.summary);
            setSummaries(fileToCommit.topic_summaries);
        }

        // set jumpToPage to 1 so that the PDF reader displays all the pages from page 1 and not jump to a specific page life the case when clicking on a reference
        if (fileToCommit.file_type === "pdf") {
            setJumpToPage({ page: -1 });
        }
        setActiveView('resource');
    };
    /**
     * Function to toggle 'isSelected' of an item inside 'knowledgeBase' array when the checkbox is clicked
     */


    const onHideSearchModal = () => {
        setShowSearchModal(false);
    };

    const contentSectionSteps = [
        {
            target: ".upload-source",
            content: "Click here to upload a new source to your knowledge base.",
            disableBeacon: true,
            placement: 'bottom'
        },
        {
            target: ".source-explorer",
            content: "Click here to explore your uploaded sources  in your knowledge base.",
        },
        {
            target: ".global-search",
            content: "Click here to search for a source in your knowledge base.",
        },
        {
            target: ".selected-sources-container",
            content: "This section contains all the sources you have selected in the source explorer.",
        },
    ];

    const notesSectionSteps = [
        {
            target: ".new-note-button",
            content: "Click here to create a new insight.",
            disableBeacon: true,
            placement: "right",
        },
        {
            target: ".saved-notes",
            content: "This section contains all your saved insights. Click on a saved insight to view or edit it in the workspace.",
            placement: "right",
        },
    ];

    const storiesSectionSteps = [
        {
            target: ".new-story-button",
            content: "Click here to create a new story.",
            disableBeacon: true,
            placement: "right",
        },
        {
            target: ".saved-stories",
            content: "This section contains all your saved insights. Click on a saved insight to view or edit it in the workspace.",
            placement: "right",
        }
    ];

    const [activeTab, setActiveTab] = useState('sources');

    return (
        <aside className={`relative select-none !h-full content-panel w-1/4 pl-3 bg-background ${!isLeftSidebarOpen ? '!w-0 !p-0 !border-none' : "px-2"} flex flex-col relative`} style={{
            width: leftWidth
        }}>
            {/* <div className="w-56 h-56 bg-blue-500 rounded-full absolute left-90% top-10 -z-1 blur-[160px]"></div> */}
            <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-0 top-40 -z-1 blur-[160px]"></div>
            <div className="w-56 h-56 bg-pink-300 rounded-full absolute left-1/2 top-80 -z-1 blur-[160px]"></div>
            {/* <Tabs
                transition={false}
                defaultActiveKey="sources"
                onSelect={(k) => setActiveTab(() => k)}
                id="uncontrolled-tab-example"
                className="my-3  flex  items-center !border-b-0"
            >
                <Tab eventKey="sources" title="Sources" className='flex-1 h-full overflow-y-auto'> */}
            <div className="my-3 !border-b-0">
                <ContentSection
                    knowledgeBase={knowledgeBase}
                    uploadedSources={uploadedSources}
                    setUploadedSources={setUploadedSources}
                    setKnowledgeBase={setKnowledgeBase}
                    onThumbnailClick={onThumbnailClick}
                    handleCheckboxChange={handleCheckboxChange}
                    name="Sources"
                    key={0}
                />
                {(activeTab === 'sources' && (Boolean(localStorage.getItem(`guide_completed_sources`)) === false || localStorage.getItem(`guide_completed_sources`) === "false")) && <Guide steps={contentSectionSteps} tabIdentifier="sources" />}
            </div>
            {/* </Tab>
                <Tab eventKey="insights" title="Insights" className='flex-1 h-full overflow-y-auto'>
                    <NotesSection
                        setNoteIndex={setNoteIndex}
                        nodeIndex={noteIndex}
                        key={2}
                        name="Notes"
                    />
                    {(activeTab === 'insights' && (Boolean(localStorage.getItem(`guide_completed_insights`)) === false || localStorage.getItem(`guide_completed_sources`) === "false")) && <Guide steps={notesSectionSteps} tabIdentifier="insights" />}
                </Tab>
                <Tab eventKey="stories" title="Stories" className='flex-1 h-full overflow-y-auto'>
                    <StoriesSection
                    />
                    {(activeTab === 'stories' && (Boolean(localStorage.getItem(`guide_completed_stories`)) === false || localStorage.getItem(`guide_completed_sources`) === "false")) && <Guide steps={storiesSectionSteps} tabIdentifier="stories" />}
                </Tab>
            </Tabs> */}
            <div
                className={`w-fit absolute left-0 h-auto top-1/2 flex flex-col justify-center items-center z-50`}
            >
                <SwapHorizOutlinedIcon className={`cursor-pointer ${theme === 'dark' && 'text-textColor-100'}`} onClick={() => {
                    setSidebarWidth(prev => {
                        if (prev !== maxWidth) return maxWidth;
                        return window.innerWidth / 3.3333;
                    });
                    setIsLeftSidebarOpen(true);
                }} />
            </div>
            {
                isLeftSidebarOpen && <div
                    className="absolute top-0 bottom-0 z-50 w-1 h-full hover:bg-primary-100 hover:cursor-col-resize"
                    style={{ left: leftWidth }}
                    onMouseDown={handleLeftMouseDown}
                    onDoubleClick={handleDoubleClick}
                ></div>
            }



            <SearchModal
                show={showSearchModal}
                onHide={onHideSearchModal}
                knowledgeBase={knowledgeBase}
                handleCheckboxChange={handleCheckboxChange}
                onThumbnailClick={onThumbnailClick}
                className="modal"
            />
        </aside>
    );
};

export default ContentPanel;
