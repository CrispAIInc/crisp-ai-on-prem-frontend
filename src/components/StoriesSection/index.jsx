import { useContext } from 'react';
// import SideCard from "../../layouts/SideCard";
import { MainContext } from '../../contexts/mainContext';

import AddOutlinedIcon from '@mui/icons-material/AddOutlined';

function StoriesSection() {

  const { theme, setActiveView } = useContext(MainContext);

  function handleNewStoryClick() {
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
    </div>
  );
}

export default StoriesSection;