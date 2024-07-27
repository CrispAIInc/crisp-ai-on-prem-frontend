import { useContext } from 'react';
import SideCard from '../../layouts/SideCard';
import { MainContext } from '../../contexts/mainContext';

import DeleteIcon from "@mui/icons-material/Delete";

import { parseHtmlToText } from '../../utils';

import makeApiRequest from '../../api';
import toast from 'react-simple-toasts';

function SavedStory({ story }) {

    const { theme, setSelectedStory, selectedStory, setActiveView, setStories, setIsNewStory } = useContext(MainContext);

    const showStory = () => {
        setSelectedStory(story);
        setActiveView('story');
        setIsNewStory(false);
    };

    const deleteStory = async (e, id) => {
        e.stopPropagation();
        console.log(e);
        console.log(id);
        try {
            await makeApiRequest(`/stories/${id}`, 'delete');
            setSelectedStory({
                story_id: "",
                text: [],
                story_name: "",
                models: [],
            });

            // fetch stories
            const data = await makeApiRequest("/stories", "get");
            setStories(data);
        } catch (error) {
            console.log(error);
            toast('An error occurred while deleting story', { className: 'p-2 rounded-md', theme });
        }
    };

    return (
        <SideCard onClick={showStory}>
            {/* top */}
            <div className="flex items-center justify-between mb-1">
                <p className={`mb-0 text-sm font-semibold truncate ${theme === 'light' ? 'text-textColor-200' : 'text-white'}`}>
                    {story.story_name}
                </p>
                <span onClick={(e) => {
                    deleteStory(e, story.story_id);
                }}>
                    <DeleteIcon color={`${theme === 'light' ? '#444' : 'error'}`} />
                </span>
            </div>
            {
                Array.isArray(story.text) && <div className={`my-0 text-xs ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'} line-clamp-2`}>{story.text[0]?.content[0]?.answer}</div>
            }
        </SideCard>
    );
}

export default SavedStory;