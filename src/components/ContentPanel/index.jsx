import { useState, useEffect, useRef, useContext } from "react";
import Guide from "../Guide";
import makeApiRequest from "../../api";

import SearchModal from "../SearchModal";

import ContentSection from "../ContentSection";
import { MainContext } from '../../contexts/mainContext';

import './content-panel.css';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';

const ContentPanel = () => {
    const { sidebarWidth: leftWidth, handleMouseDown: handleLeftMouseDown, handleDoubleClick, setSidebarWidth, maxWidth } = useResizableSidebar(200, true);

    const {
        setNotes,
        showSearchModal,
        setShowSearchModal,
        handleCheckboxChange,
        knowledgeBase, setKnowledgeBase,
        onThumbnailClick,
        isLeftSidebarOpen,
        setIsLeftSidebarOpen, uploadedSources, setUploadedSources, setSelectedNote, theme, noteIndex, contentPanelContainerRef } = useContext(MainContext);





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

    // const onThumbnailClick = (event, file) => {
    //     if (event) event.preventDefault();
    //     const resourceURL = `${import.meta.env.VITE_API_ENDPOINT
    //         }/${file.file_type}/all/${encodeURIComponent(file.source_path)}`;
    //     let fileToCommit = knowledgeBase.find((item) => item.source_path === file.source_path) || file;
    //     setCurrentResource(fileToCommit);
    //     setResourceURL(resourceURL);
    //     setTranscription(fileToCommit.metadata ? fileToCommit.metadata.transcription : "");
    //     if (fileToCommit.file_type != "img") {
    //         setSummary(fileToCommit.summary);
    //         setSummaries(fileToCommit.topic_summaries);
    //     }

    //     // set jumpToPage to 1 so that the PDF reader displays all the pages from page 1 and not jump to a specific page life the case when clicking on a reference
    //     if (fileToCommit.file_type === "pdf") {
    //         setJumpToPage({ page: -1 });
    //     }
    //     setActiveView('resource');
    //     setShowMetadata(true);
    // };
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


    // const notesSectionSteps = [
    //     {
    //         target: ".new-note-button",
    //         content: "Click here to create a new insight.",
    //         disableBeacon: true,
    //         placement: "right",
    //     },
    //     {
    //         target: ".saved-notes",
    //         content: "This section contains all your saved insights. Click on a saved insight to view or edit it in the workspace.",
    //         placement: "right",
    //     },
    // ];

    // const storiesSectionSteps = [
    //     {
    //         target: ".new-story-button",
    //         content: "Click here to create a new story.",
    //         disableBeacon: true,
    //         placement: "right",
    //     },
    //     {
    //         target: ".saved-stories",
    //         content: "This section contains all your saved insights. Click on a saved insight to view or edit it in the workspace.",
    //         placement: "right",
    //     }
    // ];

    const [activeTab, setActiveTab] = useState('sources');



    return (
        <aside className={`relative z-10 select-none !h-full content-panel w-1/4 pl-3 bg-background overflow-y-auto overflow-x-hidden ${!isLeftSidebarOpen ? '!w-0 !p-0 !border-none' : "px-2"} flex flex-col relative`} ref={contentPanelContainerRef} style={{
            width: leftWidth
        }}>
            <h5 className={`select-none p-[10px] text-center  ${theme === "light" ? "!border-b !border-b-textColor-100/50 text-textColor-200" : "text-textColor-100 !border-b !border-b-textColor-300"
                }`}>Sources</h5>
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
            <div className="my-3 !border-b-0 !h-full">
                <ContentSection
                    leftWidth={leftWidth}
                    maxWidth={maxWidth}
                    knowledgeBase={knowledgeBase}
                    uploadedSources={uploadedSources}
                    setUploadedSources={setUploadedSources}
                    setKnowledgeBase={setKnowledgeBase}
                    onThumbnailClick={onThumbnailClick}
                    handleCheckboxChange={handleCheckboxChange}
                    name="Sources"
                    key={0}
                    classes="flex-1 h-full overflow-y-auto"
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
                className={`w-fit absolute right-1 h-auto top-2 flex flex-col justify-center items-center z-50`}
            >
                <button className={`cursor-pointer ${theme === 'dark' && 'text-textColor-100'}`} onClick={() => {
                    setSidebarWidth(prev => {
                        if (prev !== (maxWidth - (maxWidth * 0.3))) return maxWidth - (maxWidth * 0.3);
                        return window.innerWidth / 3.3333;
                    });
                    setIsLeftSidebarOpen(true);
                }}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon max-md:hidden">
                        <path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"></path>
                    </svg>
                </button>
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
