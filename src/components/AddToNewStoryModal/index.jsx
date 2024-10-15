import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useContext, useState } from 'react';
import Select from 'react-select';
import { MainContext } from '../../contexts/mainContext';
import { generateRandomHash } from '../../utils';

function AddToNewStoryModal({ open, handleClose, setOpen }) {
    const { theme, selectedNote, stories, setSelectedStory, setStories } = useContext(MainContext);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
    const [selectedSectionId, setSelectedSectionId] = useState("");



    const style = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 400,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
    };

    const handleStoryChange = (selectedOption) => {
        setSelectedStoryIndex(selectedOption.value);
        setSelectedStory(stories[selectedOption.value]);
    };

    const sections = stories[selectedStoryIndex]?.text.map(({ outline }) => ({ value: outline.id, label: outline.name }));

    const saveToStory = async () => {
        const joinedAnswers = selectedNote.text.map(({ answer, refs }) => {
            if (answer.includes('https://oaidalleapiprodscus.blob')) {
                return {
                    id: generateRandomHash(8),
                    answer,
                    refs
                };
            }

            return {
                id: generateRandomHash(8),
                answer,
                refs
            };
        });
        const newStory = {
            id: generateRandomHash(8),
            name: "New Story",
            text: [
                {
                    outline: {
                        id: generateRandomHash(8),
                        name: "New Section"
                    },
                    content: joinedAnswers
                }
            ]
        };

        setStories(prev => [...prev, newStory]);
        // setSelectedStory(prev => {
        //     const newStory = { ...prev };
        //     let currentText = newStory.text.find(({ outline }) => outline.id === selectedSectionId);
        //     currentText.content = joinedAnswers;
        //     return { ...newStory };

        // });

        setOpen(false);
    };

    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} className={`${theme === 'light' ? '!border-none' : '!bg-textColor-300 !text-white !border-b-none'}`}>

                    <p>HERE GOES NEW FORM STORY</p>
                </Box>

            </Modal>
        </div>
    );
}

export default AddToNewStoryModal;