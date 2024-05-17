import { useContext } from 'react';
import SideCard from '../../layouts/SideCard';
import { MainContext } from '../../contexts/mainContext';

import DeleteIcon from "@mui/icons-material/Delete";

import { parseHtmlToText } from '../../utils';

function SavedStory({ story }) {

    const { theme, setSelectedStory, setActiveView } = useContext(MainContext);

    const showStory = () => {
        setSelectedStory(story);
        setActiveView('story');
    };

    return (
        <SideCard onClick={showStory}>
            {/* top */}
            <div className="flex items-center justify-between mb-1">
                <p className={`mb-0 text-sm font-semibold truncate ${theme === 'light' ? 'text-textColor-200' : 'text-white'}`}>
                    {story.story_name}
                </p>
                <span onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStory(story);
                }}>
                    <DeleteIcon color={`${theme === 'light' ? '#444' : 'error'}`} />
                </span>
            </div>
            {
                Array.isArray(story.text) && <p className={`my-0 text-xs ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'} line-clamp-2`}>{parseHtmlToText(story.text[0]?.content || story.text[1]?.content)}</p>
            }
        </SideCard>
    );
}

export default SavedStory;