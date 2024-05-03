import { useContext } from 'react';
import GenStories from '../GenStories';

import CopilotSection from '../CopilotSection';
import { MainContext } from '../../contexts/mainContext';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import './chat-panel.css';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';

const ChatPanel = () => {
  const { sidebarWidth: rightWidth, handleMouseDown: handleRightMouseDown } = useResizableSidebar(200, false);

  const { chatLoaded, setChatLoaded, isRightSidebarOpen } = useContext(MainContext);

  return (
    <div className={`relative w-1/4 h-full bg-background  ${!isRightSidebarOpen ? '!w-0 !px-0 !border-none' : "px-2"}  flex flex-col`} style={{
      width: rightWidth
    }}>
      {isRightSidebarOpen && <div
        className="absolute top-0 bottom-0 z-50 w-1 h-full hover:bg-primary-100 hover:cursor-col-resize"
        style={{ right: rightWidth }}
        onMouseDown={handleRightMouseDown}
      ></div>}

      <Tabs
        transition={false}
        defaultActiveKey="genInsights"
        id="uncontrolled-tab-example"
        className={`my-3 user-select-none text-center flex justify-center items-center !border-b-0 ${!isRightSidebarOpen && '!hidden'}`}
      >
        <Tab eventKey="genInsights" title="GenInsights" className={`flex-1 h-full overflow-y-auto`} style={{}}>
          <CopilotSection chatLoaded={chatLoaded} setChatLoaded={setChatLoaded} key={0} name="genInsights" />
        </Tab>
        <Tab eventKey="genStories" title="GenStories" className={`flex-1 h-full overflow-y-auto`} style={{}}>
          <GenStories key={2} name="genStories" />
        </Tab>
      </Tabs>
    </div>
  );
};

export default ChatPanel;