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
    title: "Ingestion section",
    content: "This is where all your ingested (uploaded) sources live.",
    placement: "right",
  },
  {
    target: "#upload_sources",
    title: "Ingest",
    content: "Create indexes or Upload videos, files or any other documents to start building your knowledge base.",
    placement: "right",
  },
  {
    target: "#source_explorer",
    title: "Source Explorer",
    content: "Browse, manage, and organize all your ingested sources in one place.",
    placement: "right",
  },
  {
    target: "#discovery",
    title: "Discovery",
    content: "Explore moments extracted from your sources automatically.",
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
    content: "Get a unified summary generated from one or multiple sources.",
  },
  {
    target: "#copilot",
    title: "AI Copilot",
    content: "Your Crisp Wiz assistant that helps you reason, analyze, and generate insights.",
  },
  {
    target: "#genMetadata",
    title: "Generate Metadata",
    content: "Automatically extract structured metadata from your content (e.g. Chapters, Highlights, Keywords, etc.).",
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
  const [run, setRun] = useState(JSON.parse(localStorage.getItem("app_guide_completed")) !== true);


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
          callback={({ status }) => {
            if (status === "finished" || status === "skipped") {
              setRun(false);
              localStorage.setItem("app_guide_completed", true);
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
