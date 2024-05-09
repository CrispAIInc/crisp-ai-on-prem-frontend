import { useState, useRef, useEffect } from "react";

import { MainContext } from "../../contexts/mainContext.js";

import makeApiRequest from "../../api";

import ContentPanel from "../ContentPanel";
import Workspace from "../Workspace";
import ChatPanel from "../ChatPanel";

import "bootstrap/dist/css/bootstrap.min.css";

const MainWorkspace = ({ theme }) => {
  const [currentResource, setCurrentResource] = useState(null); // The Selected Source (Videos, PDFs, Images) to display in the workspace
  const [resourceURL, setResourceURL] = useState(null); // The Selected Resource Direct URL

  const [videoTimestamp, setVideoTimestamp] = useState(null); // The video timestamp coming from search results
  const player = useRef(null); // Video Play in the Workspace Component
  const [isPlayerReady, setIsPlayerReady] = useState(false); // Flag indicating that the video player is rendered. So we can do a timestamp jump properly.

  const [notes, setNotes] = useState([]);
  // const [isAddingNote, setIsAddingNote] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false); // Flag indicating whether or not to show the Note Modal
  const [showNoteDetails, setShowNoteDetails] = useState(false);

  const [selectedSources, setSelectedSources] = useState([]); // Selected Sources to stage before commiting into the current Knowledge Base
  const [selectedAll, setSelectedAll] = useState(false); // Flag to handle selecting all sources (all categories, all formats)

  // From Content Panel
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");

  // can either be 'resource', 'note' or null
  // indicates wether the user is viewing a resource or a note in workspace
  const [activeView, setActiveView] = useState(null);

  // Additional Sources to show in the search modal (second most relevant, third most relevant, etc).
  // In the search modal, we show n videos, n pdfs, n images, in total. For now n = 3 (can be changed later).
  const [additionalSources, setAdditionalSources] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState({
    note_id: "",
    text: [{ content: "", model: null, color: theme === "light" ? "#333" : "#fff" }],
    images: [],
    note_name: "Note " + parseInt(notes.length + 1),
  });
  const [noteIndex, setNoteIndex] = useState(0);
  const [isNewNote, setIsNewNote] = useState(false); // Flag indicating if the selected note is new or not
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [chatLoaded, setChatLoaded] = useState(false);
  const [summary, setSummary] = useState("");
  const [summaries, setSummaries] = useState("");

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [selectedGenStoriesModels, setSelectedGenStoriesModels] = useState(['gpt-4']);
  const [jumpToPage, setJumpToPage] = useState({ page: -1 });
  const [noteReferences, setNoteReferences] = useState({
    videoLinks: [],
    pdfLinks: [],
    imageLinks: [],
  });

  const llmModels = [
    { value: "gpt-4", label: "GPT-4", type: "llm", color: "#D163DA" },
    {
      value: "dall-e-3",
      label: "Dall-e-3",
      type: "image-generation",
      color: "#3F51B5",
    },
    {
      value: "gpt-4-vision",
      label: "GPT-4-Vision",
      type: "lvm",
      color: "#4527A0",
    },
    // { value: "llama-2", label: "LLAMA-2", type: "llm", color: "#388E3C" },
    {
      value: "mistral-8x7b",
      label: "Mistral LLM",
      type: "llm",
      color: "#EF6C00",
    },
    {
      value: "claude-3-opus",
      label: "Claude-3 (Opus)",
      type: "llm",
      color: "#FBC02D",
    },
    {
      value: "claude-3-sonnet",
      label: "Claude-3 (Sonnet)",
      type: "llm",
      color: "#616161",
    },
    // { value: "gemini", label: "Gemini", type: "llm", color: "#00796B" },
  ];

  const [isManualNote, setIsManualNote] = useState(false);

  useEffect(() => {
    setSelectedNote({
      note_id: "",
      text: [{ content: "", model: null, color: theme === 'light' ? "#333" : '#fff', question: '', references: [] }],
      images: [],
      note_name: "",
    });
    // setShowNoteDetails(false);
  }, [notes]);

  // useEffect(() => {
  //   setSelectedNote(prevNote => ({
  //     ...prevNote,
  //     text: prevNote.text.map(item => ({
  //       ...item,
  //       color: item.color === '#333' || item.color === '#fff' ? (theme === 'light' ? '#333' : '#fff') : item.color
  //     }))
  //   }));
  // }, [theme]);

  // create value object with all the states
  const value = {
    theme, activeView, setActiveView,
    chatLoaded, setChatLoaded,
    isLeftSidebarOpen, setIsLeftSidebarOpen,
    isRightSidebarOpen, setIsRightSidebarOpen,
    isEditingTitle, setIsEditingTitle,
    currentResource,
    setCurrentResource,
    noteReferences, setNoteReferences,
    resourceURL,
    setResourceURL,
    jumpToPage, setJumpToPage,
    selectedGenStoriesModels, setSelectedGenStoriesModels,
    summaries, setSummaries,
    llmModels,
    videoTimestamp,
    setVideoTimestamp,
    player,
    isPlayerReady,
    setIsPlayerReady,
    showNoteDetails, setShowNoteDetails,
    notes,
    isManualNote, setIsManualNote,
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
    setSummary,
    noteIndex, setNoteIndex
  };

  useEffect(() => {
    const getNotes = async () => {
      try {
        const data = await makeApiRequest("/notes", "post");
        setNotes(data);
        setSelectedNote({
          note_id: "",
          text: [{ content: "", model: null, color: theme === 'light' ? "#333" : '#fff', question: '', references: [] }],
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
        <ContentPanel />
        {/* <div className="w-1/2 h-full overflow-y-auto bg-background_workspace"> */}
        <Workspace />
        {/* </div> */}
        <ChatPanel />
      </div>
    </MainContext.Provider>
  );
};

export default MainWorkspace;
