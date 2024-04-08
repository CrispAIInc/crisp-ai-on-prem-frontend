import { useState } from 'react';
import Toggler from '../Toggler';

import CopilotSection from '../CopilotSection';
import MetadataSection from '../MetadataSection';
import SearchSection from '../SearchSection';

const ChatPanel = () => {
  const [chatLoaded, setChatLoaded] = useState(false);

  return (
    <div className="h-full px-2 chat-panel">
      {/* toggler */}
      <Toggler components={[
        <CopilotSection chatLoaded={chatLoaded} setChatLoaded={setChatLoaded} key={0} name="Copilot" />,
        <SearchSection chatLoaded={chatLoaded} key={1} name="Search" />,
        <MetadataSection key={2} name="Metadata" />
      ]} />
    </div>
  );
};

export default ChatPanel;