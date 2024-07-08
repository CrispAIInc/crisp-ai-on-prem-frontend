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

function StoryDetails() {

    const { setSelectedStory, selectedStory, setActiveView, currentResource, selectedNote,
        modules, theme, stories,
        formats, setStories, isNewStory, setIsNewStory, selectedGenStoriesModels } = useContext(MainContext);

    const [HTMLToDisplay, setHTMLToDisplay] = useState('');
    const [isGeneratingIntroConclusion, setIsGeneratingIntroConlusion] = useState(false);
    const newStoryContent = useRef('');


    useEffect(() => {
        if (selectedStory.text) {
            const htmlString = selectedStory.text.map(item => {
                const headingLevel = getLevelOfSection(item.outline.name);
                const outlineHtml = `<h${headingLevel} style='font-style: italic; font-weight: 700;'>${item.outline.name}</h${headingLevel}>`;
                const contentHtml = item.content;

                return `
                        <span style="color: ${theme === 'light' ? '#333' : '#ABAEB4'};">
                            ${outlineHtml}
                            ${contentHtml}
                        </span>
                    `;
            }).join('<br />');
            setHTMLToDisplay(htmlString);
        }
    }, [selectedStory.text, selectedStory.text.length, theme]);

    const handleContentChange = (newContent) => {
        if (isNewStory) {
            newStoryContent.current = newContent;
            selectedStory.text = transformString(newContent);
        }
    };

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
            const story = stories.find(story => story.story_id === selectedStory.story_id || (story.story_name.trim().toLowerCase() === selectedStory.story_name.trim().toLowerCase() && isSameStoryContent(story.text, selectedStory.text)));
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
            if (selectedNote.note_id !== '') {
                console.log("hehe");
                return 'note';
            }
            return null;
        });
        setIsNewStory(false);
    };

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
            {/* intro/conc generation
            {selectedStory.text.length > 0 && <div
                className={`user-select-none flex items-center justify-center gap-2 px-1 py-1 rounded-md cursor-pointer w-fit text-sm ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                onClick={() => generateIntroConclusion()}
            >
                <AutoAwesomeOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} ${isGeneratingIntroConclusion && 'flex items-center gap-2'}`}>
                    {isGeneratingIntroConclusion ? (
                        <>
                            <LoadingSpinner videoSpinner={true} /> <span>Generating...</span>
                        </>
                    ) : 'Generate Introduction/Conclusion'}
                </span>
            </div>} */}
            {/* story title */}
            <div className="my-4">
                <CustomInput className="py-2" placeholder='story title' value={selectedStory.story_name} onChange={(e) => setSelectedStory(prev => ({ ...prev, story_name: e.target.value }))} />
            </div>

            <ReactQuill className='#editor h-auto' theme="snow" value={HTMLToDisplay} onChange={handleContentChange}
                modules={modules}
                formats={formats} />

            <div className="flex items-center justify-end gap-2 mt-2">
                <CustomButton className='bg-primary-300 !my-0' onClick={() => deleteStory(selectedStory.story_id)}><DeleteIcon className='text-white' /></CustomButton>
                <CustomButton onClick={handleSave} className="bg-primary-300 !my-0"> <SaveIcon className='text-white' /> </CustomButton>
            </div>
        </div>
    );
}

export default StoryDetails;