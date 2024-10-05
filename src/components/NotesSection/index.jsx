
import makeApiRequest from "../../api";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { MainContext } from '../../contexts/mainContext';
import { memo, useContext } from 'react';
import BaseHeading from '../BaseHeading';
import NoData from "../NoData";
import SavedNote from '../SavedNote';
import SavedNoteSkeleton from '../Skeletons/SavedNoteSkeleton';
import StickyNote from '../StickyNote';

const NotesSection = () => {

    const {
        setIsNewNote,
        setSelectedNote,
        notes,
        setIsManualNote,
        selectedNote, theme, setIsEditingTitle, setActiveView, isNotesLoading, setNoteIndex, setShowNoteDetails } = useContext(MainContext);

    const handleAddNote = (event) => {
        event.preventDefault();
        setIsNewNote(true);
        setIsEditingTitle(true);
        setSelectedNote({
            note_id: new Date().toISOString().replace(/:/g, '-').split('.')[0],
            text: [{
                content: "",
                model: null,
                color: theme === 'light' ? "#333" : '#fff',
                question: '',
                answer: '',
                references: {
                    videoLinks: [],
                    keyframeLinks: [],
                    pdfLinks: [],
                    imageLinks: [],
                },
                refs: {
                    videoObjects: [],
                    keyframeObjects: [],
                    pdfObjects: [],
                    imageObjects: [],
                }
            }],
            images: [],
            note_name: "New insight",
        });
        setIsManualNote(true);
        setShowNoteDetails(true);
        setActiveView('note');
    };

    const handleDelete = async () => {
        try {
            await makeApiRequest(`/delete-note`, 'post', { noteID: selectedNote.note_id, noteName: selectedNote.note_name });
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <>
            <div className="notes-section mt-7">
                {/* New Note */}
                <div
                    className={`new-note-button flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit mb-4 ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={handleAddNote}
                >
                    <AddOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>New Insight</span>
                </div>

                <BaseHeading text='Saved notes' />
                <div className="saved-notes">
                    {
                        isNotesLoading ? (
                            <>
                                {
                                    [1, 2, 3].map((item) => (
                                        <SavedNoteSkeleton key={item} className='px-1 mt-4 mr-2' />
                                    ))
                                }
                            </>
                        ) :
                            notes.length > 0 ? (
                                <div>
                                    <div className="flex flex-wrap gap-10 px-1 pb-5 mt-4 mr-2 ">
                                        {notes.map((note, i) => (
                                            <StickyNote
                                                note={note}
                                                key={note.note_id}
                                                index={i}
                                                setNoteIndex={setNoteIndex}
                                                handleDelete={handleDelete}
                                            // onHide={onHide}
                                            />
                                        ))}
                                    </div>
                                </div >
                            ) : (
                                <div className="mt-4">
                                    <NoData />
                                </div>
                            )
                    }
                </div>
            </div >
        </>
    );
};

export default memo(NotesSection);
