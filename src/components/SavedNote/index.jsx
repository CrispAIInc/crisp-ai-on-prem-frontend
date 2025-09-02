import { useContext } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';

import DeleteIcon from "@mui/icons-material/Delete";
import makeApiRequest from '../../api';
import SideCard from '../../layouts/SideCard';
import ModelChip from '../ModelChip';

const SavedNote = ({ index, setNoteIndex, note }) => {

    const previousModels = [];

    const { setSelectedNote,
        setIsNewNote, setShowNoteDetails, theme, setIsEditingTitle, setNotes, setActiveView } = useContext(MainContext);

    const showSelectedNote = (event, note, index) => {
        event.preventDefault();
        setNoteIndex(index);
        setSelectedNote(note);
        setIsEditingTitle(false);
        setIsNewNote(false);
        setShowNoteDetails(true);
        setActiveView('note');
    };

    const handleDelete = async () => {
        try {
            await makeApiRequest(`/delete-note`, 'post', { noteID: note.note_id, noteName: note.note_name });
            // send request to update notes
            const data = await makeApiRequest("/notes", "post");
            setNotes(data);
        } catch (error) {
            console.log(error);
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

    return (

        <SideCard onClick={(event) => showSelectedNote(event, note, index)}>
            {/* top */}
            <div className="flex items-center justify-between mb-1">
                <p className={`mb-0 text-sm font-semibold truncate ${theme === 'light' ? 'text-textColor-200' : 'text-white'}`}>
                    {note.note_name}
                </p>
                <span onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNote(note);
                    handleDelete();
                }}>
                    <DeleteIcon color={`${theme === 'light' ? '#444' : 'error'}`} />
                </span>
            </div>
            {
                Array.isArray(note.text) && note.text.length > 0 && <p className={`my-0 text-xs ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'} line-clamp-2`}>{note.text[0]?.answer}</p>
            }

            {/* list of models used */}
            <div className="flex flex-wrap items-center gap-1 mt-3">
                {
                    Array.isArray(note.text) && note.text?.map((content, index) => {
                        if (content.model && !previousModels.includes(content.model)) {
                            previousModels.push(content.model);

                            return <ModelChip key={index} modelName={content.model.toUpperCase()} />;
                        }
                    })
                }
            </div>
        </SideCard >
    );
};

export default SavedNote;