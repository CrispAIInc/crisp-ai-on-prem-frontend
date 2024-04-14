import { useContext, useState } from 'react';
import Toggler from '../Toggler';

import CopilotSection from '../CopilotSection';
import MetadataSection from '../MetadataSection';
import { MainContext } from '../../contexts/mainContext';


const ChatPanel = () => {

  const { chatLoaded, setChatLoaded } = useContext(MainContext);

  return (
    <div className="h-full px-2 chat-panel">
      {/* toggler */}
      <Toggler components={[
        <CopilotSection chatLoaded={chatLoaded} setChatLoaded={setChatLoaded} key={0} name="Copilot" />,

        <MetadataSection key={2} name="Metadata" />
      ]} />
    </div>
  );
};

export default ChatPanel;