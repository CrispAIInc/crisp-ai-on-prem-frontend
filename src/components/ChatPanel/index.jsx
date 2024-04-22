import { useContext, useState } from 'react';
import GenStories from '../GenStories';

import CopilotSection from '../CopilotSection';
import MetadataSection from '../MetadataSection';
import { MainContext } from '../../contexts/mainContext';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import './chat-panel.css';

const ChatPanel = () => {

  const { chatLoaded, setChatLoaded, isRightSidebarOpen } = useContext(MainContext);

  return (
    <div className={`w-1/4 h-full bg-background transition-width duration-500 ${!isRightSidebarOpen ? '!w-0 !px-0 !border-none' : "px-2"}  flex flex-col`}>
      {/* toggler */}
      {/* <Toggler components={[
        <CopilotSection chatLoaded={chatLoaded} setChatLoaded={setChatLoaded} key={0} name="Copilot" />,

        <MetadataSection key={2} name="Metadata" />
      ]} /> */}

      <Tabs
        transition={false}
        defaultActiveKey="genInsights"
        id="uncontrolled-tab-example"
        className="my-3 text-center flex justify-center items-center !border-b-0"
      >
        <Tab eventKey="genInsights" title="GenInsights" className='flex-1 h-full overflow-y-auto'>
          <CopilotSection chatLoaded={chatLoaded} setChatLoaded={setChatLoaded} key={0} name="genInsights" />
        </Tab>
        <Tab eventKey="genStories" title="GenStories" className='flex-1 h-full overflow-y-auto'>
          <GenStories key={2} name="genStories" />
        </Tab>
        <Tab eventKey="metadata" title="Metadata" className='flex-1 h-full overflow-y-auto'>
          <MetadataSection key={2} name="Metadata" />
        </Tab>
      </Tabs>
    </div>
  );
};

export default ChatPanel;