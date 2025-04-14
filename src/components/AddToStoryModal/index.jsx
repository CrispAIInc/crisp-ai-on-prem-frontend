import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import { useContext, useState } from 'react';
import AddToExistingStoryModal from "../AddToExistingStoryModal";
import { MainContext } from '../../contexts/mainContext';
import AddToNewStoryModal from '../AddToNewStoryModal';
import { generateRandomHash } from '../../utils';

function AddToStoryModal({ open, handleClose, setOpen }) {
    const { theme, selectedNote, setActiveView, setSelectedStory } = useContext(MainContext);

    const [openExistingStoryModal, setOpenExistingStoryModal] = useState(false);
    const [openNewStoryModal, setOpenNewStoryModal] = useState(false);

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

    function handleOpenExistingStoryModal() {
        setOpenExistingStoryModal(true);
    }

    function handleCloseExistingStoryModal() {
        setOpenExistingStoryModal(false);
    }

    function handleOpenNewStoryModal() {
        setOpenNewStoryModal(true);
    }

    function handleCloseNewStoryModal() {
        setOpenNewStoryModal(false);
    }

    const saveToStory = async () => {
        const joinedAnswers = selectedNote.text.map(({ answer, refs }) => {

            return {
                id: generateRandomHash(8),
                answer,
                refs
            };
        });
        const newStory = {
            story_id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
            story_name: "New Story",
            text: [
                {
                    id: generateRandomHash(8),
                    outline: {
                        id: generateRandomHash(8),
                        name: "New Section"
                    },
                    content: joinedAnswers
                }
            ],
            models: [],
        };
        displayStory(newStory);

        setOpen(false);
        setOpenExistingStoryModal(false);
        setOpenNewStoryModal(false);
    };

    function displayStory(story) {
        setSelectedStory(story);
        setActiveView('story');
    }

    return (
        <div>
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} className={`${theme === 'light' ? '!border-none' : '!bg-textColor-300 !text-white !border-b-none'}`}>
                    <div
                        className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                        onClick={saveToStory}
                    >
                        <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Add to new Story</span>
                    </div>

                    <AddToNewStoryModal open={openNewStoryModal} setOpen={setOpenExistingStoryModal} handleOpen={handleOpenNewStoryModal} handleClose={handleCloseNewStoryModal} />

                    <div
                        className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                        onClick={handleOpenExistingStoryModal}
                    >
                        <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Add to existing Story</span>
                    </div>

                    <AddToExistingStoryModal open={openExistingStoryModal} setOpen={setOpenNewStoryModal} handleOpen={handleOpenExistingStoryModal} handleClose={handleCloseExistingStoryModal} />
                </Box>

            </Modal>
        </div>
    );
}

export default AddToStoryModal;