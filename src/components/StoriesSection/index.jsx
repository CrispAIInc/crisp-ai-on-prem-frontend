import { useContext } from 'react';
// import SideCard from "../../layouts/SideCard";
import { MainContext } from '../../contexts/mainContext';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import BaseHeading from '../BaseHeading';
import SavedStory from '../SavedStory';
import NoData from "../NoData";

function StoriesSection() {

  const { theme, setActiveView, stories, setSelectedStory, setIsNewStory } = useContext(MainContext);

  function handleNewStoryClick() {
    setSelectedStory({
      story_id: "",
      text: [],
      story_name: "",
      models: [],
    });
    setIsNewStory(true);
    setActiveView('story');
  }

  return (
    <div className='mt-7'>
      {/* New Story */}
      <div
        className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit mb-4 ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
        onClick={handleNewStoryClick}
      >
        <AddOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
        <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>New Story</span>
      </div>

      <BaseHeading text='Saved stories' />
      {stories.length > 0 ? (
        <div>
          <div className="flex flex-col gap-10 px-1 pb-5 mt-4 mr-2 ">
            {stories.map((story, i) => (
              <SavedStory
                key={i}
                story={story}
              />
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <NoData />
        </div>
      )}
    </div>
  );
}

export default StoriesSection;