import { useState, useRef, useEffect } from "react";

import { MainContext } from "../../contexts/mainContext.js";

import makeApiRequest from "../../api";

import ContentPanel from "../ContentPanel";
import Workspace from "../Workspace";
import ChatPanel from "../ChatPanel";
import MetadataPanel from "../MetadataPanel";

import "bootstrap/dist/css/bootstrap.min.css";
import "./main-workspace.css";

const MainWorkspace = () => {
  const [currentResource, setCurrentResource] = useState(null); // The Selected Source (Videos, PDFs, Images) to display in the workspace
  const [resourceURL, setResourceURL] = useState(null); // The Selected Resource Direct URL

  const [videoTimestamp, setVideoTimestamp] = useState(null); // The video timestamp coming from search results
  const player = useRef(null); // Video Play in the Workspace Component
  const [isPlayerReady, setIsPlayerReady] = useState(false); // Flag indicating that the video player is rendered. So we can do a timestamp jump properly.

  const [notes, setNotes] = useState([]);
  // const [isAddingNote, setIsAddingNote] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false); // Flag indicating whether or not to show the Note Modal

  const [selectedSources, setSelectedSources] = useState([]); // Selected Sources to stage before commiting into the current Knowledge Base
  const [selectedAll, setSelectedAll] = useState(false); // Flag to handle selecting all sources (all categories, all formats)

  // From Content Panel
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");

  // Additional Sources to show in the search modal (second most relevant, third most relevant, etc).
  // In the search modal, we show n videos, n pdfs, n images, in total. For now n = 3 (can be changed later).
  const [additionalSources, setAdditionalSources] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState({
    note_id: "",
    text: [{ content: "", model: null, color: "#000" }],
    images: [],
    note_name: "Note " + parseInt(notes.length + 1),
  });
  const [isNewNote, setIsNewNote] = useState(false); // Flag indicating if the selected note is new or not

  const [summary, setSummary] = useState("");

  useEffect(() => {
    setSelectedNote({
      note_id: "",
      text: [{ content: "", model: null, color: "#000" }],
      images: [],
      note_name: "",
    });
  }, [notes]);

  // create value object with all the states
  const value = {
    currentResource,
    setCurrentResource,
    resourceURL,
    setResourceURL,
    videoTimestamp,
    setVideoTimestamp,
    player,
    isPlayerReady,
    setIsPlayerReady,
    notes,
    setNotes,
    showNoteModal,
    setShowNoteModal,
    selectedSources,
    setSelectedSources,
    selectedAll,
    setSelectedAll,
    selectedCategory,
    setSelectedCategory,
    selectedFormat,
    setSelectedFormat,
    additionalSources,
    setAdditionalSources,
    showSearchModal,
    setShowSearchModal,
    selectedNote,
    setSelectedNote,
    isNewNote,
    setIsNewNote,
    summary,
    setSummary
  };

  useEffect(() => {
    const getNotes = async () => {
      try {
        const data = await makeApiRequest("/notes", "post");
        setNotes(data);
        setSelectedNote({
          note_id: "",
          text: [{ content: "", model: null, color: "#000" }],
          images: [],
          note_name: "",
        });
      } catch (error) {
        console.error(error);
      }
    };

    getNotes();
  }, []);

  return (
    <MainContext.Provider value={value}>
      <div className="flex h-full divide-x divide-separator main-workspace-container">
        <div className="w-1/4 h-full pl-3 bg-white">
          <ContentPanel />
        </div>
        <div className="w-1/2 h-full overflow-y-auto bg-white">
          <Workspace />
        </div>

        <div className="w-1/4 h-full bg-white">
          {/* <MetadataPanel /> */}
          <ChatPanel />
        </div>
      </div>
    </MainContext.Provider>
  );
};

export default MainWorkspace;
