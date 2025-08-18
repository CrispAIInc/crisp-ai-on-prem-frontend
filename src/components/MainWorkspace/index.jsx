import { useState, useRef, useEffect } from "react";

import { MainContext } from "../../contexts/mainContext.js";

import makeApiRequest from "../../api";

import ContentPanel from "../ContentPanel";
import Workspace from "../Workspace";
import ChatPanel from "../ChatPanel";

import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';

import "bootstrap/dist/css/bootstrap.min.css";

const MainWorkspace = ({ theme, setTheme }) => {
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

  const [sourcesTobeCommited, setSourcesTobeCommited] = useState([]); // Sources to be commited to the Knowledge Base

  // const categoryOptions = [
  //   { value: "all", label: "All" },
  //   { value: "generic", label: "Generic" },
  //   { value: "investment", label: "Investment" },
  //   { value: "human resources", label: "Human Resources" },
  //   { value: "customer interaction", label: "Customer Interaction" },
  //   { value: "documentaries", label: "Documentaries" },
  //   { value: "entertainment", label: "Entertainment" },
  //   { value: "insurance", label: "Insurance" },
  //   { value: "technical content", label: "Technical Content" },
  // ];

  /**
   * .pdf, .doc, .docx, .xls, .xlsx, .ppt, .pptx, application/pdf, application/msword, application/vnd.ms-excel, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.presentationml.presentation
   */
  const fileFormats = [
    {
      label: "PDF",
      icon: <InsertDriveFileOutlinedIcon />,
      extensions: [".pdf"],
      value: "pdf"
    },
    {
      label: "Image",
      icon: <InsertPhotoOutlinedIcon />,
      extensions: [".jpg", ".jpeg", ".png", "image/*", ".gif", ".bmp", ".webp"],
      value: "img"
    },
    {
      label: "Video",
      icon: <SlideshowOutlinedIcon />,
      extensions: [".mp4", ".mov", ".avi", ".wmv", ".mkv", ".webm", "video/*"],
      value: "video"
    }
  ];

  const [categoryOptions, setCategoryOptions] = useState([]);
  useEffect(() => {
    async function getIndexes() {
      let { indexes } = await makeApiRequest("/get-indexes");
      // transform the indexes to the format value/label
      indexes = indexes.map((index) => {
        return {
          value: index,
          label: index.charAt(0).toUpperCase() + index.slice(1),
        };
      });
      setCategoryOptions(indexes);
    }

    getIndexes();
  }, []);

  const contentPanelContainerRef = useRef(null);


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

  const [displayedSources, setDisplayedSources] = useState([]);

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

  const [activeTab, setActiveTab] = useState('genMetadata');

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

  // useEffect(() => {
  //   setSelectedSources(sourcesTobeCommited);
  // }, [sourcesTobeCommited]);

  const commitSelectedSources = (items) => {
    console.log(items);
    if (items?.length === 0) {
      // setSelectedSources(sourcesTobeCommited);
      knowledgeBase.map((item) => {
        if (item.is_selected) {
          setSelectedSources((prev) => {
            const itemExist = prev.find(i => i.source_path === item.source_path);
            if (!itemExist) {
              return [
                ...prev,
                {
                  source_path: item.source_path,
                  category: item.category,
                  file_type: item.file_type,
                },
              ];
            }
            return prev;
          });
        } else {
          setSelectedSources((prev) =>
            prev.filter((source) => source !== item.source_path)
          );
        }
        return item;
      });
    } else {
      setSelectedSources(items.map(i => i));
    }
  };

  useEffect(() => {
    // add all selected sources from knowledgebase to displayedsources
    setDisplayedSources(prev => {
      const newSources = knowledgeBase.filter(item => item.is_selected && !prev.some(i => i.source_path === item.source_path));
      return [...prev, ...newSources];
    });
  }, [knowledgeBase]);

  const [, setTranscription] = useState("");

  const onThumbnailClick = (event, file, isFromCheckbox = false) => {
    if (event) event.preventDefault();
    const resourceURL = `${import.meta.env.VITE_API_ENDPOINT
      }/${file.file_type}/all/${encodeURIComponent(file.source_path)}`;
    let fileToCommit = knowledgeBase.find((item) => item.source_path === file.source_path) || file;
    setCurrentResource(fileToCommit);
    setResourceURL(resourceURL);
    setTranscription(fileToCommit.metadata ? fileToCommit.metadata.transcription : "");
    if (fileToCommit.file_type != "img") {
      setSummary(fileToCommit.summary);
      setSummaries(fileToCommit.topic_summaries);
    }

    // set jumpToPage to 1 so that the PDF reader displays all the pages from page 1 and not jump to a specific page life the case when clicking on a reference
    if (fileToCommit.file_type === "pdf") {
      setJumpToPage({ page: -1 });
    }
    setActiveView('resource');
    if (!isFromCheckbox) { setShowMetadata(true); }
  };

  const handleCheckboxChange = (isChecked, file) => {
    // Create a new array with updated items
    const updatedKnowledgeBase = knowledgeBase.map((item) => {
      if (item.source_path === file.source_path) {
        return { ...item, is_selected: !item.is_selected };
      }
      if (item.is_selected) setSelectedAll(false);
      return item;
    });
    setKnowledgeBase(updatedKnowledgeBase);

    // update displayedsources such that if file.is_source is true, add it to displayedsources otherwise if it is already in displayedsources, just make its property "is_selected" to false without removing it from displayedsources
    setDisplayedSources((prev) => {
      const exists = prev.find((item) => item.source_path === file.source_path);
      // const fileFromKb = knowledgeBase.find((item) => item.source_path === file.source_path);
      if (!file.is_selected) {
        if (!exists) {
          return [...prev, { ...file, is_selected: true }];
        } else if (exists) {
          return prev.map((item) => {
            if (item.source_path === file.source_path) {
              return { ...item, is_selected: true };
            }
            return item;
          });
          // return [...prev, {...file, is_selected: false}]
        }
      } else {
        if (exists) {
          return prev.map((item) => {
            if (item.source_path === file.source_path) {
              return { ...item, is_selected: false };
            }
            return item;
          });
        }
      }

      return prev;
    });

    // item should exist in selectedSources and isSelected is true => remove it from selectedSources
    if (file.is_selected && selectedSources.some((item) => item.source_path === file.source_path)) {
      setSelectedSources((prev) => prev.filter((item) => item.source_path !== file.source_path));
      // setSourcesTobeCommited((prev) => prev.filter((item) => item.source_path !== file.source_path));
      // setSourcesAfterUncheckCrispWiz(sourcesTobeCommited);
    }

    // updated sourcesTobeCommiter
    // if (!file.is_selected) {
    //   setSourcesTobeCommited((prev) => [...prev, { ...file, is_selected: true }]);
    //   // setSourcesAfterUncheckCrispWiz(sourcesTobeCommited);
    // }
    // else {
    //   setSourcesTobeCommited((prev) => prev.filter((item) => item.source_path !== file.source_path));
    //   // setSourcesAfterUncheckCrispWiz(sourcesTobeCommited);
    // }

    if (isChecked === true) {
      onThumbnailClick(undefined, file, true);
      // setShowMetadata(false);
    }
  };

  const [selectedCategoryChat] = useState("all");

  useEffect(() => {
    setChatLoaded(false);
    if (sourcesWithExclusive?.find(item => item === currentResource?.source_path)?.length > 0) {
      // checked
    } else {
      // unchecked
    }
    // setCommittedSources(selectedSources);
    async function fetchChat() {
      console.log('here: ', selectedCategoryChat);
      const data = await makeApiRequest(
        `/chat/${selectedCategoryChat}`,
        "post",
        JSON.stringify({
          sources: selectedSources?.filter(item => item?.metadata?.embeddings_generated),
          category: selectedCategoryChat,
          selectedAll,
          is_exclusive: Boolean(sourcesWithExclusive?.find(item => item === currentResource?.source_path)?.length)
        })
      );
      setChatLoaded(data?.chat_is_initialized);
    }

    fetchChat();
  }, [selectedCategoryChat, selectedSources]);

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
  const [isExclusiveChecked, setIsExclusiveChecked] = useState(false);
  useEffect(() => {
    // set isFoundationLlm to true if there is no selectedSources, otherwise false
    setIsFoundationLlm(selectedSources.length === 0 || (displayedSources?.some(item => item?.is_selected) ? false : true));
    if (!isExclusiveChecked) {
      setCommittedSources(selectedSources);
    }
  }, [selectedSources]);

  useEffect(() => {
    setIsFoundationLlm(displayedSources?.some(item => item?.is_selected) ? false : true);
  }, [displayedSources]);

  const languageOptions = [
    {
      value: "en",
      label: "English",
      originalLabel: "English"
    },
    {
      value: "af",
      label: "Afrikaans",
      originalLabel: "Afrikaans"
    },
    {
      value: "sq",
      label: "Albanian",
      originalLabel: "shqip"
    },
    {
      value: "am",
      label: "Amharic",
      originalLabel: "አማርኛ"
    },
    {
      value: "ar",
      label: "Arabic",
      originalLabel: "العربية"
    },
    {
      value: "hy",
      label: "Armenian",
      originalLabel: "հայերեն"
    },
    {
      value: "as",
      label: "Assamese",
      originalLabel: "অসমীয়া"
    },
    {
      value: "ay",
      label: "Aymara",
      originalLabel: "Aymara"
    },
    {
      value: "az",
      label: "Azerbaijani",
      originalLabel: "azərbaycan"
    },
    {
      value: "bm",
      label: "Bambara",
      originalLabel: "bamanakan"
    },
    {
      value: "eu",
      label: "Basque",
      originalLabel: "euskara"
    },
    {
      value: "be",
      label: "Belarusian",
      originalLabel: "беларуская"
    },
    {
      value: "bn",
      label: "Bengali",
      originalLabel: "বাংলা"
    },
    {
      value: "bho",
      label: "Bhojpuri",
      originalLabel: "भोजपुरी"
    },
    {
      value: "bs",
      label: "Bosnian",
      originalLabel: "bosanski"
    },
    {
      value: "bg",
      label: "Bulgarian",
      originalLabel: "български"
    },
    {
      value: "ca",
      label: "Catalan",
      originalLabel: "català"
    },
    {
      value: "ceb",
      label: "Cebuano",
      originalLabel: "Cebuano"
    },
    {
      value: "ny",
      label: "Chichewa",
      originalLabel: "Nyanja"
    },
    {
      value: "zh-CN",
      label: "Chinese (simplified)",
      originalLabel: "中文（中国）"
    },
    {
      value: "zh-TW",
      label: "Chinese (traditional)",
      originalLabel: "Chinese（Taiwan）"
    },
    {
      value: "co",
      label: "Corsican",
      originalLabel: "corsu"
    },
    {
      value: "hr",
      label: "Croatian",
      originalLabel: "hrvatski"
    },
    {
      value: "cs",
      label: "Czech",
      originalLabel: "čeština"
    },
    {
      value: "da",
      label: "Danish",
      originalLabel: "dansk"
    },
    {
      value: "dv",
      label: "Dhivehi",
      originalLabel: "Divehi"
    },
    {
      value: "doi",
      label: "Dogri",
      originalLabel: "डोगरी"
    },
    {
      value: "nl",
      label: "Dutch",
      originalLabel: "Nederlands"
    },
    {
      value: "eo",
      label: "Esperanto",
      originalLabel: "Esperanto"
    },
    {
      value: "et",
      label: "Estonian",
      originalLabel: "eesti"
    },
    {
      value: "ee",
      label: "Ewe",
      originalLabel: "Eʋegbe"
    },
    {
      value: "tl",
      label: "Filipino",
      originalLabel: "Filipino"
    },
    {
      value: "fi",
      label: "Finnish",
      originalLabel: "suomi"
    },
    {
      value: "fr",
      label: "French",
      originalLabel: "français"
    },
    {
      value: "fy",
      label: "Frisian",
      originalLabel: "Frysk"
    },
    {
      value: "gl",
      label: "Galician",
      originalLabel: "galego"
    },
    {
      value: "ka",
      label: "Georgian",
      originalLabel: "ქართული"
    },
    {
      value: "de",
      label: "German",
      originalLabel: "Deutsch"
    },
    {
      value: "el",
      label: "Greek",
      originalLabel: "Ελληνικά"
    },
    {
      value: "gn",
      label: "Guarani",
      originalLabel: "avañe’ẽ"
    },
    {
      value: "gu",
      label: "Gujarati",
      originalLabel: "ગુજરાતી"
    },
    {
      value: "ht",
      label: "Haitian Creole",
      originalLabel: "Haitian Creole"
    },
    {
      value: "ha",
      label: "Hausa",
      originalLabel: "Hausa"
    },
    {
      value: "haw",
      label: "Hawaiian",
      originalLabel: "ʻŌlelo Hawaiʻi"
    },
    {
      value: "iw",
      label: "Hebrew",
      originalLabel: "עברית"
    },
    {
      value: "hi",
      label: "Hindi",
      originalLabel: "हिन्दी"
    },
    {
      value: "hmn",
      label: "Hmong",
      originalLabel: "Hmong"
    },
    {
      value: "hu",
      label: "Hungarian",
      originalLabel: "magyar"
    },
    {
      value: "is",
      label: "Icelandic",
      originalLabel: "íslenska"
    },
    {
      value: "ig",
      label: "Igbo",
      originalLabel: "Igbo"
    },
    {
      value: "ilo",
      label: "Ilocano",
      originalLabel: "Ilokano"
    },
    {
      value: "id",
      label: "Indonesian",
      originalLabel: "bahasa Indonesia"
    },
    {
      value: "ga",
      label: "Irish",
      originalLabel: "Gaeilge"
    },
    {
      value: "it",
      label: "Italian",
      originalLabel: "italiano"
    },
    {
      value: "ja",
      label: "Japanese",
      originalLabel: "日本語"
    },
    {
      value: "jw",
      label: "Javanese",
      originalLabel: "Jawa"
    },
    {
      value: "kn",
      label: "Kannada",
      originalLabel: "ಕನ್ನಡ"
    },
    {
      value: "kk",
      label: "Kazakh",
      originalLabel: "қазақ тілі"
    },
    {
      value: "km",
      label: "Khmer",
      originalLabel: "ខ្មែរ"
    },
    {
      value: "rw",
      label: "Kinyarwanda",
      originalLabel: "Kinyarwanda"
    },
    {
      value: "gom",
      label: "Konkani",
      originalLabel: "Goan Konkani"
    },
    {
      value: "ko",
      label: "Korean",
      originalLabel: "한국어"
    },
    {
      value: "kri",
      label: "Krio",
      originalLabel: "Krio"
    },
    {
      value: "ku",
      label: "Kurdish (Kurmanji)",
      originalLabel: "kurdî (kurmancî)"
    },
    {
      value: "ckb",
      label: "Kurdish (Sorani)",
      originalLabel: "کوردیی ناوەندی"
    },
    {
      value: "ky",
      label: "Kyrgyz",
      originalLabel: "кыргызча"
    },
    {
      value: "lo",
      label: "Lao",
      originalLabel: "ລາວ"
    },
    {
      value: "la",
      label: "Latin",
      originalLabel: "Lingua latina"
    },
    {
      value: "lv",
      label: "Latvian",
      originalLabel: "latviešu"
    },
    {
      value: "ln",
      label: "Lingala",
      originalLabel: "lingála"
    },
    {
      value: "lt",
      label: "Lithuanian",
      originalLabel: "lietuvių"
    },
    {
      value: "lg",
      label: "Luganda",
      originalLabel: "Luganda"
    },
    {
      value: "lb",
      label: "Luxembourgish",
      originalLabel: "Lëtzebuergesch"
    },
    {
      value: "mk",
      label: "Macedonian",
      originalLabel: "македонски"
    },
    {
      value: "mai",
      label: "Maithili",
      originalLabel: "मैथिली"
    },
    {
      value: "mg",
      label: "Malagasy",
      originalLabel: "Malagasy"
    },
    {
      value: "ms",
      label: "Malay",
      originalLabel: "bahasa Malaysia"
    },
    {
      value: "ml",
      label: "Malayalam",
      originalLabel: "മലയാളം"
    },
    {
      value: "mt",
      label: "Maltese",
      originalLabel: "Malti"
    },
    {
      value: "mi",
      label: "Maori",
      originalLabel: "Māori"
    },
    {
      value: "mr",
      label: "Marathi",
      originalLabel: "मराठी"
    },
    {
      value: "mni-Mtei",
      label: "Meiteilon (Manipuri)",
      originalLabel: "ꯃꯤꯇꯩꯂꯣꯟ (ꯃꯤꯇꯩ ꯃꯌꯦꯛ)"
    },
    {
      value: "lus",
      label: "Mizo",
      originalLabel: "Mizo"
    },
    {
      value: "mn",
      label: "Mongolian",
      originalLabel: "монгол"
    },
    {
      value: "my",
      label: "Myanmar",
      originalLabel: "မြန်မာ"
    },
    {
      value: "ne",
      label: "Nepali",
      originalLabel: "नेपाली"
    },
    {
      value: "no",
      label: "Norwegian",
      originalLabel: "norsk"
    },
    {
      value: "or",
      label: "Odia (Oriya)",
      originalLabel: "ଓଡ଼ିଆ"
    },
    {
      value: "om",
      label: "Oromo",
      originalLabel: "Oromoo"
    },
    {
      value: "ps",
      label: "Pashto",
      originalLabel: "پښتو"
    },
    {
      value: "fa",
      label: "Persian",
      originalLabel: "فارسی"
    },
    {
      value: "pl",
      label: "Polish",
      originalLabel: "polski"
    },
    {
      value: "pt",
      label: "Portuguese",
      originalLabel: "português"
    },
    {
      value: "pa",
      label: "Punjabi",
      originalLabel: "ਪੰਜਾਬੀ"
    },
    {
      value: "qu",
      label: "Quechua",
      originalLabel: "Runasimi"
    },
    {
      value: "ro",
      label: "Romanian",
      originalLabel: "română"
    },
    {
      value: "ru",
      label: "Russian",
      originalLabel: "русский"
    },
    {
      value: "sm",
      label: "Samoan",
      originalLabel: "Samoan"
    },
    {
      value: "sa",
      label: "Sanskrit",
      originalLabel: "संस्कृत भाषा"
    },
    {
      value: "gd",
      label: "Scots Gaelic",
      originalLabel: "Gàidhlig"
    },
    {
      value: "nso",
      label: "Sepedi",
      originalLabel: "Northern Sotho"
    },
    {
      value: "sr",
      label: "Serbian",
      originalLabel: "српски"
    },
    {
      value: "st",
      label: "Sesotho",
      originalLabel: "Sesotho"
    },
    {
      value: "sn",
      label: "Shona",
      originalLabel: "chiShona"
    },
    {
      value: "sd",
      label: "Sindhi",
      originalLabel: "سنڌي"
    },
    {
      value: "si",
      label: "Sinhala",
      originalLabel: "සිංහල"
    },
    {
      value: "sk",
      label: "Slovak",
      originalLabel: "slovenčina"
    },
    {
      value: "sl",
      label: "Slovenian",
      originalLabel: "slovenščina"
    },
    {
      value: "so",
      label: "Somali",
      originalLabel: "Soomaali"
    },
    {
      value: "es",
      label: "Spanish",
      originalLabel: "español"
    },
    {
      value: "su",
      label: "Sundanese",
      originalLabel: "Basa Sunda"
    },
    {
      value: "sw",
      label: "Swahili",
      originalLabel: "Kiswahili"
    },
    {
      value: "sv",
      label: "Swedish",
      originalLabel: "svenska"
    },
    {
      value: "tg",
      label: "Tajik",
      originalLabel: "тоҷикӣ"
    },
    {
      value: "ta",
      label: "Tamil",
      originalLabel: "தமிழ்"
    },
    {
      value: "tt",
      label: "Tatar",
      originalLabel: "татар"
    },
    {
      value: "te",
      label: "Telugu",
      originalLabel: "తెలుగు"
    },
    {
      value: "th",
      label: "Thai",
      originalLabel: "ไทย"
    },
    {
      value: "ti",
      label: "Tigrinya",
      originalLabel: "ትግርኛ"
    },
    {
      value: "ts",
      label: "Tsonga",
      originalLabel: "Tsonga"
    },
    {
      value: "tr",
      label: "Turkish",
      originalLabel: "Türkçe"
    },
    {
      value: "tk",
      label: "Turkmen",
      originalLabel: "türkmen dili"
    },
    {
      value: "ak",
      label: "Twi",
      originalLabel: "Akan"
    },
    {
      value: "uk",
      label: "Ukrainian",
      originalLabel: "українська"
    },
    {
      value: "ur",
      label: "Urdu",
      originalLabel: "اردو"
    },
    {
      value: "ug",
      label: "Uyghur",
      originalLabel: "ئۇيغۇرچە"
    },
    {
      value: "uz",
      label: "Uzbek",
      originalLabel: "o‘zbek"
    },
    {
      value: "vi",
      label: "Vietnamese",
      originalLabel: "Tiếng Việt"
    },
    {
      value: "cy",
      label: "Welsh",
      originalLabel: "Cymraeg"
    },
    {
      value: "xh",
      label: "Xhosa",
      originalLabel: "IsiXhosa"
    },
    {
      value: "yi",
      label: "Yiddish",
      originalLabel: "ייִדיש"
    },
    {
      value: "yo",
      label: "Yoruba",
      originalLabel: "Èdè Yorùbá"
    },
    {
      value: "zu",
      label: "Zulu",
      originalLabel: "isiZulu"
    }
  ];

  const [isNotesLoading, setIsNotesLoading] = useState(false);
  const [isStoriesLoading, setIsStoriesLoading] = useState(false);

  const [generatedResources, setGeneratedResources] = useState([]);
  const [showEditor, setShowEditor] = useState(false);

  // useEffect(() => {
  //   if (knowledgeBase.every((item) => item.is_selected === false)) {
  //     console.log("disabled");
  //     setIsIngestionEnabled(false);
  //   } else {
  //     console.log("enable");
  //     setIsIngestionEnabled(true);
  //   }
  // }, [knowledgeBase]);

  const workspaceContainer = useRef(null);
  const [showMetadata, setShowMetadata] = useState(false);


  const metadataOptions = [
    // { id: "summary", name: "Summary", description: "Generate concise overview" },
    // { id: "transcription", name: "Transcription", description: "Generate audio transcription for source" },
    { id: "highlights", name: "Highlights", description: "Capture key moments" },
    { id: "chapters", name: "Chapters", description: "Divide source into meaningful sections" },
    { id: "faqs", name: "FAQs", description: "Frequently asked questions" },
    { id: "keywords", name: "Keywords", description: "Extract important terms" },
    // { id: "knowledgeGraph", name: "Knowledge graph", description: "Visualize key concepts and relationships" },
    // { id: "embeddings", name: "Embeddings", description: "Create vector representations for search" },
  ];
  const [selectedOptions, setSelectedOptions] = useState([metadataOptions[0]]);
  const [sourcesWithExclusive, setSourcesWithExclusive] = useState([]);
  const [sourcesAfterUncheckCrispWiz, setSourcesAfterUncheckCrispWiz] = useState([]);
  const [committedSources, setCommittedSources] = useState([]);
  const [isSourceUncheckedOrClosed, setIsSourceUncheckedOrClosed] = useState(false);

  const [uploadedSources, setUploadedSources] = useState([]);
  const [isFileUploading, setIsFileUploading] = useState(false);

  const [reels, setReels] = useState([]);
  const [user, setUser] = useState(null);
  // create value object with all the states
  const value = {
    reels, setReels,
    user, setUser,
    isFileUploading, setIsFileUploading,
    uploadedSources, setUploadedSources,
    showMetadata, setShowMetadata,
    isSourceUncheckedOrClosed, setIsSourceUncheckedOrClosed,
    API_ENDPOINT,
    onThumbnailClick,
    sourcesAfterUncheckCrispWiz, setSourcesAfterUncheckCrispWiz,
    sourcesWithExclusive, setSourcesWithExclusive,
    metadataOptions, selectedCategoryChat,
    committedSources, setCommittedSources,
    selectedOptions, setSelectedOptions,
    workspaceContainer,
    generatedResources, setGeneratedResources,
    categoryOptions, setCategoryOptions, showEditor, setShowEditor,
    languageOptions,
    theme, activeView, setActiveView,
    chatLoaded, setChatLoaded,
    fileFormats,
    displayedSources, setDisplayedSources,
    commitSelectedSources,
    isLeftSidebarOpen, setIsLeftSidebarOpen,
    isRightSidebarOpen, setIsRightSidebarOpen,
    modules, contentPanelContainerRef,
    handleCheckboxChange,
    activeTab, setActiveTab,
    formats,
    isExclusiveChecked, setIsExclusiveChecked,
    isEditingTitle, setIsEditingTitle,
    knowledgeBase, setKnowledgeBase,
    currentResource,
    sourcesTobeCommited, setSourcesTobeCommited,
    setCurrentResource,
    noteReferences, setNoteReferences,
    resourceURL,
    setResourceURL,
    jumpToPage, setJumpToPage,
    setTheme,
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

  // update sourcesTobeCommited depending on knowledgeBase change
  useEffect(() => {
    setSourcesTobeCommited(knowledgeBase.filter((item) => item.is_selected));
  }, [knowledgeBase]);

  useEffect(() => {
    const getNotes = async () => {
      try {
        setIsNotesLoading(true);
        const data = await makeApiRequest("/notes", "post");
        setNotes(data);
        setSelectedNote({
          note_id: "",
          text: [{
            content: "", model: null, color: theme === 'light' ? "#333" : '#fff', question: '', references: {
              videoLinks: [],
              keyframeLinks: [],
              pdfLinks: [],
              imageLinks: [],
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

  useEffect(() => {
    const getReels = async () => {
      try {
        const data = await makeApiRequest("/reels", "get");
        setReels(data);
      } catch (error) {
        console.error(error);
      }
    };

    getReels();
  }, []);

  // get user info
  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const data = await makeApiRequest("/me", "get");
        console.log(data);
        setUser(data);
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    };

    getUserInfo();
  }, []);

  return (
    <MainContext.Provider value={value}>
      <div className="flex relative !h-full divide-x divide-separator main-workspace-container">
        {/* <div className="absolute z-40 w-full h-12">
          <ProgressBar />
        </div> */}
        <ContentPanel />
        <Workspace />
        <ChatPanel />
      </div>
    </MainContext.Provider>
  );
};

export default MainWorkspace;
