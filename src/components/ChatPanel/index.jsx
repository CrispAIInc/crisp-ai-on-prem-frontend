import Toggler from '../Toggler';

import CopilotSection from '../CopilotSection';
import MetadataSection from '../MetadataSection';
import SearchSection from '../SearchSection';

const ChatPanel = () => {
  return (
    <div className="h-full px-3 chat-panel">
      {/* toggler */}
      <Toggler components={[
        <CopilotSection key={0} name="Copilot" />,
        <SearchSection key={1} name="Search" />,
        <MetadataSection key={2} name="Metadata" />
      ]} />
    </div>
  );
};

export default ChatPanel;