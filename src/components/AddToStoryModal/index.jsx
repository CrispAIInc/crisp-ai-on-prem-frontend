import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext';
import Select from 'react-select';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import { generateRandomHash } from '../../utils';

function AddToStoryModal({ open, handleClose, setOpen }) {
    const { theme, selectedNote, stories, selectedStory, setSelectedStory, API_ENDPOINT, setCurrentResource,
        setResourceURL,
        setSummary,
        setSummaries,
        setActiveView,
        setJumpToPage } = useContext(MainContext);
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

    const sections = stories[selectedStoryIndex].text.map(({ outline }) => ({ value: outline.id, label: outline.name }));

    const handleSectionChange = (selectedOption) => {
        setSelectedSectionId(selectedOption.value);
    };




    const saveToStory = async () => {
        const joinedAnswers = selectedNote.text.map(({ id, answer, refs, references }, index) => {
            if (answer.includes('https://oaidalleapiprodscus.blob')) {
                return {
                    id: generateRandomHash(8),
                    answer,
                    videosArr: [],
                    pdfsArr: [],
                    imgsArr: [],
                };
            }
            // return `<img key={${index}} src={${answer}} alt="image" />`;

            let videosArr = [];
            let pdfsArr = [];
            let imgsArr = [];

            refs.videoLinks.forEach((video) => {
                videosArr.push(video);
            });
            refs.pdfLinks.forEach((pdf) => {
                pdfsArr.push(pdf);
            });

            refs.imgLinks.forEach((img) => {
                imgsArr.push(img);
            });

            return {
                id: generateRandomHash(8),
                answer,
                videosArr,
                pdfsArr,
                imgsArr,
            };

            // return Element;
        });
        // add joinedAnswers to the selected section of the selected story
        // selectedStory.text.find(({ outline }) => outline.id === selectedSectionId).content = joinedAnswers + '<br />';
        setSelectedStory(prev => {
            const newStory = { ...prev };
            let currentText = newStory.text.find(({ outline }) => outline.id === selectedSectionId);
            currentText.content = joinedAnswers;
            // const canRenderNoteRefs = (selectedNote.text[0].refs?.videoLinks.length > 0 || selectedNote.text[0].refs?.pdfLinks.length > 0 || selectedNote.text[0].refs?.imageLinks.length > 0);
            // currentText.refsJsx = canRenderNoteRefs && (
            //     <>
            //         <div className='flex flex-col gap-2'>
            //             <h6 className='text-sm'>References:</h6>
            //             <ul className='break-all'>
            //                 {selectedNote.text[0]?.refs?.videoLinks.map((video) => (
            //                     <li key={video.source_path} className="ml-0">
            //                         <Link onClick={(event) => handleVideoLinkClick(event, video)}>
            //                             {video.source_path + " | Timestamp: " + video.timestamp}
            //                         </Link>
            //                     </li>
            //                 ))}
            //             </ul>
            //             <ul className='break-all'>
            //                 {selectedNote.text[0]?.refs?.pdfLinks.map((pdf) => (
            //                     <li key={pdf.source_path} className="ml-0">
            //                         <Link onClick={(event) => handlePDFLinkClick(event, pdf)}>
            //                             {pdf.source_path + " | Page: " + (parseInt(pdf.page) + 1)}
            //                         </Link>
            //                     </li>
            //                 ))}
            //             </ul>
            //             <ul className='break-all'>
            //                 {selectedNote.text[0]?.refs?.imgLinks.map((img) => (
            //                     <li key={img.source_path} className="ml-0">
            //                         <Link onClick={(event) => handlePDFLinkClick(event, img)}>
            //                             {img.source_path}
            //                         </Link>
            //                     </li>
            //                 ))}
            //             </ul>
            //         </div>
            //     </>
            // );
            return { ...newStory };

        });
        // sectionToBeModified.content = joinedAnswers + '<br />';

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
                    <p className={`cursor-pointer ml-full w-fit p-2 m-0 font-medium ${theme === 'light' ? 'text-textColor-300 hover:bg-light-hover-100' : 'text-textColor-100 hover:bg-background_workspace'}`} onClick={saveToStory}>Add</p>
                </Box>

            </Modal>
        </div>
    );
}

export default AddToStoryModal;