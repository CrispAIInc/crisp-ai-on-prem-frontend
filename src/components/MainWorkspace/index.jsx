import { useState, useRef, useEffect } from "react";

import { MainContext } from "../../contexts/mainContext.js";

import makeApiRequest from "../../api";

import ContentPanel from "../ContentPanel";
import Workspace from "../Workspace";
import ChatPanel from "../ChatPanel";

import "bootstrap/dist/css/bootstrap.min.css";

const MainWorkspace = ({ theme }) => {
  const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
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
  const [knowledgeBase, setKnowledgeBase] = useState([]); // Knowledge Base (Videos, Pdfs, Docs, etc) metadata
  // From Content Panel
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedFormat, setSelectedFormat] = useState("all");

  const categoryOptions = [
    { value: "all", label: "All" },
    { value: "generic", label: "Generic" },
    { value: "investment", label: "Investment" },
    { value: "human resources", label: "Human Resources" },
    { value: "customer interaction", label: "Customer Interaction" },
    { value: "documentaries", label: "Documentaries" },
    { value: "entertainment", label: "Entertainment" },
    { value: "insurance", label: "Insurance" },
    { value: "technical content", label: "Technical Content" },
  ];

  // can either be 'resource', 'note' or null
  // indicates wether the user is viewing a resource or a note in workspace
  const [activeView, setActiveView] = useState(null);

  // Additional Sources to show in the search modal (second most relevant, third most relevant, etc).
  // In the search modal, we show n videos, n pdfs, n images, in total. For now n = 3 (can be changed later).
  const [additionalSources, setAdditionalSources] = useState([]);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState({
    note_id: "",
    text: [],
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

  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState({
    story_id: "",
    text: [],
    story_name: "",
    models: [],
  });
  const [showStoryDetails, setShowStoryDetails] = useState(false);
  const [isNewStory, setIsNewStory] = useState(false);

  const llmModels = [
    { value: "gpt-4", label: "GPT-4", type: "llm", color: "#D163DA" },
    {
      value: "dall-e-3",
      label: "Dall-e-3",
      type: "image-generation",
      color: "#FF0000",
    },
    {
      value: "gpt-4-vision",
      label: "GPT-4-Vision",
      type: "lvm",
      color: "#AF8F6F",
    },
    { value: "llama-2", label: "LLAMA-2", type: "llm", color: "#388E3C" },
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
      color: "#5BBCFF",
    },
    {
      value: "claude-3-haiku",
      label: "Claude-3 (Haiku)",
      type: "llm",
      color: "#00796B",
    },
    { value: "gemini-pro", label: "Gemini Pro", type: "llm", color: "#D10363" },
  ];

  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      [{ color: [] }, { background: [] }], // Add color options
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image'],
    ],
  };

  const formats = [
    'header',
    'color', // Ensure color is included in the formats
    'background',
    'bold',
    'italic',
    'underline',
    'list',
    'bullet',
    'link',
    'image',
    'display',
  ];

  const [fromChat, setFromChat] = useState(false);
  const [isManualNote, setIsManualNote] = useState(false);
  // this indicates wether the user is using the model in the wild (MiW)
  // or using models for the selected sourcesonly
  const [isFoundationLlm, setIsFoundationLlm] = useState(true);

  useEffect(() => {
    // update the color of the text in the note editor based on the theme
    setSelectedNote((prev) => {
      // update all text where model is null
      const updatedText = prev.text.map((item) => {
        if (item.model === null) {
          return { ...item, color: theme === 'light' ? "#333" : '#fff' };
        }
        return item;
      });

      return { ...prev, text: updatedText };
    });
  }, [theme]);

  useEffect(() => {
    // set isFoundationLlm to true if there is no selectedSources, otherwise false
    setIsFoundationLlm(selectedSources.length === 0);
  }, [selectedSources]);

  const languageOptions = [
    { value: "en", label: "English" },
    { value: "af", label: "Afrikaans" },
    { value: "sq", label: "Albanian" },
    { value: "am", label: "Amharic" },
    { value: "ar", label: "Arabic" },
    { value: "hy", label: "Armenian" },
    { value: "as", label: "Assamese" },
    { value: "ay", label: "Aymara" },
    { value: "az", label: "Azerbaijani" },
    { value: "bm", label: "Bambara" },
    { value: "eu", label: "Basque" },
    { value: "be", label: "Belarusian" },
    { value: "bn", label: "Bengali" },
    { value: "bho", label: "Bhojpuri" },
    { value: "bs", label: "Bosnian" },
    { value: "bg", label: "Bulgarian" },
    { value: "ca", label: "Catalan" },
    { value: "ceb", label: "Cebuano" },
    { value: "ny", label: "Chichewa" },
    { value: "zh-CN", label: "Chinese (simplified)" },
    { value: "zh-TW", label: "Chinese (traditional)" },
    { value: "co", label: "Corsican" },
    { value: "hr", label: "Croatian" },
    { value: "cs", label: "Czech" },
    { value: "da", label: "Danish" },
    { value: "dv", label: "Dhivehi" },
    { value: "doi", label: "Dogri" },
    { value: "nl", label: "Dutch" },
    { value: "eo", label: "Esperanto" },
    { value: "et", label: "Estonian" },
    { value: "ee", label: "Ewe" },
    { value: "tl", label: "Filipino" },
    { value: "fi", label: "Finnish" },
    { value: "fr", label: "French" },
    { value: "fy", label: "Frisian" },
    { value: "gl", label: "Galician" },
    { value: "ka", label: "Georgian" },
    { value: "de", label: "German" },
    { value: "el", label: "Greek" },
    { value: "gn", label: "Guarani" },
    { value: "gu", label: "Gujarati" },
    { value: "ht", label: "Haitian Creole" },
    { value: "ha", label: "Hausa" },
    { value: "haw", label: "Hawaiian" },
    { value: "iw", label: "Hebrew" },
    { value: "hi", label: "Hindi" },
    { value: "hmn", label: "Hmong" },
    { value: "hu", label: "Hungarian" },
    { value: "is", label: "Icelandic" },
    { value: "ig", label: "Igbo" },
    { value: "ilo", label: "Ilocano" },
    { value: "id", label: "Indonesian" },
    { value: "ga", label: "Irish" },
    { value: "it", label: "Italian" },
    { value: "ja", label: "Japanese" },
    { value: "jw", label: "Javanese" },
    { value: "kn", label: "Kannada" },
    { value: "kk", label: "Kazakh" },
    { value: "km", label: "Khmer" },
    { value: "rw", label: "Kinyarwanda" },
    { value: "gom", label: "Konkani" },
    { value: "ko", label: "Korean" },
    { value: "kri", label: "Krio" },
    { value: "ku", label: "Kurdish (Kurmanji)" },
    { value: "ckb", label: "Kurdish (Sorani)" },
    { value: "ky", label: "Kyrgyz" },
    { value: "lo", label: "Lao" },
    { value: "la", label: "Latin" },
    { value: "lv", label: "Latvian" },
    { value: "ln", label: "Lingala" },
    { value: "lt", label: "Lithuanian" },
    { value: "lg", label: "Luganda" },
    { value: "lb", label: "Luxembourgish" },
    { value: "mk", label: "Macedonian" },
    { value: "mai", label: "Maithili" },
    { value: "mg", label: "Malagasy" },
    { value: "ms", label: "Malay" },
    { value: "ml", label: "Malayalam" },
    { value: "mt", label: "Maltese" },
    { value: "mi", label: "Maori" },
    { value: "mr", label: "Marathi" },
    { value: "mni-Mtei", label: "Meiteilon (Manipuri)" },
    { value: "lus", label: "Mizo" },
    { value: "mn", label: "Mongolian" },
    { value: "my", label: "Myanmar" },
    { value: "ne", label: "Nepali" },
    { value: "no", label: "Norwegian" },
    { value: "or", label: "Odia (Oriya)" },
    { value: "om", label: "Oromo" },
    { value: "ps", label: "Pashto" },
    { value: "fa", label: "Persian" },
    { value: "pl", label: "Polish" },
    { value: "pt", label: "Portuguese" },
    { value: "pa", label: "Punjabi" },
    { value: "qu", label: "Quechua" },
    { value: "ro", label: "Romanian" },
    { value: "ru", label: "Russian" },
    { value: "sm", label: "Samoan" },
    { value: "sa", label: "Sanskrit" },
    { value: "gd", label: "Scots Gaelic" },
    { value: "nso", label: "Sepedi" },
    { value: "sr", label: "Serbian" },
    { value: "st", label: "Sesotho" },
    { value: "sn", label: "Shona" },
    { value: "sd", label: "Sindhi" },
    { value: "si", label: "Sinhala" },
    { value: "sk", label: "Slovak" },
    { value: "sl", label: "Slovenian" },
    { value: "so", label: "Somali" },
    { value: "es", label: "Spanish" },
    { value: "su", label: "Sundanese" },
    { value: "sw", label: "Swahili" },
    { value: "sv", label: "Swedish" },
    { value: "tg", label: "Tajik" },
    { value: "ta", label: "Tamil" },
    { value: "tt", label: "Tatar" },
    { value: "te", label: "Telugu" },
    { value: "th", label: "Thai" },
    { value: "ti", label: "Tigrinya" },
    { value: "ts", label: "Tsonga" },
    { value: "tr", label: "Turkish" },
    { value: "tk", label: "Turkmen" },
    { value: "ak", label: "Twi" },
    { value: "uk", label: "Ukrainian" },
    { value: "ur", label: "Urdu" },
    { value: "ug", label: "Uyghur" },
    { value: "uz", label: "Uzbek" },
    { value: "vi", label: "Vietnamese" },
    { value: "cy", label: "Welsh" },
    { value: "xh", label: "Xhosa" },
    { value: "yi", label: "Yiddish" },
    { value: "yo", label: "Yoruba" },
    { value: "zu", label: "Zulu" },
  ];

  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [isStoriesLoading, setIsStoriesLoading] = useState(false);

  const [isIngestionEnabled, setIsIngestionEnabled] = useState(false);

  useEffect(() => {
    if (knowledgeBase.every((item) => item.is_selected === false)) {
      console.log("disabled");
      setIsIngestionEnabled(false);
    } else {
      console.log("enable");
      setIsIngestionEnabled(true);
    }
  }, [knowledgeBase]);

  const workspaceContainer = useRef(null);

  // create value object with all the states
  const value = {
    API_ENDPOINT,
    isIngestionEnabled, setIsIngestionEnabled,
    workspaceContainer,
    languageOptions,
    theme, activeView, setActiveView,
    chatLoaded, setChatLoaded,
    isLeftSidebarOpen, setIsLeftSidebarOpen,
    isRightSidebarOpen, setIsRightSidebarOpen,
    modules,
    formats,
    categoryOptions,
    isEditingTitle, setIsEditingTitle,
    knowledgeBase, setKnowledgeBase,
    currentResource,
    setCurrentResource,
    noteReferences, setNoteReferences,
    resourceURL,
    setResourceURL,
    jumpToPage, setJumpToPage,
    isNewStory, setIsNewStory,
    selectedGenStoriesModels, setSelectedGenStoriesModels,
    summaries, setSummaries,
    llmModels,
    videoTimestamp,
    setVideoTimestamp,
    player,
    isPlayerReady,
    isNotesLoading,
    setIsPlayerReady,
    showNoteDetails, setShowNoteDetails,
    notes,
    isManualNote, setIsManualNote,
    fromChat, setFromChat,
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
    isStoriesLoading, setIsStoriesLoading,
    summary,
    setSummary,
    noteIndex, setNoteIndex,
    stories, setStories,
    selectedStory, setSelectedStory,
    showStoryDetails, setShowStoryDetails, isFoundationLlm, setIsFoundationLlm
  };

  useEffect(() => {
    const getNotes = async () => {
      try {
        setIsNotesLoading(true);
        const data = await makeApiRequest("/notes", "post");
        setNotes(data);
        setSelectedNote({
          note_id: "",
          text: [{
            content: "", model: null, color: theme === 'light' ? "#333" : '#fff', question: '', refs: {
              videoObjects: [],
              keyframeObjects: [],
              pdfObjects: [],
              imageObjects: [],
            }
          }],
          images: [],
          note_name: "",
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsNotesLoading(false);
      }
    };

    getNotes();
  }, []);

  useEffect(() => {
    const getStories = async () => {
      try {
        setIsStoriesLoading(true);
        const data = await makeApiRequest("/stories", "get");
        setStories(data);
        setSelectedStory({
          story_id: "",
          text: [],
          story_name: "",
          models: [],
        });
      } catch (error) {
        console.error(error);
      } finally {
        setIsStoriesLoading(false);
      }
    };

    getStories();
  }, []);

  return (
    <MainContext.Provider value={value}>
      <div className="flex !h-full divide-x divide-separator main-workspace-container">
        <ContentPanel />
        <Workspace />
        <ChatPanel />
      </div>
    </MainContext.Provider>
  );
};

export default MainWorkspace;
