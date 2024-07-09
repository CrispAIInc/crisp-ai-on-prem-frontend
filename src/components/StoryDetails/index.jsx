import { useContext, useState, useEffect, useRef } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';
import CustomInput from '../CustomInput';
import ReactQuill from 'react-quill';
import CustomButton from '../CustomButton';

import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import makeApiRequest from '../../api';
import toast from 'react-simple-toasts';
import 'react-simple-toasts/dist/theme/dark.css';
import 'react-simple-toasts/dist/theme/light.css';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { areArraysEqual, getLevelOfSection, isSameStoryContent, transformArrayOfObjectsToArray, transformString } from '../../utils';
import LoadingSpinner from '../LoadingSpinner';
import AddIcon from '@mui/icons-material/Add';

function StoryDetails() {

    const { setSelectedStory, selectedStory, setActiveView, currentResource,
        modules, theme, stories,
        formats, setStories, isNewStory, setIsNewStory, selectedGenStoriesModels } = useContext(MainContext);

    const [HTMLToDisplay, setHTMLToDisplay] = useState('');
    const [isGeneratingIntroConclusion, setIsGeneratingIntroConlusion] = useState(false);
    const newStoryContent = useRef('');


    // useEffect(() => {
    //     if (selectedStory.text) {
    //         const htmlString = selectedStory.text.map(item => {
    //             const headingLevel = getLevelOfSection(item.outline.name);
    //             const outlineHtml = `<h${headingLevel} style='font-style: italic; font-weight: 700;'>${item.outline.name}</h${headingLevel}>`;
    //             const contentHtml = item.content;

    //             return `
    //                     <span style="color: ${theme === 'light' ? '#333' : '#ABAEB4'};">
    //                         ${outlineHtml}
    //                         ${contentHtml}
    //                     </span>
    //                 `;
    //         }).join('<br />');
    //         setHTMLToDisplay(htmlString);
    //     }
    // }, [selectedStory.text, selectedStory.text.length, theme]);

    // const handleContentChange = (newContent) => {
    //     if (isNewStory) {
    //         newStoryContent.current = newContent;
    //         selectedStory.text = transformString(newContent);
    //     }
    // };

    const handleSave = async () => {
        if (!selectedStory.story_name) {
            toast('Story title cannot be empty', { className: 'p-2 rounded-md', theme });
            return;
        }

        // let text = null;
        // if (isNewStory) {
        //     text = transformString(newStoryContent.current);
        //     setSelectedStory((prev) => ({ ...prev, text }));
        // }

        // const story = stories.find((story) => story.story_name.trim().toLowerCase() === selectedStory.story_name.trim().toLowerCase());
        // if (story) {
        //     toast('Story already exists', { className: 'p-2 rounded-md', theme });
        //     return;
        // }

        try {
            const story = stories.find(story => story.story_id === selectedStory.story_id);
            if (!story) {
                await makeApiRequest('/stories', 'post', { ...selectedStory });
            } else {
                if (stories.find(story => story.story_name.trim().toLowerCase() === selectedStory.story_name.trim().toLowerCase() && isSameStoryContent(story.text, selectedStory.text))) {
                    toast('Story with the same title already exists', { className: 'p-2 rounded-md', theme });
                    return;
                }
                await makeApiRequest(`/stories/${selectedStory.story_id}`, 'put', selectedStory);
            }
            const data = await makeApiRequest("/stories", "get");
            setStories(data);
            toast('Story saved successfully', { className: 'p-2 rounded-md', theme });
        } catch (error) {
            console.log(error);
            toast('An error occurred while saving story', { className: 'p-2 rounded-md', theme });
        }
    };

    async function autoGenerateStory() {
        if (!isNewStory) {
            setIsGeneratingIntroConlusion(true);

            const httpPayload = {
                sections: transformArrayOfObjectsToArray(selectedStory.text),
                models: selectedGenStoriesModels,
            };

            console.log(httpPayload);
            try {
                console.log("jdsf");
            }
            catch (error) {
                console.log(error);
            } finally {
                setIsGeneratingIntroConlusion(false);
            }
        }
    }
    // async function generateIntroConclusion() {
    //     if (!isNewStory) {
    //         setIsGeneratingIntroConlusion(true);
    //         // get text of selectedStory except for introduction and conclusion sections
    //         let content = "";
    //         for (let i = 0; i < selectedStory.text.length; i++) {
    //             if (selectedStory.text[i].outline.name.toLowerCase().includes('introduction')) continue;
    //             if (selectedStory.text[i].outline.name.toLowerCase().includes('conclusion')) break;
    //             content += '\n' + selectedStory.text[i].outline.name + '\n' + selectedStory.text[i].content;
    //         }

    //         const httpPayload = {
    //             content
    //         };
    //         try {
    //             const { introduction, conclusion } = await makeApiRequest(`/generate-intro-outro/${selectedStory.models[0]}`, 'post', httpPayload);

    //             setSelectedStory((prev) => {
    //                 const updatedStory = { ...prev };

    //                 updatedStory.text[0] = { ...updatedStory.text[0], content: introduction + '<br />' };

    //                 // Loop through the text array and update content where outline.name contains "conclusion"
    //                 updatedStory.text = updatedStory.text.map((textItem) => {
    //                     if (textItem.outline?.name?.toLowerCase().includes("conclusion")) {
    //                         return { ...textItem, content: conclusion + '<br />' };
    //                     }
    //                     return textItem;
    //                 });

    //                 return updatedStory;
    //             });
    //         } catch (error) {
    //             console.log(error);
    //         } finally {
    //             setIsGeneratingIntroConlusion(false);
    //         }
    //     }
    // }

    const deleteStory = async (id) => {
        try {
            await makeApiRequest(`/stories/${id}`, 'delete');
            setSelectedStory({
                story_id: "",
                text: [],
                story_name: "",
                models: []
            });

            // fetch stories
            const data = await makeApiRequest("/stories", "get");
            setStories(data);
            toast('Story deleted successfully', { className: 'p-2 rounded-md', theme });
        } catch (error) {
            console.log(error);
            toast('An error occurred while deleting story', { className: 'p-2 rounded-md', theme });
        }
    };

    const handleCloseStory = () => {
        setSelectedStory({
            story_id: "",
            text: [],
            story_name: "",
            models: []
        });
        setActiveView(() => {
            if (currentResource) {
                return 'resource';
            }
            if (selectedStory.note_id !== '') {
                console.log("hehe");
                return 'note';
            }
            return null;
        });
        setIsNewStory(false);
    };

    const [newQuestion, setNewQuestion] = useState('');
    const [currentAddingAnswerId, setCurrentAddingAnswerId] = useState("");
    const [newAnswer, setNewAnswer] = useState('');
    const titleRef = useRef(null);


    function handleOpenNewQuestionBox() {
        setIsAddingNewQuestion(true);
    }
    function handleOpenNewAnswerBox(id) {
        setCurrentAddingAnswerId(id);
    }

    const questionRefs = useRef({});
    const answerRefs = useRef({});

    function handleDeleteContent(id) {
        setSelectedStory((prev) => {
            const updatedStory = { ...prev };
            updatedStory.text = updatedStory.text.filter((item) => item.id !== id);
            return updatedStory;
        });
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* close button */}
            <div className='flex items-center justify-end mt-3'>
                <BaseHeading text='close' className='cursor-pointer user-select-none' onClick={handleCloseStory} />
            </div>

            {/* story editor */}
            {/*intro/conc generation */}
            {selectedStory.text.length > 0 && <div
                className={`user-select-none flex items-center justify-center gap-2 px-1 py-1 rounded-md cursor-pointer w-fit text-sm ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                onClick={() => autoGenerateStory()}
            >
                <AutoAwesomeOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} ${isGeneratingIntroConclusion && 'flex items-center gap-2'}`}>
                    {isGeneratingIntroConclusion ? (
                        <>
                            <LoadingSpinner videoSpinner={true} /> <span>Generating Story...</span>
                        </>
                    ) : 'Auto generate story'}
                </span>
            </div>}
            {/* title */}
            <div className={`mt-2 mb-5 flex items-end gap-3 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                <h3 className='m-0'>Title:</h3>
                <h4 className='m-0' ref={titleRef} contentEditable onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        setIsNewStory(false);
                        setSelectedStory(prev => ({ ...prev, story_name: titleRef.current.innerText }));
                        titleRef.current.blur();
                        // handleSave(e);
                    }
                }}>{selectedStory.story_name}</h4>
            </div>


            <div className={`mb-5 overflow-y-auto ${theme === 'light' ? 'text-textColor-300' : 'text-light-hover-100'}`}>
                {selectedStory.text?.map((item) => (
                    <div key={item.id} className="flex flex-col gap-4 px-3">
                        {/* question */}
                        {
                            item.outline.name ?
                                <div className='flex items-center gap-2 align-self-end'>
                                    <div className="flex gap-2">
                                        <DeleteIcon fontSize="small" className='cursor-pointer' onClick={() => handleDeleteContent(item.id)} />
                                    </div>
                                    <div className={`flex items-center gap-3 py-1 px-3 ${theme === 'light' ? 'bg-light-hover-200' : 'bg-textColor-300 w-fit rounded-md'}`}>
                                        <p contentEditable ref={(el) => (questionRefs.current[item.id] = el)} onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                setIsNewStory(false);
                                                // update outline name
                                                setSelectedStory(prev => {
                                                    const newStory = { ...prev };
                                                    newStory.text.find((note) => note.id === item.id).outline.name = questionRefs.current[item.id].innerText;
                                                    return newStory;
                                                });
                                                questionRefs.current[item.id].blur();
                                                // handleSave(e);
                                            }
                                        }}>{item.outline.name}</p>
                                    </div>
                                </div>
                                : null
                        }
                        {/* answer */}
                        <div className='flex items-center gap-4'>
                            <div>
                                {
                                    item.content ? (
                                        <div className='flex items-center gap-2'>
                                            <div className={`flex flex-col  gap-3 py-2 px-3 ${theme === 'light' ? 'bg-light-hover-200' : 'bg-background w-fit rounded-md'} align-self-start max-w-[80%]`}>
                                                <p className='' contentEditable ref={el => (answerRefs.current[item.id] = el)} onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        setIsNewStory(false);
                                                        // update content
                                                        setSelectedStory(prev => {
                                                            const newStory = { ...prev };
                                                            newStory.text.find((note) => note.id === item.id).content = answerRefs.current[item.id].innerText;
                                                            return newStory;
                                                        });
                                                        answerRefs.current[item.id].blur();
                                                        // handleSave(e);
                                                    }
                                                }}>{item.content}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <DeleteIcon fontSize="small" className='cursor-pointer' onClick={() => handleDeleteContent(item.id)} />
                                            </div>
                                        </div>) : currentAddingAnswerId !== item.id ? (
                                            <div className={`flex items-center py-1 px-3 ${theme === 'light' ? 'bg-light-hover-200' : 'bg-background w-fit rounded-md'} align-self-start cursor-pointer`}
                                                onClick={() => handleOpenNewAnswerBox(item.id)}>
                                                <AddIcon fontSize='small' />
                                            </div>
                                        ) : (
                                        <div className="flex flex-col">
                                            <div>
                                                <textarea rows='5' className={`w-full h-auto outline-none p-1 ${theme === 'dark' ? '!border !border-textColor-300 bg-black text-textColor-100' : 'border'}`} placeholder='Answer' value={newAnswer} onChange={(e) => setNewAnswer(e.target.value)} />
                                            </div>
                                            <div className="flex items-center justify-end gap-2">
                                                <CustomButton className='my-0' onClick={() => setCurrentAddingAnswerId("")}>Cancel</CustomButton>
                                                <CustomButton className='my-0'>Save</CustomButton>
                                            </div>
                                        </div>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* questions/answers */}
            <CustomButton className={`ml-auto ${theme === 'light' ? 'bg-white border border-light-hover-200' : 'text-white bg-black'}`} onClick={e => handleSave(e)}>Save</CustomButton>

            {/* story title
            <div className="my-4">
                <CustomInput className="py-2" placeholder='story title' value={selectedStory.story_name} onChange={(e) => setSelectedStory(prev => ({ ...prev, story_name: e.target.value }))} />
            </div>

            <ReactQuill className='#editor h-auto' theme="snow" value={HTMLToDisplay} onChange={handleContentChange}
                modules={modules}
                formats={formats} />

            <div className="flex items-center justify-end gap-2 mt-2">
                <CustomButton className='bg-primary-300 !my-0' onClick={() => deleteStory(selectedStory.story_id)}><DeleteIcon className='text-white' /></CustomButton>
                <CustomButton onClick={handleSave} className="bg-primary-300 !my-0"> <SaveIcon className='text-white' /> </CustomButton>
            </div> */}
        </div>
    );
}

export default StoryDetails;