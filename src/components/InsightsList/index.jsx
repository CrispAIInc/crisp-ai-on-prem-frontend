import React, { useContext, useEffect, useState } from 'react';

import RippleButton from "../RippleButton";
import BaseHeading from "../BaseHeading";
import LoadingSpinner from "../LoadingSpinner";

import { MainContext } from '../../contexts/mainContext';
import { useToast } from "../../contexts/toastContext";

import AddIcon from '@mui/icons-material/Add';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import DeleteIcon from "@mui/icons-material/Delete";

import { generateRandomHash, searchByKey, sortArrayOfObjects } from '../../utils';
import makeApiRequest from '../../api';
import useResources from '../../hooks/useResources';

function InsightsList({
    isNewInsight,
    setIsNewInsight
}) {

    const {
        theme,
        setSelectedNote,
        setSelectedStory,
        setShowEditor,
        notes,
        setNotes,
        setNoteIndex,
        setIsEditingTitle,
        setIsNewNote,
        setShowNoteDetails,
    } = useContext(MainContext);

    const { notify } = useToast();
    const { getNotes } = useResources({ setNotes });
    const [notesResults, setNotesResults] = useState(notes);
    const [insightSearchValue, setInsightSearchValue] = useState("");
    const [hoveredInsight, setHoveredInsight] = useState(null);

    // useEffect(() => {
    //     setNotesResults(sortBySourcePath(notes));
    //   }, [notes]);


    const handleInsightSearch = (e) => {
        const value = e?.target?.value || "";
        setInsightSearchValue(value);

        if (value.trim() === "") {
            setNotesResults(sortArrayOfObjects(notes, "note_name"));
        } else {
            const filtered = searchByKey(notes, "note_name", value);
            setNotesResults(sortArrayOfObjects(filtered, "note_name"));
        }
    };

    function createNewInsight() {
        setSelectedNote({
            note_id: "",
            text: [{
                id: generateRandomHash(5),
                content: "",
                model: "",
                color: theme === 'light' ? "#333" : '#fff',
                question: 'Question goes here...',
                questionHtml: "<div class='question-block' style='font-weight: bold; font-size: 20px;'>Question goes here...</div>",
                answer: "Write your insight body here...",
                answerHtml: "<div class='answer-block'>Write your insight body here...</div>",
                references: {
                    videoLinks: [],
                    keyframeLinks: [],
                    pdfLinks: [],
                    imageLinks: [],
                },
                refs: {
                    videoLinks: [],
                    keyframeLinks: [],
                    pdfLinks: [],
                    imageLinks: [],
                }
            }],
            images: [],
            note_name: "",
        });
        setIsNewInsight(true);
        setShowEditor(true);
    }

    const handleMouseEnterInsight = (id) => {
        setHoveredInsight(id);
    };
    const handleMouseLeaveInsight = () => {
        setHoveredInsight(null);
    };

    const showSelectedNote = (event, note, index) => {
        setSelectedStory({
            story_id: "",
            text: [],
            story_name: "",
            models: [],
        });
        event.preventDefault();
        setNoteIndex(index);
        setSelectedNote(note);
        setIsEditingTitle(false);
        setIsNewNote(false);
        setShowNoteDetails(true);
        setShowEditor(true);
    };

    const [isInsightDeleting, setIsInsightDeleting] = useState(false);
    async function deleteInsight(id, name) {
        try {
            setIsInsightDeleting(true);
            await makeApiRequest(`/delete-note`, 'post', { noteID: id, noteName: name });
            // send request to update notes
            notify({
                variant: "success",
                heading: "Insight deleted successfully!",
            });
            setNotes(prev => prev.filter(item => item.note_id !== id));
            // getNotes();
        } catch (e) {
            console.log(e);
        } finally {
            setIsInsightDeleting(false);
        }
    }

    useEffect(() => {
        handleInsightSearch();
    }, [JSON.stringify(notes)]);

    return (
        <div>
            <RippleButton
                onClick={createNewInsight}
                cssClasses='!py-1 !px-2 !pr-4'
            >
                <AddIcon className="!w-fit !p-0" />
                <span className={` !text-[12px]`}>New Insight</span>
            </RippleButton>
            <div className="flex flex-col overflow-y-auto">
                {/* search input */}
                {(notes?.length > 0 || notesResults?.length > 0) && <input className={`mt-4 mb-2 py-1 text-sm bg-transparent outline-none ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200 text-textColor-100'} w-full  rounded-full !pl-[10px]`} placeholder={"Search..."} value={insightSearchValue} onChange={handleInsightSearch} />}
                {
                    (notesResults?.length === 0 || notes?.length === 0) ? <BaseHeading text="No insights found" className={`text-center mt-4 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} />
                        :
                        (
                            <div className="flex flex-col gap-2">
                                {/* list of notes */}
                                {notesResults?.map((note, index) => (
                                    <div key={note.note_id} className={`flex items-start gap-2 ${theme === 'light'
                                        ? 'hover:bg-textColor-100/10'
                                        : 'hover:bg-light-hover-200/20'
                                        } cursor-pointer p-2 rounded-md select-none`} onMouseEnter={() => handleMouseEnterInsight(note.note_id)} onMouseLeave={handleMouseLeaveInsight} onClick={(event) => showSelectedNote(event, note, index)}>
                                        <ArticleOutlinedIcon style={{ color: theme === 'light' ? '#333' : '#5293FD' }} />
                                        <p className={`font-semibold flex-1 ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                                            }`}>{note.note_name}</p>
                                        {
                                            hoveredInsight === note?.note_id && (
                                                isInsightDeleting ? <LoadingSpinner isSmall /> : <DeleteIcon
                                                    onClick={(event) => { event.stopPropagation(); deleteInsight(note?.note_id, note?.note_name); }}
                                                    className="text-red-400 cursor-pointer"
                                                />
                                            )
                                        }
                                    </div>
                                ))}
                            </div>
                        )
                }
            </div>
        </div>
    );
}

export default InsightsList;