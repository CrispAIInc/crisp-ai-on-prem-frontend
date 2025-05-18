import { useContext } from 'react';
import GenStories from '../GenStories';
import Guide from "../Guide";
import NotesSection from "../NotesSection";
import StoriesSection from '../StoriesSection';
import CopilotSection from '../CopilotSection';
import { MainContext } from '../../contexts/mainContext';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';

import './chat-panel.css';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';
import MetadataGen from '../MetadataGen';

const ChatPanel = () => {
  const { sidebarWidth: rightWidth, sidebarWidth, handleMouseDown: handleRightMouseDown, handleDoubleClick, maxWidth, setSidebarWidth } = useResizableSidebar(200, false);

  const { chatLoaded, noteIndex, setNoteIndex, setChatLoaded, isRightSidebarOpen, setIsRightSidebarOpen, theme, activeTab, setActiveTab } = useContext(MainContext);

  // let copilotSectionSteps = [
  //   {
  //     target: '.language-dropdown',
  //     content: "Select a language to translate copilot chat",
  //     disableBeacon: true,
  //     placement: 'bottom'
  //   },
  //   {
  //     target: '.models-list-button',
  //     content: "Select an LLM to be used for the query processing",
  //     placement: 'bottom'
  //   },
  //   {
  //     target: '.copilot-chat-container',
  //     content: "This is where you interact with the LLM to generate insights",
  //     placement: 'bottom'
  //   },
  // ];

  // let genStorieSectionSteps = [
  //   {
  //     target: '.genstory-models-list-button',
  //     content: "Select an LLM to be used for the query processing",
  //     disableBeacon: true,
  //     placement: 'bottom'
  //   },
  //   {
  //     target: '.genstory-chat-container',
  //     content: "This is where you interact with the LLM to generate stories",
  //     placement: 'bottom'
  //   },
  // ];

  const notesSectionSteps = [
    {
      target: ".new-note-button",
      content: "Click here to create a new insight.",
      disableBeacon: true,
      placement: "right",
    },
    {
      target: ".saved-notes",
      content: "This section contains all your saved insights. Click on a saved insight to view or edit it in the workspace.",
      placement: "right",
    },
  ];

  const storiesSectionSteps = [
    {
      target: ".new-story-button",
      content: "Click here to create a new story.",
      disableBeacon: true,
      placement: "right",
    },
    {
      target: ".saved-stories",
      content: "This section contains all your saved insights. Click on a saved insight to view or edit it in the workspace.",
      placement: "right",
    }
  ];



  return (
    <aside className={`relative w-1/4 h-full bg-background  ${!isRightSidebarOpen ? '!w-0 !px-0 !border-none' : "px-2"}  flex flex-col`} style={{
      width: rightWidth
    }}>
      <div className="w-56 h-56 bg-blue-500 rounded-full absolute left-3/4 top-10 -z-0 blur-[160px]"></div>
      <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-35 top-40 -z-0 blur-[160px]"></div>
      <div className="w-56 h-56 bg-pink-300 rounded-full absolute left-1/2 top-80 -z-0 blur-[160px]"></div>
      {isRightSidebarOpen && <div
        className="absolute top-0 bottom-0 z-50 w-1 h-full hover:bg-primary-100 hover:cursor-col-resize"
        style={{ right: rightWidth }}
        onMouseDown={handleRightMouseDown}
        onDoubleClick={handleDoubleClick}
      ></div>}

      <div
        className={`px-2 py-2 rounded-md w-fit absolute right-0 h-auto top-1/2 flex flex-col justify-center items-center z-40`}
      >
        <SwapHorizOutlinedIcon className={`cursor-pointer ${theme === 'dark' && 'text-textColor-100'}`} onClick={() => {
          setSidebarWidth(prev => {
            if (prev !== maxWidth) {
              return maxWidth;
            }
            return window.innerWidth / 3.3333;
          });
          setIsRightSidebarOpen(true);
        }} />
      </div>

      <Tabs
        transition={false}
        defaultActiveKey="genInsights"
        onSelect={(k) => {
          setActiveTab(() => k);
        }}
        activeKey={activeTab}
        id="uncontrolled-tab-example"
        className={`my-3 user-select-none text-center flex justify-center items-center !border-b-0 ${!isRightSidebarOpen && '!hidden'}`}
      >
        <Tab eventKey="genMetadata" title="GenMetadata" className={`flex-1 h-full overflow-y-auto`} tabClassName={`text-primary-300`} style={{}} >
          <MetadataGen key={0} name="genMetadata" />
          {/* {(activeTab === 'genMetadata' && (Boolean(localStorage.getItem(`guide_completed_genMetadata`)) === false || localStorage.getItem(`guide_completed_genMetadata`) === "false")) && <Guide steps={copilotSectionSteps} tabIdentifier="genMetadata" />} */}
        </Tab>
        <Tab eventKey="insights" title="Insights" className='flex-1 h-full overflow-y-auto'>
          <NotesSection
            setNoteIndex={setNoteIndex}
            nodeIndex={noteIndex}
            key={2}
            name="Notes"
          />
          {(activeTab === 'insights' && (Boolean(localStorage.getItem(`guide_completed_insights`)) === false || localStorage.getItem(`guide_completed_sources`) === "false")) && <Guide steps={notesSectionSteps} tabIdentifier="insights" />}
        </Tab>
        <Tab eventKey="stories" title="Stories" className='flex-1 h-full overflow-y-auto'>
          <StoriesSection
          />
          {(activeTab === 'stories' && (Boolean(localStorage.getItem(`guide_completed_stories`)) === false || localStorage.getItem(`guide_completed_sources`) === "false")) && <Guide steps={storiesSectionSteps} tabIdentifier="stories" />}
        </Tab>
        {/* <Tab eventKey="genInsights" title="GenInsights" className={`flex-1 h-full overflow-y-auto`} tabClassName={`text-primary-300`} style={{}}>
          <CopilotSection chatLoaded={chatLoaded} setChatLoaded={setChatLoaded} sidebarWidth={sidebarWidth} key={0} name="genInsights" />
          {(activeTab === 'genInsights' && (Boolean(localStorage.getItem(`guide_completed_genInsights`)) === false || localStorage.getItem(`guide_completed_genInsights`) === "false")) && <Guide steps={copilotSectionSteps} tabIdentifier="genInsights" />}
        </Tab>
        <Tab eventKey="genStories" title="GenStories" className={`flex-1 h-full overflow-y-auto`} tabClassName={`text-primary-300`}>
          <GenStories key={2} name="genStories" sidebarWidth={sidebarWidth} />
          {(activeTab === 'genStories' && (Boolean(localStorage.getItem(`guide_completed_genStories`)) === false || localStorage.getItem(`guide_completed_genStories`) === "false")) && <Guide steps={genStorieSectionSteps} tabIdentifier="genStories" />}
        </Tab> */}
      </Tabs>
    </aside>
  );
};

export default ChatPanel;