import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import Select from 'react-select';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';

import makeApiRequest from '../../api';

function AddToStoryModal({ open, handleClose, setOpen }) {
    const { theme, selectedNote, stories } = useContext(MainContext);
    const [selectedStoryIndex, setSelectedStoryIndex] = useState(0);
    const [selectedSectionId, setSelectedSectionId] = useState("");
    // const [sections, setSections] = useState(stories[0].text.map(({ outline }) => ({ value: outline.id, label: outline.name })));

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

        // setSections(sections);
    };

    const sections = stories[selectedStoryIndex].text.map(({ outline }) => ({ value: outline.id, label: outline.name }));

    const handleSectionChange = (selectedOption) => {
        setSelectedSectionId(selectedOption.value);
    };

    const saveToStory = async () => {
        const joinedAnswers = selectedNote.text.map((item) => item.answer).join('<br />');
        const sectionToBeModified = stories[selectedStoryIndex].text.find(({ outline }) => outline.id === selectedSectionId);

        sectionToBeModified.content = joinedAnswers;

        setOpen(false);

        // try {
        //     await makeApiRequest('/stories', 'post', stories);
        // } catch (error) {
        //     console.log(error);
        // }
    };

    return (
        <div>

            {/* <Button onClick={handleOpen}><AddCircleIcon /></Button> */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style} className={`${theme === 'light' ? '!border-none' : '!bg-textColor-300 !text-white !border-b-none'}`}>
                    {/* <div
                        className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                        onClick={() => { handleClose(); }}
                    >
                        <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Add to a new story</span>
                    </div> */}

                    <Select className='mb-4' placeholder="Select Story" styles={{
                        option: provided => ({
                            ...provided,
                            color: '#333333'
                        }),
                    }}
                        defaultValue={1} options={stories.map((story, i) => ({ value: i, label: story.story_name }))} onChange={handleStoryChange} />

                    <Select className='note-select' placeholder="Select Section" styles={{
                        option: provided => ({
                            ...provided,
                            color: '#333333'
                        }),
                    }}
                        defaultValue={1} options={sections} onChange={handleSectionChange} />
                    {/* add button */}
                    {/* <div className={`flex items-center justify-end bg-red-500 gap-2 px-2 py-2 rounded-md cursor-pointer ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                        onClick={() => { handleClose(); }}
                    > */}
                    <p className={`cursor-pointer ml-full w-fit p-2 m-0 font-medium ${theme === 'light' ? 'text-textColor-300 hover:bg-light-hover-100' : 'text-textColor-100 hover:bg-background_workspace'}`} onClick={saveToStory}>Add</p>
                    {/* </div> */}
                </Box>

            </Modal>
        </div>
    );
}

export default AddToStoryModal;