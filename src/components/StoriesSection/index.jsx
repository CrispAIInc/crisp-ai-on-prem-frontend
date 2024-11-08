import { memo, useContext } from 'react';
import { MainContext } from '../../contexts/mainContext';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import BaseHeading from '../BaseHeading';
import SavedStory from '../SavedStory';
import StickyStory from "../StickyStory";
import NoData from "../NoData";
import SavedStorySkeleton from '../Skeletons/SavedStorySkeleton';
import StackedPaperEffect from '../StackedPaperEffect';

function StoriesSection() {

  const { theme, setActiveView, stories, setSelectedStory, setIsNewStory, isStoriesLoading } = useContext(MainContext);

  function handleNewStoryClick() {
    setSelectedStory({
      story_id: new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
      text: [],
      story_name: "new story",
      models: [],
    });
    setIsNewStory(true);
    setActiveView('story');
  }
  return (
    <section className='stories-section mt-7'>
      {/* New Story */}
      <div
        className={`new-story-button flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit mb-4 ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
        onClick={handleNewStoryClick}
      >
        <AddOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
        <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>New Story</span>
      </div>

      <BaseHeading text='Saved stories' />
      <div className="saved-stories">
        {
          isStoriesLoading ? (
            <>
              <div className="flex flex-wrap gap-5">
                {
                  [1, 2, 3].map((item) => (
                    <SavedStorySkeleton key={item} className='px-1 mt-4 mr-2' />
                  ))
                }
              </div>
            </>
          ) :
            stories.length > 0 ? (
              <div>
                <div className="flex flex-wrap gap-10 px-1 pb-5 mt-4 mr-2 ">
                  {stories.map((story) => (
                    // <StickyStory
                    //   key={story.story_id}
                    //   story={story}
                    // />
                    <StackedPaperEffect
                      key={story.story_id}
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
    </section>
  );
}

export default memo(StoriesSection);