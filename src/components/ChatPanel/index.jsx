import { useContext, useState } from 'react';
import GenStories from '../GenStories';
import Guide from "../Guide";

import CopilotSection from '../CopilotSection';
import { MainContext } from '../../contexts/mainContext';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';

import './chat-panel.css';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';

const ChatPanel = () => {
  const { sidebarWidth: rightWidth, sidebarWidth, handleMouseDown: handleRightMouseDown, handleDoubleClick, maxWidth, setSidebarWidth } = useResizableSidebar(200, false);

  const { chatLoaded, setChatLoaded, isRightSidebarOpen, theme } = useContext(MainContext);

  let copilotSectionSteps = [
    {
      target: '.language-dropdown',
      content: "Select a language to translate copilot chat",
      disableBeacon: true,
      placement: 'bottom'
    },
    {
      target: '.models-list-button',
      content: "Select an LLM to be used for the query processing",
      placement: 'bottom'
    },
    {
      target: '.copilot-chat-container',
      content: "This is where you interact with the LLM to generate insights",
      placement: 'bottom'
    },
  ];

  let genStorieSectionSteps = [
    {
      target: '.genstory-models-list-button',
      content: "Select an LLM to be used for the query processing",
      disableBeacon: true,
      placement: 'bottom'
    },
    {
      target: '.genstory-chat-container',
      content: "This is where you interact with the LLM to generate stories",
      placement: 'bottom'
    },
  ];

  const [activeTab, setActiveTab] = useState('genInsights');

  return (
    <div className={`relative w-1/4 h-full bg-background  ${!isRightSidebarOpen ? '!w-0 !px-0 !border-none' : "px-2"}  flex flex-col`} style={{
      width: rightWidth
    }}>
      {isRightSidebarOpen && <div
        className="absolute top-0 bottom-0 z-50 w-1 h-full hover:bg-primary-100 hover:cursor-col-resize"
        style={{ right: rightWidth }}
        onMouseDown={handleRightMouseDown}
        onDoubleClick={handleDoubleClick}
      ></div>}

      <div
        className={`px-2 py-2 rounded-md w-fit absolute right-0 h-full flex flex-col justify-center items-center z-40`}
      >
        <SwapHorizOutlinedIcon className={`cursor-pointer ${theme === 'dark' && 'text-textColor-100'}`} onClick={() => setSidebarWidth(prev => {
          if (prev !== maxWidth) return maxWidth;
          return window.innerWidth * 0.25;
        })} />
      </div>

      <Tabs
        transition={false}
        defaultActiveKey="genInsights"
        onSelect={(k) => setActiveTab(() => k)}
        id="uncontrolled-tab-example"
        className={`my-3 user-select-none text-center flex justify-center items-center !border-b-0 ${!isRightSidebarOpen && '!hidden'}`}
      >
        <Tab eventKey="genInsights" title="GenInsights" className={`flex-1 h-full overflow-y-auto`} style={{}}>
          <CopilotSection chatLoaded={chatLoaded} setChatLoaded={setChatLoaded} key={0} name="genInsights" />
          {(activeTab === 'genInsights' && (Boolean(localStorage.getItem(`guide_completed_genInsights`)) === false || localStorage.getItem(`guide_completed_genInsights`) === "false")) && <Guide steps={copilotSectionSteps} tabIdentifier="genInsights" />}
        </Tab>
        <Tab eventKey="genStories" title="GenStories" className={`flex-1 h-full overflow-y-auto`}>
          <GenStories key={2} name="genStories" sidebarWidth={sidebarWidth} />
          {(activeTab === 'genStories' && (Boolean(localStorage.getItem(`guide_completed_genStories`)) === false || localStorage.getItem(`guide_completed_genStories`) === "false")) && <Guide steps={genStorieSectionSteps} tabIdentifier="genStories" />}
        </Tab>
      </Tabs>
    </div>
  );
};

export default ChatPanel;