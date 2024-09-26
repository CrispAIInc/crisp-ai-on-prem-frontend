import Joyride from "react-joyride";
import makeApiRequest from "../../api";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { MainContext } from '../../contexts/mainContext';
import { useContext } from 'react';
import BaseHeading from '../BaseHeading';
import NoData from "../NoData";
import SavedNote from '../SavedNote';
import SavedNoteSkeleton from '../Skeletons/SavedNoteSkeleton';

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

    const steps = [
        {
            target: ".new-note-button",
            content: "Click here to create a new insight.",
            disableBeacon: true,
            placement: "right",
        },
        {
            target: ".saved-notes",
            content: "This section contains all your saved insights. Click on a saved insight to view or edit it in the workspace.",
            placement: "right",
        },
    ];

    return (
        <>
            {/* <Joyride
                steps={steps}
                continuous
                showProgress
                showSkipButton
                disableScrollParentFix={true}
                styles={{
                    options: {
                        arrowColor: "#5293FD",  // Arrow color for the tooltip
                        backgroundColor: "#5293FD", // Background color of the tooltip
                        overlayColor: "rgba(82, 147, 253, 0.1)",  // Dim background overlay
                        primaryColor: "#5293FD", // Color of the primary buttons (e.g. Next)
                        textColor: "#fff",  // Text color inside the tooltip
                        zIndex: 1000, // Ensure the tooltip appears on top of other elements
                    },
                    buttonNext: {
                        outline: "none",
                    },
                    spotlight: {
                        borderRadius: '8px', // Add rounded corners to the spotlight
                        boxShadow: '0 0 15px rgba(0, 0, 0, 0.2)', // Subtle shadow effect
                        backgroundColor: 'rgba(255, 255, 255, 0.6)', // Spotlight color to highlight the element
                    },
                    tooltipContainer: {
                        maxWidth: '300px', // Limit the tooltip width
                        wordWrap: 'break-word', // Ensure text doesn't overflow
                    },
                    tooltip: {
                        whiteSpace: 'normal', // Ensure the text wraps inside the tooltip
                    },
                }}
            /> */}
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
                                    <div className="flex flex-col gap-10 px-1 pb-5 mt-4 mr-2 ">
                                        {notes.map((note, i) => (
                                            <SavedNote
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

export default NotesSection;
