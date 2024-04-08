import { useContext, useEffect } from 'react';
import { MainContext } from '../../contexts/mainContext';

import DeleteIcon from "@mui/icons-material/Delete";
import { parseHtmlToText } from '../../utils';
import ModelChip from '../ModelChip';
import makeApiRequest from '../../api';

const SavedNote = ({ index, setNoteIndex, note, onHide }) => {

    const previousModels = [];

    const { setSelectedNote,
        setIsNewNote,
        setShowNoteModal, theme, setIsEditingTitle } = useContext(MainContext);

    const showSelectedNote = (event, note, index) => {
        event.preventDefault();
        setNoteIndex(index);
        setSelectedNote(note);
        setIsEditingTitle(false);
        setIsNewNote(false);
        setShowNoteModal(true);
    };

    const handleDelete = async () => {
        try {
            const response = await makeApiRequest(`/delete-note`, 'post', { noteID: note.note_id, noteName: note.note_name });
            if (response.status === 200) {
                console.log('selectedNote deleted !');
            }
        } catch (error) {
            console.log(error);
        }
        onHide();
    };

    return (
        <div
            className={`p-2 ${theme === 'light' ? 'bg-white' : 'bg-background_workspace'} rounded-md shadow-[0_0px_8px_0px_rgba(0,0,0,0.15)] cursor-pointer user-select-none  3xl:w-5/6 4xl:w-4/6`}
            onClick={(event) => showSelectedNote(event, note, index)}
        >
            {/* top */}
            <div className="flex items-center justify-between mb-1">
                <p className={`mb-0 text-sm font-semibold ${theme === 'light' ? 'text-textColor-200' : 'text-white'}`}>
                    {note.note_name}
                </p>
                <span onClick={(e) => {
                    // e.preventDefault();
                    e.stopPropagation();
                    setSelectedNote(note);
                    handleDelete();
                }}>
                    <DeleteIcon color={`${theme === 'light' ? '#444' : 'error'}`} />
                </span>
            </div>
            {
                Array.isArray(note.text) && <p className={`my-0 text-xs ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'} line-clamp-2`}>{parseHtmlToText(note.text[0]?.content || note.text[1]?.content)}</p>
            }

            {/* list of models used */}
            <div className="flex items-center gap-3 mt-3">
                {
                    Array.isArray(note.text) && note.text?.map((content, index) => {
                        if (content.model && !previousModels.includes(content.model)) {
                            previousModels.push(content.model);

                            return <ModelChip key={index} modelName={content.model.toUpperCase()} />;
                        }
                    })
                }
            </div>
        </div>
    );
};

export default SavedNote;