import { useContext, useState, useEffect } from 'react';
import { MainContext } from '../../contexts/mainContext';
import BaseHeading from '../BaseHeading';
import CustomInput from '../CustomInput';
import ReactQuill from 'react-quill';
import CustomButton from '../CustomButton';

import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';

function StoryDetails() {

    const { theme, setSelectedStory, selectedStory, setActiveView, currentResource, selectedNote,
        modules,
        formats, } = useContext(MainContext);

    const [HTMLToDisplay, setHTMLToDisplay] = useState('');

    useEffect(() => {
        if (selectedStory.text) {
            const htmlString = selectedStory.text.map(item => item.content).join('<br />');
            setHTMLToDisplay(htmlString);
        }
    }, [selectedStory, selectedStory.text.length]);

    const handleContentChange = () => { };
    const handleDelete = () => { };
    const handleSave = () => { };

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
                        if (selectedNote.story_id !== '') {
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
                <CustomButton className='bg-primary-300 !my-0' onClick={handleDelete}><DeleteIcon className='text-white' /></CustomButton>
                <CustomButton onClick={handleSave} className="bg-primary-300 !my-0"> <SaveIcon className='text-white' /> </CustomButton>
            </div>
        </div>
    );
}

export default StoryDetails;