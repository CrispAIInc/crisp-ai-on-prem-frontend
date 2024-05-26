import { useContext, useState, useEffect } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';
import CustomInput from '../CustomInput';
import ReactQuill from 'react-quill';
import CustomButton from '../CustomButton';

import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import makeApiRequest from '../../api';
import toast from 'react-simple-toasts';
import { getLevelOfSection } from '../../utils';

function StoryDetails() {

    const { setSelectedStory, selectedStory, setActiveView, currentResource, selectedNote,
        modules, theme,
        formats, setStories } = useContext(MainContext);

    const [HTMLToDisplay, setHTMLToDisplay] = useState('');

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
    }, [selectedStory, selectedStory.text.length, theme]);

    const handleContentChange = (newContent) => {
        // console.log(newContent);
    };

    const handleSave = () => {
        if (selectedStory.story_name === "") {
            toast('Story title cannot be empty', { className: 'p-2 rounded-md shadow-[0_0px_8px_0px_rgba(0,0,0,0.15)]' });
            return;
        }
    };

    const deleteStory = async (id) => {
        try {
            await makeApiRequest(`/stories/${id}`, 'delete');
            setSelectedStory({
                story_id: "",
                text: [],
                story_name: "",
            });

            // fetch stories
            const data = await makeApiRequest("/stories", "get");
            setStories(data);
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            {/* close button */}
            <div className='flex items-center justify-end mt-3'>
                <BaseHeading text='close' className='cursor-pointer user-select-none' onClick={() => {
                    setSelectedStory({
                        story_id: "",
                        text: [],
                        story_name: "",
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
                }} />
            </div>

            {/* story editor */}
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