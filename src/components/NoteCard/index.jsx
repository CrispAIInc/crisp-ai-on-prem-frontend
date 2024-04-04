import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

const NoteCard = ({ index, setNoteIndex, note }) => {

    console.log(note);

    const noteBodyObject = { __html: note.text[0]?.content };

    const { setSelectedNote,
        setIsNewNote,
        setShowNoteModal, } = useContext(MainContext);

    const showSelectedNote = (event, note, index) => {
        event.preventDefault();
        setNoteIndex(index);
        setSelectedNote(note);
        setIsNewNote(false);
        setShowNoteModal(true);
    };

    return (
        <div
            className="note"
            onClick={(event) => showSelectedNote(event, note, index)}
        >
            <h2 className="note-header">
                {note.note_name}
            </h2>
            <div className="truncate note-body" dangerouslySetInnerHTML={noteBodyObject}>

            </div>
        </div>
    );
};

export default NoteCard;