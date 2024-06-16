import { useState, useEffect, useRef, useContext } from "react";

import makeApiRequest from "../../api";

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import SearchModal from "../SearchModal";

import NotesSection from "../NotesSection";
import ContentSection from "../ContentSection";
import { MainContext } from '../../contexts/mainContext';

import './content-panel.css';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';
import StoriesSection from '../StoriesSection';

const ContentPanel = () => {
    const { sidebarWidth: leftWidth, handleMouseDown: handleLeftMouseDown, handleDoubleClick } = useResizableSidebar(200, true);

    const { setCurrentResource,
        setResourceURL,
        setNotes,
        setSelectedAll,
        showSearchModal,
        setShowSearchModal,
        setSelectedSources,
        selectedSources,
        setJumpToPage,
        isLeftSidebarOpen,
        setSummary, setSelectedNote, theme, noteIndex, setNoteIndex, setSummaries, setActiveView } = useContext(MainContext);


    const [knowledgeBase, setKnowledgeBase] = useState([]); // Knowledge Base (Videos, Pdfs, Docs, etc) metadata

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
        setCurrentResource(file);
        setResourceURL(resourceURL);
        setTranscription(file.transcript);
        if (file.file_type != "img") {
            setSummary(file.summary);
            setSummaries(file.topic_summaries);
        }

        // set jumpToPage to 1 so that the PDF reader displays all the pages from page 1 and not jump to a specific page life the case when clicking on a reference
        if (file.file_type === "pdf") {
            setJumpToPage({ page: -1 });
        }
        setActiveView('resource');
    };
    /**
     * Function to toggle 'isSelected' of an item inside 'knowledgeBase' array when the checkbox is clicked
     */
    const handleCheckboxChange = (file) => {
        // Create a new array with updated items
        const updatedKnowledgeBase = knowledgeBase.map((item) => {
            if (item.source_path === file.source_path) {
                return { ...item, is_selected: !item.is_selected };
            }
            if (item.is_selected) setSelectedAll(false);
            return item;
        });
        setKnowledgeBase(updatedKnowledgeBase);

        // item should exist in selectedSources and isSelected is true => remove it from selectedSources
        if (file.is_selected && selectedSources.some((item) => item.source_path === file.source_path)) {
            console.log('yes');
            setSelectedSources((prev) => prev.filter((item) => item.source_path !== file.source_path));
        }
    };

    const onHideSearchModal = () => {
        setShowSearchModal(false);
    };

    return (
        <div className={`user-select-none h-full content-panel w-1/4 pl-3 bg-background ${!isLeftSidebarOpen ? '!w-0 !p-0 !border-none' : "px-2"} flex flex-col relative`} style={{
            width: leftWidth
        }}>
            {
                isLeftSidebarOpen && <div
                    className="absolute top-0 bottom-0 z-50 w-1 h-full hover:bg-primary-100 hover:cursor-col-resize"
                    style={{ left: leftWidth }}
                    onMouseDown={handleLeftMouseDown}
                    onDoubleClick={handleDoubleClick}
                ></div>
            }

            <Tabs
                transition={false}
                defaultActiveKey="sources"
                id="uncontrolled-tab-example"
                className="my-3 text-center flex justify-center items-center !border-b-0"
            >
                <Tab eventKey="sources" title="Sources" className='flex-1 h-full overflow-y-auto'>
                    <ContentSection
                        knowledgeBase={knowledgeBase}
                        setKnowledgeBase={setKnowledgeBase}
                        onThumbnailClick={onThumbnailClick}
                        handleCheckboxChange={handleCheckboxChange}
                        name="Sources"
                        key={0}
                    />
                </Tab>
                <Tab eventKey="insights" title="Insights" className='flex-1 h-full overflow-y-auto'>
                    <NotesSection
                        setNoteIndex={setNoteIndex}
                        nodeIndex={noteIndex}
                        key={2}
                        name="Notes"
                    />
                </Tab>
                <Tab eventKey="stories" title="Stories" className='flex-1 h-full overflow-y-auto'>
                    <StoriesSection
                    />
                </Tab>
            </Tabs>

            <SearchModal
                show={showSearchModal}
                onHide={onHideSearchModal}
                knowledgeBase={knowledgeBase}
                handleCheckboxChange={handleCheckboxChange}
                onThumbnailClick={onThumbnailClick}
                className="modal"
            />
        </div>
    );
};

export default ContentPanel;
