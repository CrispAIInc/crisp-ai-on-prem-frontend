import { useState } from "react";

import ChatPanel from "../ChatPanel";
import ContentPanel from "../ContentPanel";
import Workspace from "../Workspace";

import { Helmet } from 'react-helmet';
import Joyride from 'react-joyride';

import "bootstrap/dist/css/bootstrap.min.css";
import "./MainWorkspace.css";


export const JOYRIDE_STEPS = [
  {
    target: "#left_panel",
    title: "Your Workspace",
    content: "This is the main navigation panel where all your sources and tools live.",
    placement: "right",
  },
  {
    target: "#upload_sources",
    title: "Upload Sources",
    content: "Upload documents, videos, or files to start building your knowledge base.",
    placement: "right",
  },
  {
    target: "#source_explorer",
    title: "Source Explorer",
    content: "Browse, manage, and organize all your uploaded sources in one place.",
    placement: "right",
  },
  {
    target: "#discovery",
    title: "Discovery",
    content: "Explore insights and patterns extracted from your content automatically.",
    placement: "right",
  },
  {
    target: "#interaction",
    title: "Interaction",
    content: "Ask questions and interact with your content conversationally.",
  },
  {
    target: "#combined_summary",
    title: "Combined Summary",
    content: "Get a unified summary generated from multiple sources.",
  },
  {
    target: "#copilot",
    title: "AI Copilot",
    content: "Your AI assistant that helps you reason, analyze, and generate insights.",
  },
  {
    target: "#genMetadata",
    title: "Generate Metadata",
    content: "Automatically extract structured metadata from your content.",
    placement: "left",
  },
  {
    target: "#genStories",
    title: "Generate Stories",
    content: "Turn raw information into clear, engaging stories and reports.",
    placement: "left",
  },
  {
    target: "#genMedia",
    title: "Generate Media",
    content: "Create visual or multimedia outputs based on your content.",
    placement: "left",
  },
];

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
