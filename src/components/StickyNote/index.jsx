import { useEffect, useState, useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

// import DeleteIcon from "@mui/icons-material/Delete";
// import makeApiRequest from '../../api';
import ModelChip from '../ModelChip';
// import SideCard from '../../layouts/SideCard';
// import ModelChip from '../ModelChip';

const StickyNote = ({ index, setNoteIndex, note }) => {
    const [color, setColor] = useState('');
    const previousModels = [];

    const { setSelectedNote,
        setIsNewNote, setShowNoteDetails, theme, setIsEditingTitle, setActiveView } = useContext(MainContext);

    const showSelectedNote = (event, note, index) => {
        event.preventDefault();
        setNoteIndex(index);
        setSelectedNote(note);
        setIsEditingTitle(false);
        setIsNewNote(false);
        setShowNoteDetails(true);
        setActiveView('note');
    };

    // const handleDelete = async () => {
    //     try {
    //         await makeApiRequest(`/delete-note`, 'post', { noteID: note.note_id, noteName: note.note_name });
    //         // send request to update notes
    //         const data = await makeApiRequest("/notes", "post");
    //         setNotes(data);
    //     } catch (error) {
    //         console.log(error);
    //     } finally {
    //         setSelectedNote({
    //             note_id: "",
    //             text: [{
    //                 content: "", model: null, color: theme === 'light' ? "#333" : '#fff', question: '', references: {
    //                     videoLinks: [],
    //                     keyframeLinks: [],
    //                     pdfLinks: [],
    //                     imageLinks: [],
    //                 }
    //             }],
    //             images: [],
    //             note_name: "",
    //         });
    //     }
    // };

    useEffect(() => {
        // Function to generate a light random hex color
        const generateLightRandomColor = () => {
            const letters = 'CDEF'; // Restricting to higher hex values for light colors
            let color = '#';
            for (let i = 0; i < 6; i++) {
                color += letters[Math.floor(Math.random() * letters.length)];
            }
            return color;
        };

        setColor(generateLightRandomColor());
    }, []);

    return (
        <div
            className={`p-1 rounded-lg w-36 h-36 relative transform shadow-[rgba(0,0,15,0.5)_0px_8px_19px_-10px] flex flex-col`}
            style={{
                backgroundColor: color,
                // boxShadow: '0 15px 25px rgba(0, 0, 0, 0.2)', // Bottom-only shadow
                transform: `rotate(${Math.random() * 6 - 3}deg)`, // Random slight rotation between -3 and 3 degrees
            }}
            onClick={(event) => showSelectedNote(event, note, index)}
        >
            {/* Note Content */}
            {/* <div> */}
            <h4 className="mb-2 text-lg font-semibold text-gray-800">{note.note_name}</h4>
            {
                (Array.isArray(note.text) && note.text.length > 0) && <p className={`my-0 text-xs ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'} line-clamp-2`}>{note.text[0]?.answer}</p>
            }

            {/* list of models used */}
            <div className="flex flex-wrap items-center flex-1 gap-1 mt-3">
                {
                    Array.isArray(note.text) && note.text?.map((content, index) => {
                        if (content.model && !previousModels.includes(content.model)) {
                            previousModels.push(content.model);

                            return <ModelChip key={index} modelName={content.model.toUpperCase()} />;
                        }
                    })
                }
            </div>
            {/* </div> */}
        </div>
    );
};

export default StickyNote;