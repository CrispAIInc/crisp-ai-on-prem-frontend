import { useState } from "react";

import ChatPanel from "../ChatPanel";
import ContentPanel from "../ContentPanel";
import Workspace from "../Workspace";
import JoyrideTooltip, { JOYRIDE_STEPS } from '../JoyrideTooltip';

import { Helmet } from 'react-helmet';
import Joyride from 'react-joyride';

import "bootstrap/dist/css/bootstrap.min.css";
import "./MainWorkspace.css";

const MainWorkspace = ({ currentProject, setCurrentProject }) => {

  // ================== joyride =================
  const [run, setRun] = useState(true);

  return (
    <>
      <Helmet>
        <title>Crisp AI - {currentProject?.name}</title>
      </Helmet>
      <div className="flex relative !h-full divide-x divide-separator main-workspace-container">
        {/* ================ joyride ================= */}
        <Joyride
          steps={JOYRIDE_STEPS}
          run={run}
          continuous
          scrollToFirstStep
          showProgress={true}
          showSkipButton={true}
          disableOverlayClose
          spotlightPadding={6}
          components={{
            Tooltip: JoyrideTooltip,
          }}
          styles={{
            options: {
              zIndex: 10000,
              overlayColor: "rgba(0,0,0,0.55)",
              primaryColor: "#333",
            },
            spotlight: {
              borderRadius: 12,
              boxShadow: "0 0 0 9999px rgba(0,0,0,0.55)",
            },
          }}
          callback={(data) => {
            if (data.status === "finished" || data.status === "skipped") {
              setRun(false);
            }
          }}
        />

        <ContentPanel setCurrentProject={setCurrentProject} />
        <Workspace />
        <ChatPanel />
      </div>
    </>
  );
};

export default MainWorkspace;
