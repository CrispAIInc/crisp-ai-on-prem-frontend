import React, { useState, useEffect, useRef, useContext } from "react";

import makeApiRequest from "../../api";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
// import "./content_panel.css";

import SearchModal from "../SearchModal";

import NotesSection from "../NotesSection";
import ContentSection from "../ContentSection";
import { MainContext } from '../../contexts/mainContext';
import Toggler from '../Toggler';
import SearchSection from '../SearchSection';

const ContentPanel = () => {

    const { currentResource,
        setCurrentResource,
        resourceURL,
        chatLoaded,
        setResourceURL,
        player,
        isPlayerReady,
        setIsPlayerReady,
        notes,
        setNotes,
        selectedNote,
        setSelectedNote,
        showNoteModal,
        setShowNoteModal,
        selectedSources,
        setSelectedSources,
        selectedAll,
        setSelectedAll,
        selectedCategory,
        setSelectedCategory,
        setSelectedFormat,
        selectedFormat,
        additionalSources,
        setAdditionalSources,
        showSearchModal,
        setShowSearchModal,
        isNewNote,
        setIsNewNote,
        isLeftSidebarOpen,
        setSummary } = useContext(MainContext);


    const [knowledgeBase, setKnowledgeBase] = useState([]); // Knowledge Base (Videos, Pdfs, Docs, etc) metadata

    // const [currentResource, setCurrentResource] = useState('');
    const [, setTranscription] = useState("");
    const [, setSummaries] = useState("");

    const [contentType, setContentType] = React.useState("sources"); // Could either be "Sources" or "Notes"

    const [noteIndex, setNoteIndex] = useState(0);
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
            }
        };

        makeRequest();
    }, []);

    const handleContentType = (event, newContentType) => {
        event.preventDefault();
        setContentType(newContentType);
    };

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
    };

    const onHideSearchModal = () => {
        setShowSearchModal(false);
    };

    return (
        <div className={`h-full content-panel w-1/4 pl-3 bg-background !transition-all ${!isLeftSidebarOpen && 'hidden'}`}>
            <Toggler components={[
                <ContentSection
                    knowledgeBase={knowledgeBase}
                    setKnowledgeBase={setKnowledgeBase}
                    onThumbnailClick={onThumbnailClick}
                    handleCheckboxChange={handleCheckboxChange}
                    name="Sources"
                    key={0}
                />,
                <SearchSection chatLoaded={chatLoaded} key={1} name="Search" />,
                <NotesSection
                    setNoteIndex={setNoteIndex}
                    nodeIndex={noteIndex}
                    key={2}
                    name="Notes"
                />
            ]} />

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
