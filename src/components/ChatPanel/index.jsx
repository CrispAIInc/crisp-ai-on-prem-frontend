import { useContext, useState } from 'react';
import Toggler from '../Toggler';

import CopilotSection from '../CopilotSection';
import MetadataSection from '../MetadataSection';
import { MainContext } from '../../contexts/mainContext';

import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';

import './chat-panel.css';

const ChatPanel = () => {

  const { chatLoaded, setChatLoaded, isRightSidebarOpen } = useContext(MainContext);

  return (
    <div className={`w-1/4 h-full px-2 bg-background transition-width duration-500 ${!isRightSidebarOpen && '!w-0 !p-0'}  flex flex-col`}>
      {/* toggler */}
      {/* <Toggler components={[
        <CopilotSection chatLoaded={chatLoaded} setChatLoaded={setChatLoaded} key={0} name="Copilot" />,

        <MetadataSection key={2} name="Metadata" />
      ]} /> */}

      <Tabs
        transition={false}
        defaultActiveKey="copilot"
        id="uncontrolled-tab-example"
        className="my-3 text-center flex justify-center items-center !border-b-0"
      >
        <Tab eventKey="copilot" title="Copilot" className='flex-1 overflow-y-auto h-full'>
          <CopilotSection chatLoaded={chatLoaded} setChatLoaded={setChatLoaded} key={0} name="Copilot" />
        </Tab>
        <Tab eventKey="metadata" title="Metadata" className='flex-1 overflow-y-auto h-full'>
          <MetadataSection key={2} name="Metadata" />
        </Tab>
      </Tabs>
    </div>
  );
};

export default ChatPanel;