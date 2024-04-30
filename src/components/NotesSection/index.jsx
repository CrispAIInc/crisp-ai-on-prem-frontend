import makeApiRequest from "../../api";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { NoteModal } from "../NoteModal";
import { MainContext } from '../../contexts/mainContext';
import { useContext } from 'react';
import BaseHeading from '../BaseHeading';
import NoData from "../NoData";
import SavedNote from '../SavedNote';

const NotesSection = () => {

    const { showNoteModal,
        setShowNoteModal,
        setNotes,
        setIsNewNote,
        setSelectedNote,
        notes,
        isNewNote,
        selectedNote, theme, setIsEditingTitle, noteIndex, setActiveView, setNoteIndex, setShowNoteDetails } = useContext(MainContext);

    const handleAddNote = (event) => {
        event.preventDefault();
        setIsNewNote(true);
        setIsEditingTitle(true);
        // setShowNoteModal(true);
        setSelectedNote({
            note_id: "",
            text: [{ content: "", model: null, color: theme === 'light' ? "#333" : '#fff' }],
            images: [],
            note_name: "",
        });
        setShowNoteDetails(true);
        setActiveView('note');
    };

    const handleDelete = async () => {
        console.log("deleting note...");
        try {
            const response = await makeApiRequest(`/delete-note`, 'post', { noteID: selectedNote.note_id, noteName: selectedNote.note_name });
            if (response.status === 200) {
                console.log('selectedNote deleted !');
            }
        } catch (error) {
            console.log(error);
        }
        // onHide();
    };



    // const onHide = async () => {
    //     setShowNoteModal(false);
    //     try {
    //         const data = await makeApiRequest("/notes", "post");
    //         setNotes(data);
    //     } catch (error) {
    //         console.log(error);
    //     } finally {
    //         setIsNewNote(false);
    //         setSelectedNote({
    //             note_id: "",
    //             text: [{ content: "", model: null, color: theme === 'light' ? "#333" : '#fff' }],
    //             images: [],
    //             note_name: "",
    //         });
    //     }

    // };

    return (
        <div className="mt-7">
            {/* New Note */}
            <div
                className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit mb-4 ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                onClick={handleAddNote}
            >
                <AddOutlinedIcon />
                <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>New Insight</span>
            </div>

            {/* <NoteModal
                onHide={onHide}
                existingNote={noteIndex}
                className="modal"
                show={showNoteModal}
                note={selectedNote}
                setSelectedNote={setSelectedNote}
                handleDelete={handleDelete}
                notes={notes}
                isNewNote={isNewNote}
                key={selectedNote.note_name}
            /> */}

            <BaseHeading text='Saved notes' />
            {notes.length > 0 ? (
                <div>
                    <div className="flex flex-col gap-10 px-1 pb-5 mt-4 mr-2 ">
                        {notes.map((note, i) => (
                            <SavedNote
                                note={note}
                                key={i}
                                index={i}
                                setNoteIndex={setNoteIndex}
                                handleDelete={handleDelete}
                            // onHide={onHide}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="mt-4">
                    <NoData />
                </div>
            )}
        </div>
    );
};

export default NotesSection;
