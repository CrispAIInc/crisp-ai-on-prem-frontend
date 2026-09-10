import { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

import makeApiRequest, { axiosInstance } from "../api";

import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import InsertPhotoOutlinedIcon from '@mui/icons-material/InsertPhotoOutlined';
import SlideshowOutlinedIcon from '@mui/icons-material/SlideshowOutlined';
import useResources from '../hooks/useResources';
import { AuthContext } from './authContext';
import { delay, generateRandomId, pick, sortByDate } from '../utils';
import { ProjectContext } from './projectContext';
import useChat from '../hooks/useChat';
import { NAV_ITEMS } from '../navigation/navitems.js';
import { MAIN_STUDIO_PANELS } from '../globals.js';

export const MainContext = createContext({});

export default function MainProvider({ children, theme, setTheme }) {
    const { user, setUser } = useContext(AuthContext);
    const { currentProject, setProjects } = useContext(ProjectContext);
    const [categoryOptions, setCategoryOptions] = useState([]);
    const formatOptions = [
        { value: "all", label: "All" },
        { value: "video", label: "Videos" },
        { value: "pdf", label: "PDFs" },
        { value: "img", label: "Images" },
    ];
    const [reels, setReels] = useState([]);
    const [stories, setStories] = useState([]);
    const [notes, setNotes] = useState([]);
    const { getReels, getStories, getNotes, getIndexes } = useResources({ setReels, setStories, setNotes, setCategoryOptions });

    const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
    const [currentResource, setCurrentResource] = useState(null); // The Selected Source (Videos, PDFs, Images) to display in the workspace
    const [resourceURL, setResourceURL] = useState(null); // The Selected Resource Direct URL

    const [videoTimestamp, setVideoTimestamp] = useState(null); // The video timestamp coming from search results
    const player = useRef(null); // Video Play in the Workspace Component
    const [isPlayerReady, setIsPlayerReady] = useState(false); // Flag indicating that the video player is rendered. So we can do a timestamp jump properly.
    const [hasDuration, setHasDuration] = useState(false);


    // const [isAddingNote, setIsAddingNote] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false); // Flag indicating whether or not to show the Note Modal
    const [showNoteDetails, setShowNoteDetails] = useState(false);

    const [selectedSources, setSelectedSources] = useState([]); // Selected Sources to stage before commiting into the current Knowledge Base
    const [checkedAll, setCheckedAll] = useState(false); // Flag to handle selecting all sources (all categories, all formats)
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

    const [persistedUploadedFiles, setPersistedUploadedFiles] = useState([]);

    const [isKnowledgeBaseFetching, setisKnowledgeBaseFetching] = useState(false);
    useLayoutEffect(() => {
        const makeRequest = async () => {
            setisKnowledgeBaseFetching(true);
            try {
                axiosInstance.defaults.headers.common['ProjectId'] = currentProject.project_id;
                const data = await makeApiRequest(
                    "/assets"
                );
                setKnowledgeBase(data);
            } catch (error) {
                console.warn(error);
            } finally {
                setisKnowledgeBaseFetching(false);
            }
        };
        makeRequest();
    }, [currentProject.project_id]);

    useEffect(() => {
        async function intializeContent() {
            const { chat_is_initialized } = await makeApiRequest(
                `/chat/all`,
                "post",
                JSON.stringify({
                    sources: [],
                    category: "all",
                    selectedAll: false,
                    is_exclusive: false
                })
            );
            setChatLoaded(chat_is_initialized);
        }

        intializeContent();
    }, [currentProject.project_id]);

    useEffect(() => {
        getIndexes();
    }, [currentProject.project_id]);

    useEffect(() => {
        const getAllNotes = async () => {
            try {
                setIsNotesLoading(true);
                getNotes();
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

        getAllNotes();
    }, [currentProject.project_id]);

    useEffect(() => {
        const getAllStories = async () => {
            try {
                setIsStoriesLoading(true);
                getStories();
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

        getAllStories();
    }, [currentProject.project_id]);

    useEffect(() => {
        getReels();
    }, [currentProject.project_id]);

    const contentPanelContainerRef = useRef(null);

    // can either be 'resource', 'note' or null
    // indicates wether the user is viewing a resource or a note in workspace
    const [activeView, setActiveView] = useState(null);

    // Additional Sources to show in the search modal (second most relevant, third most relevant, etc).
    // In the search modal, we show n videos, n pdfs, n images, in total. For now n = 3 (can be changed later).
    const [discoveredSources, setDiscoveredSources] = useState([]);
    const [discoveryTriggered, setDiscoveryTriggered] = useState(false);
    const [discoveryLastQuery, setDiscoveryLastQuery] = useState("");
    const [discoverySearchOutcome, setDiscoverySearchOutcome] = useState(null);
    const [discoveryQuery, setDiscoveryQuery] = useState("");
    const [discoverySelectedIndexes, setDiscoverySelectedIndexes] = useState([]);
    const [isDiscoverySearching, setIsDiscoverySearching] = useState(false);
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

    const [selectedStory, setSelectedStory] = useState({
        story_id: "",
        text: [],
        story_name: "",
        models: [],
    });
    const [showStoryDetails, setShowStoryDetails] = useState(false);
    const [isNewStory, setIsNewStory] = useState(false);

    // Story generation state - persists across tab switches
    const [storyContext, setStoryContext] = useState('');
    const [storyStoryline, setStoryStoryline] = useState('');
    const [isGeneratingStory, setIsGeneratingStory] = useState(false);

    // ContextualMetadata state - persists across tab switches
    const [contextualMetadataSourceIds, setContextualMetadataSourceIds] = useState([]);
    const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
    const [contextualMetadataContext, setContextualMetadataContext] = useState('');
    const [contextualMetadataVerbosity, setContextualMetadataVerbosity] = useState('Low');

    // Shorts state - persists across tab switches
    const [shortsSourceIds, setShortsSourceIds] = useState([]);
    const [isGeneratingShorts, setIsGeneratingShorts] = useState(false);
    const [shortsContext, setShortsContext] = useState('');
    const [shortsTitle, setShortsTitle] = useState('');
    const [shortsVerbosity, setShortsVerbosity] = useState('Short');

    // Analytics state - persists across tab switches
    const [analyticsActiveTab, setAnalyticsActiveTab] = useState('time-segments');
    const [analyticsSourceIds, setAnalyticsSourceIds] = useState([]);
    // Time segment pane state
    const [timeSegmentStart, setTimeSegmentStart] = useState({ h: "00", m: "00", s: "00" });
    const [timeSegmentEnd, setTimeSegmentEnd] = useState({ h: "00", m: "00", s: "00" });
    const [timeSegmentContext, setTimeSegmentContext] = useState('');
    const [timeSegmentTitle, setTimeSegmentTitle] = useState('');
    const [timeSegmentFullLength, setTimeSegmentFullLength] = useState(false);
    const [isGeneratingTimeSegment, setIsGeneratingTimeSegment] = useState(false);
    const [timeSegmentResultsDescription, setTimeSegmentResultsDescription] = useState({ start: "00:00:00", end: "00:00:00", description: "", refs: [] });
    // Find moments pane state
    const [findMomentsContext, setFindMomentsContext] = useState('');
    const [findMomentsTitle, setFindMomentsTitle] = useState('');
    const [isGeneratingMoments, setIsGeneratingMoments] = useState(false);

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
        if (items?.length === 0) {
            // setSelectedSources(sourcesTobeCommited);
            knowledgeBase.map((item) => {
                if (item.is_checked) {
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

    const [, setTranscription] = useState("");

    const onThumbnailClick = async (event, file, isFromCheckbox = false) => {
        if (event) event.preventDefault();
        const resourceURL = `${import.meta.env.VITE_API_ENDPOINT
            }/${file.file_type}/all/${encodeURIComponent(file.source_path)}`;
        let fileToCommit = knowledgeBase.find((item) => item.source_path === file.source_path) || file;

        setCurrentResource({ ...fileToCommit, timestamp: file?.timestamp, page: file?.page });
        setResourceURL(resourceURL);
        setTranscription(fileToCommit.metadata ? fileToCommit.metadata.transcription : "");
        if (fileToCommit.file_type != "img") {
            setSummary(fileToCommit.summary);
            setSummaries(fileToCommit.topic_summaries);
        }

        // set jumpToPage to 1 so that the PDF reader displays all the pages from page 1 and not jump to a specific page like the case when clicking on a reference
        if (fileToCommit.file_type === "pdf") {
            await delay(1000);
            setJumpToPage({ page: file?.page || 1 });
        }
        setActiveView('resource');
        if (!isFromCheckbox) { setShowMetadata(true); }
    };



    const handleCheckboxChange = (isChecked, file) => {

        let updatedKnowledgeBase = knowledgeBase.map(item => {
            if (item.source_path === file.source_path) {
                return { ...item, is_selected: true, is_checked: !item.is_checked };
            }

            return item;
        });

        setKnowledgeBase(updatedKnowledgeBase);

        if (!isChecked) setCheckedAll(false);

        // if (isChecked === true && !currentResource) {
        //     onThumbnailClick(undefined, file, true);
        // }
    };

    const [checkedSources, setCheckedSources] = useState(knowledgeBase.filter(item => item.is_checked));

    useEffect(() => {
        // add all selected sources from knowledgebase to displayedsources
        setDisplayedSources(knowledgeBase.filter(item => item.is_selected));

        // update current project 'checked_sources' and 'unchecked_sources'
        const checkedSources = knowledgeBase.filter(item => (item.is_selected && item.is_checked));
        const uncheckedSources = knowledgeBase.filter(item => (item.is_selected && !item.is_checked));

        setProjects(prev => prev.map(project => {
            if (project.project_id === currentProject.project_id) {
                return {
                    ...project,
                    checked_sources: checkedSources,
                    unchecked_sources: uncheckedSources
                };
            }

            return project;
        }));

        // update checked sources
        setCheckedSources(checkedSources);
    }, [knowledgeBase, currentProject.project_id, setProjects]);

    // const [selectedCategory] = useState("all");

    // useEffect(() => {
    //     setChatLoaded(false);
    //     // setCommittedSources(selectedSources);
    //     async function fetchChat() {
    //         const data = await makeApiRequest(
    //             `/chat/${selectedCategory}`,
    //             "post",
    //             JSON.stringify({
    //                 sources: selectedSources?.filter(item => item?.metadata?.embeddings_generated),
    //                 category: selectedCategory,
    //                 selectedAll,
    //                 is_exclusive: Boolean(sourcesWithExclusive?.find(item => item === currentResource?.source_path)?.length)
    //             })
    //         );
    //         setChatLoaded(data?.chat_is_initialized);
    //     }

    //     fetchChat();
    // }, [selectedCategory, selectedSources]);

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
        setIsFoundationLlm(selectedSources.length === 0 || (displayedSources?.some(item => item?.is_checked) ? false : true));
        if (!isExclusiveChecked) {
            setCommittedSources(selectedSources);
        }
    }, [selectedSources]);

    useEffect(() => {
        setIsFoundationLlm(displayedSources?.some(item => item?.is_checked) ? false : true);
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
    //   if (knowledgeBase.every((item) => item.is_checked === false)) {

    //     setIsIngestionEnabled(false);
    //   } else {

    //     setIsIngestionEnabled(true);
    //   }
    // }, [knowledgeBase]);

    const workspaceContainer = useRef(null);
    const [showMetadata, setShowMetadata] = useState(false);

    useEffect(() => {
        if (!showMetadata) {
            setCurrentResource(null);
        }
    }, [showMetadata]);

    const [activeStudioPanel, setActiveStudioPanel] = useState(null); // "metadata" | "shorts"


    const metadataOptions = [
        { id: "summary", name: "Summary", description: "Generate concise overview" },
        // { id: "transcription", name: "Transcription", description: "Generate audio transcription for source" },
        { id: "chapters", name: "Chapters", description: "Divide source into meaningful sections" },
        { id: "highlights", name: "Highlights", description: "Capture key moments" },
        { id: "keywords", name: "Keywords", description: "Extract important terms" },
        { id: "faqs", name: "FAQs", description: "Frequently asked questions" },
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
    // const [user, setUser] = useState(null);

    const { addNewChat } = useChat();
    const [chatHistory, setChatHistory] = useState([]);
    const [currentChat, setCurrentChat] = useState(() => {
        const now = new Date();
        return {
            sessionId: generateRandomId(),
            isTemp: true,
            title: "New Chat " + (chatHistory.length + 1),
            userId: user.userId,
            messages: [],
            created_at: now,
            updated_at: now
        };
    });

    const checkedSourcesCount = useMemo(() => displayedSources.filter(source => source.is_checked).length, [displayedSources]);

    // useEffect(() => {
    //     let now = new Date();
    //     setCurrentChat({ sessionId: generateRandomId(), title: `New Chat ${chatHistory.length + 1}`, userId: user?.userId, messages: [], created_at: now, updated_at: now });
    // }, []);

    useEffect(() => {
        async function getChatHistory() {
            try {
                const { chat_history } = await makeApiRequest("/chat-history", "GET");
                setChatHistory(chat_history);

                const _currentChat = chat_history.find(item => item.is_current_chat);
                if (_currentChat) {
                    setCurrentChat(_currentChat);
                } else {
                    setCurrentChat(prev => ({
                        ...prev,
                        title: "New Chat " + (chatHistory.length + 1),
                    }));
                }
            } catch (error) {
                console.log(error);
            }
        }

        getChatHistory();
    }, [currentProject.project_id]);

    useEffect(() => {
        // if (Array.isArray(currentChat)) {
        workspaceContainer?.current?.scrollTo({
            top: 0,
            behavior: "smooth", // Enables smooth scrolling
        });
        // }
    }, [currentChat]);

    const [combinedSummary, setCombinedSummary] = useState("");
    const [isCombinedSummaryPending, setIsCombinedSummaryPending] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("en"); // chat default language

    const getCombinedSum = async () => {
        try {
            setIsCombinedSummaryPending(true);
            setActiveView('resource');

            const sources = displayedSources
                .filter(s => s.is_checked)
                .map(({ source_path, category }) => ({ source_path, category }));

            if (!sources.length) {
                setCombinedSummary("");
                return;
            }

            const summary = await makeApiRequest(
                '/combine-summaries',
                'POST',
                JSON.stringify({
                    sources,
                    lang: selectedLanguage,
                })
            );

            setCombinedSummary(summary?.combined_summary || "");
        } catch (e) {
            console.error(e);
        } finally {
            setIsCombinedSummaryPending(false);
        }
    };
    useEffect(() => {
        getCombinedSum();
    }, [currentProject.project_id]);
    // }, [displayedSources, selectedLanguage]);

    useEffect(() => {
        async function getJsonEntities() {
            const { graphs } = await makeApiRequest('/graphs');
            setJsonEntities(graphs);
        }

        getJsonEntities();
    }, []);

    const [blogs, setBlogs] = useState([]);
    const [selectedBlog, setSelectedBlog] = useState(null);
    useEffect(() => {
        async function fetchBlogs() {
            const { blogs } = await makeApiRequest('/blogs');
            setBlogs(blogs);
        }

        fetchBlogs();
    }, []);

    const metadataPanelContainer = useRef(null);
    const [jsonEntities, setJsonEntities] = useState([]);
    const [selectedJsonEntity, setSelectedJsonEntity] = useState(null);


    /**
     * VIDEO PROCESSING SETTINGS
     */
    const [frameExtractionRate, setFrameExtractionRate] = useState({ mode: "medium", frames: 1, interval: 3 });
    const [isDetailedMode, setIsDetailedMode] = useState(false);
    const [videoCaptionContext, setVideoCaptionContext] = useState("");

    // Pdf viewer ref
    const pdfRef = useRef(null);

    const categoryOptionsWithoutAll = categoryOptions.filter(item => item.value !== 'all');
    const [searchQuestion, setSearchQuestion] = useState('');

    const [selectedReel, setSelectedReel] = useState(null);

    /**
     * ON PREM NEW LAYOUT APP STATE
     */

    /**
     * const NAV_ITEMS = [
  { key: "media", label: "Media", icon: Image },
  { key: "discovery", label: "Discovery", icon: Search },
  { key: "metadata", label: "Contextual Metadata", icon: Star },
  { key: "wiz", label: "Crisp Wiz", icon: MessageCircle },
  { key: "reels", label: "Reels", icon: Clapperboard },
  { key: "analytics", label: "Analytics", icon: LineChart },
  { key: "stories", label: "Stories & Blogs", icon: BookOpen },
  { key: "business_intelligence", label: "Business Intelligence", icon: PieChart },
];
     */
    const [activeTab, setActiveTab] = useState(NAV_ITEMS[0]?.key || "media");
    useEffect(() => {
        setActiveStudioPanel(MAIN_STUDIO_PANELS.METADATA);
    }, [currentResource]);

    // ANALYTICS
    const [currentSegment, setCurrentSegment] = useState(null);
    const [segmentDescriptions, setSegmentDescriptions] = useState([]);

    useEffect(() => {

        async function fetchTimeSegments() {
            try {
                axiosInstance.defaults.headers.common['ProjectId'] = currentProject.project_id;
                const { data, success } = await makeApiRequest("/segments", 'GET', null, {
                    ProjectId: currentProject.project_id,
                });

                if (success) {
                    /**
                     * [
                        {
                            created_at: "Sat, 05 Sep 2026 07:20:12 GMT",
                            end: "00:03:00",
                            id: "edhxz9LG71n9CwtG2Xjr",
                            query: "bill gates",
                            response_format: {
                                schema: {
                                    action_description: "The video features Bill Gates as a guest on The Ellen DeGeneres Show. The segment begins with Gates and host Ellen DeGeneres seated on white armchairs on a set decorated with palm trees and purple flowers. Gates, initially wearing a red sweater, discusses his nervousness about his entrance and a dance rehearsal he performed earlier. The video cuts to a clip of Gates dancing energetically on stage in a grey sweater and khaki pants, which he describes as a rehearsal. The scene returns to the interview where Gates, now in a red sweater, talks about his past as the youngest self-made billionaire at age 21. He explains that his focus was always on software and hiring people rather than money, though he admits to being conservative about finances to ensure payroll could be met. He mentions his only indulgences were buying a Porsche and a private plane. Later, Gates changes into a pink sweater and discusses the Bill & Melinda Gates Foundation, highlighting their focus on global health (reducing child mortality) and improving the US education system. He encourages viewers to mentor children in local schools. The segment is filled with laughter, hand gestures, and audience reactions.",
                                    mood: [
                                        "joyful",
                                        "engaging",
                                        "informative",
                                        "lively"
                                    ],
                                    onscreen_text: {
                                        detected: true,
                                        text_content: [
                                            "ellentube"
                                        ]
                                    },
                                    shot_type: [
                                        "medium shot",
                                        "wide shot",
                                        "close-up",
                                        "transition screen"
                                    ],
                                    talking_head: [
                                        {
                                            character_name: "Ellen DeGeneres",
                                            detected: true,
                                            talking: true,
                                            text_content: "[00:00:00-00:00:20] im so happy to have you here. this is the first time having you on so thanks. so i know you were nervous about the entrance. you thought i think people feel like theyre supposed to dance and so... and i was really surprised because i was here earlier today for your rehearsal and then you abandoned it. but we should at least show them the rehearsal because it was really good."
                                        },
                                        {
                                            character_name: "Bill Gates",
                                            detected: true,
                                            talking: true,
                                            text_content: "[00:00:20-00:00:46] shout out to them people. people. people. come on. i feel it with the im and put your eyes where the city and listen and explain thank you. thank you. ill tell you who i am. yeah! well... it was good. thank you."
                                        },
                                        {
                                            character_name: "Ellen DeGeneres",
                                            detected: true,
                                            talking: true,
                                            text_content: "[00:00:49-00:01:29] oh your daughters looking at you like ive never seen you dance like that. um hi. so the last time we saw each other was at the white house. we both were receiving the... the medal of freedom and that was quite a day wasnt it? that was an amazing group. yeah really fun. so you are here with your daughter who is 21 right? and you were 21 when you became a billionaire. is that right? almost there. alright so around that age you were like the youngest person to become a billionaire. is that right? yeah in terms of my own earning it on my own yeah. right. mmhmm. okay so what is the most important thing? yeah so did you when you were a kid did you? did you care about money or you just cared about technology and thats it just happened?"
                                        },
                                        {
                                            character_name: "Bill Gates",
                                            detected: true,
                                            talking: true,
                                            text_content: "[00:01:35-00:02:29] mostly i love software. i do remember at the private school i went to there were other kids whose families were better off like they had a porsche or something but it wasnt that bad. big of a deal. my thing was that i just loved doing software i loved hiring people and i was stunned when it ended up being so valuable. really? yeah. that surprised you? yeah because i always had to be careful that we wouldnt hire too many people. i was always worried because i was people who worked for me were older than me and they had kids and i always thought well what if we dont get paid? will i be able to meet the payroll so i was always very conservative about the finances and then when we did go public was i 30 by then the government had to go public with the i was kind of stunned at what it multiplied out to. right. so when you became a billionaire at what point did you start start relaxing. were you still nervous when you became a billionaire like i gotta watch this?"
                                        },
                                        {
                                            character_name: "Bill Gates",
                                            detected: true,
                                            talking: true,
                                            text_content: "[00:02:34-00:03:00] well i always wanted to have enough money in the bank so that even if our customers didnt pay us for a year we could still keep paying everybody and do the rd. so i still ill be viewed as conservative. you know i dont have that many things that are extravagant taste so didnt change too much. so nothing really changed. you didnt say oh im gonna buy a porsche. i did. okay alright yeah."
                                        }
                                    ]
                                },
                                type: "json_schema"
                            },
                            start: "00:00:00",
                            title: "bill gates",
                            video: "bill gates1.mp4"
                        },
                        {
                            created_at: "Sat, 05 Sep 2026 07:20:12 GMT",
                            end: "00:03:00",
                            id: "edhljlnxz9LG71n9CwtG2Xjr",
                            query: "thomas henda",
                            response_format: {
                                schema: {
                                    action_description: "The video features Bill Gates as a guest on The Ellen DeGeneres Show. The segment begins with Gates and host Ellen DeGeneres seated on white armchairs on a set decorated with palm trees and purple flowers. Gates, initially wearing a red sweater, discusses his nervousness about his entrance and a dance rehearsal he performed earlier. The video cuts to a clip of Gates dancing energetically on stage in a grey sweater and khaki pants, which he describes as a rehearsal. The scene returns to the interview where Gates, now in a red sweater, talks about his past as the youngest self-made billionaire at age 21. He explains that his focus was always on software and hiring people rather than money, though he admits to being conservative about finances to ensure payroll could be met. He mentions his only indulgences were buying a Porsche and a private plane. Later, Gates changes into a pink sweater and discusses the Bill & Melinda Gates Foundation, highlighting their focus on global health (reducing child mortality) and improving the US education system. He encourages viewers to mentor children in local schools. The segment is filled with laughter, hand gestures, and audience reactions.",
                                    mood: [
                                        "joyful",
                                        "engaging",
                                        "informative",
                                        "lively"
                                    ],
                                    onscreen_text: {
                                        detected: true,
                                        text_content: [
                                            "ellentube"
                                        ]
                                    },
                                    shot_type: [
                                        "medium shot",
                                        "wide shot",
                                        "close-up",
                                        "transition screen"
                                    ],
                                    talking_head: [
                                        {
                                            character_name: "Ellen DeGeneres",
                                            detected: true,
                                            talking: true,
                                            text_content: "[00:00:00-00:00:20] im so happy to have you here. this is the first time having you on so thanks. so i know you were nervous about the entrance. you thought i think people feel like theyre supposed to dance and so... and i was really surprised because i was here earlier today for your rehearsal and then you abandoned it. but we should at least show them the rehearsal because it was really good."
                                        },
                                        {
                                            character_name: "Bill Gates",
                                            detected: true,
                                            talking: true,
                                            text_content: "[00:00:20-00:00:46] shout out to them people. people. people. come on. i feel it with the im and put your eyes where the city and listen and explain thank you. thank you. ill tell you who i am. yeah! well... it was good. thank you."
                                        },
                                        {
                                            character_name: "Ellen DeGeneres",
                                            detected: true,
                                            talking: true,
                                            text_content: "[00:00:49-00:01:29] oh your daughters looking at you like ive never seen you dance like that. um hi. so the last time we saw each other was at the white house. we both were receiving the... the medal of freedom and that was quite a day wasnt it? that was an amazing group. yeah really fun. so you are here with your daughter who is 21 right? and you were 21 when you became a billionaire. is that right? almost there. alright so around that age you were like the youngest person to become a billionaire. is that right? yeah in terms of my own earning it on my own yeah. right. mmhmm. okay so what is the most important thing? yeah so did you when you were a kid did you? did you care about money or you just cared about technology and thats it just happened?"
                                        },
                                        {
                                            character_name: "Bill Gates",
                                            detected: true,
                                            talking: true,
                                            text_content: "[00:01:35-00:02:29] mostly i love software. i do remember at the private school i went to there were other kids whose families were better off like they had a porsche or something but it wasnt that bad. big of a deal. my thing was that i just loved doing software i loved hiring people and i was stunned when it ended up being so valuable. really? yeah. that surprised you? yeah because i always had to be careful that we wouldnt hire too many people. i was always worried because i was people who worked for me were older than me and they had kids and i always thought well what if we dont get paid? will i be able to meet the payroll so i was always very conservative about the finances and then when we did go public was i 30 by then the government had to go public with the i was kind of stunned at what it multiplied out to. right. so when you became a billionaire at what point did you start start relaxing. were you still nervous when you became a billionaire like i gotta watch this?"
                                        },
                                        {
                                            character_name: "Bill Gates",
                                            detected: true,
                                            talking: true,
                                            text_content: "[00:02:34-00:03:00] well i always wanted to have enough money in the bank so that even if our customers didnt pay us for a year we could still keep paying everybody and do the rd. so i still ill be viewed as conservative. you know i dont have that many things that are extravagant taste so didnt change too much. so nothing really changed. you didnt say oh im gonna buy a porsche. i did. okay alright yeah."
                                        }
                                    ]
                                },
                                type: "json_schema"
                            },
                            start: "00:00:00",
                            title: "testt",
                            video: "testt1.mp4"
                        }
                    ]
                     */
                    setSegmentDescriptions(sortByDate(data, "created_at", "desc"));
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchTimeSegments();
    }, []);


    // MOMENTS
    const [currentMoment, setCurrentMoment] = useState(null);
    const [moments, setMoments] = useState([]);

    useEffect(() => {

        async function fetchFindMoments() {
            try {
                axiosInstance.defaults.headers.common['ProjectId'] = currentProject.project_id;
                const { data, success } = await makeApiRequest("/moments", 'GET', null, {
                    ProjectId: currentProject.project_id,
                });
                if (success) {

                    let formattedData = data.map((d) => {
                        const finalResults = d.results.map((moment) => {
                            const source = knowledgeBase.find(item => item.source_id === moment.source_id);

                            if (!source) return null;

                            return {
                                ...moment,
                                timestampText: `${source.source_path} | ${moment.timestamp}`,
                                source: {
                                    ...source,
                                    timestamp: moment.timestamp
                                }
                            };
                        }).filter(Boolean);

                        return {
                            ...d,
                            results: finalResults
                        };
                    });

                    setMoments(formattedData);

                    // setMoments([
                    //     {
                    //         created_at: "Sun, 06 Sep 2026 03:24:50 GMT",
                    //         id: "1IquAuWLxyFBiEPRoX1F",
                    //         prompt: "Bill gates",
                    //         results: [
                    //             {
                    //                 context: "you start relaxing. Were you still nervous when you became a billionaire? Like, I gotta watch this? Well, I always wanted to have enough money in the bank so that even if our customers didn't pay us for a year, we could still keep paying everybody and do the R&D. So I still be viewed as conservative. I don't have that many things that are extravagant.",
                    //                 source_id: "WptZseM4s6FrcPVvT57n",
                    //                 timestamp: "00:00:32",
                    //                 video: "bill gates.mp4"
                    //             },
                    //             {
                    //                 context: "At the White House, we both were receiving the Medal of Freedom, and that was quite a day, wasn't it? That was an amazing group. Yeah, really fun. So you are here with your daughter who is 21, right? And you were 21 when you became a billionaire. Is that right? Almost, yep. Alright. So I was thinking of a deal. My thing was that I just love doing software, I love hiring people, and I was stunned when it ended up being so valuable. You. Really? Thank you. Yeah. That surprised you? because I always had to be careful that",
                    //                 source_id: "WptZseM4s6FrcPVvT57n",
                    //                 timestamp: "00:00:00",
                    //                 video: "bill gates.mp4"
                    //             },
                    //             {
                    //                 context: "A wide shot of the stage featuring Bill Gates and Ellen DeGeneres seated on white armchairs. Behind them, a large screen displays an image of Bill Gates receiving an award medal from another man. The stage has blue lighting accents and white orchid arrangements on either side. The 'ellentube' watermark is visible in the bottom left corner.",
                    //                 source_id: "WptZseM4s6FrcPVvT57n",
                    //                 timestamp: "00:00:09",
                    //                 video: "bill gates.mp4"
                    //             }
                    //         ],
                    //         title: "Bill gates"
                    //     },
                    //     {
                    //         created_at: "Sun, 06 Sep 2026 03:24:50 GMT",
                    //         id: "1ffIquAuWLxyFBiEPRoX1F",
                    //         prompt: "Bill gates",
                    //         results: [
                    //             {
                    //                 context: "you start relaxing. Were you still nervous when you became a billionaire? Like, I gotta watch this? Well, I always wanted to have enough money in the bank so that even if our customers didn't pay us for a year, we could still keep paying everybody and do the R&D. So I still be viewed as conservative. I don't have that many things that are extravagant.",
                    //                 source_id: "WptZseM4s6FrcPVvT57n",
                    //                 timestamp: "00:00:32",
                    //                 video: "bill gates.mp4"
                    //             },
                    //             {
                    //                 context: "At the White House, we both were receiving the Medal of Freedom, and that was quite a day, wasn't it? That was an amazing group. Yeah, really fun. So you are here with your daughter who is 21, right? And you were 21 when you became a billionaire. Is that right? Almost, yep. Alright. So I was thinking of a deal. My thing was that I just love doing software, I love hiring people, and I was stunned when it ended up being so valuable. You. Really? Thank you. Yeah. That surprised you? because I always had to be careful that",
                    //                 source_id: "WptZseM4s6FrcPVvT57n",
                    //                 timestamp: "00:00:00",
                    //                 video: "bill gates.mp4"
                    //             },
                    //             {
                    //                 context: "A wide shot of the stage featuring Bill Gates and Ellen DeGeneres seated on white armchairs. Behind them, a large screen displays an image of Bill Gates receiving an award medal from another man. The stage has blue lighting accents and white orchid arrangements on either side. The 'ellentube' watermark is visible in the bottom left corner.",
                    //                 source_id: "WptZseM4s6FrcPVvT57n",
                    //                 timestamp: "00:00:09",
                    //                 video: "bill gates.mp4"
                    //             }
                    //         ],
                    //         title: "Bill gates"
                    //     }
                    // ]);
                }
            } catch (error) {
                console.log(error);
            }
        }

        fetchFindMoments();
    }, []);

    // create value object with all the states
    const value = {
        currentSegment, setCurrentSegment,
        segmentDescriptions, setSegmentDescriptions,
        currentMoment, setCurrentMoment,
        moments, setMoments,
        selectedReel, setSelectedReel,
        activeStudioPanel,
        setActiveStudioPanel,
        pdfRef,
        searchQuestion, setSearchQuestion,
        categoryOptionsWithoutAll,
        isKnowledgeBaseFetching, setisKnowledgeBaseFetching,
        frameExtractionRate, setFrameExtractionRate,
        isDetailedMode, setIsDetailedMode,
        videoCaptionContext, setVideoCaptionContext,
        blogs, setBlogs,
        selectedBlog, setSelectedBlog,
        jsonEntities,
        selectedJsonEntity,
        setSelectedJsonEntity,
        setJsonEntities,
        metadataPanelContainer,
        checkedSources,
        combinedSummary, setCombinedSummary,
        isCombinedSummaryPending, setIsCombinedSummaryPending,
        selectedLanguage, setSelectedLanguage,
        getCombinedSum,
        theme, setTheme,
        checkedSourcesCount,
        chatHistory, setChatHistory,
        currentChat, setCurrentChat,
        reels, setReels,
        persistedUploadedFiles, setPersistedUploadedFiles,
        // user, setUser,
        isFileUploading, setIsFileUploading,
        uploadedSources, setUploadedSources,
        showMetadata, setShowMetadata,
        isSourceUncheckedOrClosed, setIsSourceUncheckedOrClosed,
        API_ENDPOINT,
        onThumbnailClick,
        sourcesAfterUncheckCrispWiz, setSourcesAfterUncheckCrispWiz,
        sourcesWithExclusive, setSourcesWithExclusive,
        metadataOptions, selectedCategory,
        committedSources, setCommittedSources,
        selectedOptions, setSelectedOptions,
        workspaceContainer,
        generatedResources, setGeneratedResources,
        categoryOptions, setCategoryOptions,
        formatOptions,
        showEditor, setShowEditor,
        languageOptions,
        activeView, setActiveView,
        hasDuration, setHasDuration,
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
        isNewStory, setIsNewStory,
        selectedGenStoriesModels, setSelectedGenStoriesModels,
        summaries, setSummaries,
        llmModels,
        videoTimestamp,
        setVideoTimestamp,
        player,
        isPlayerReady,
        isNotesLoading,
        setIsNotesLoading,
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
        checkedAll,
        setCheckedAll,
        setSelectedCategory,
        selectedFormat,
        setSelectedFormat,
        discoveredSources,
        setDiscoveredSources,
        discoveryTriggered,
        setDiscoveryTriggered,
        discoveryLastQuery,
        setDiscoveryLastQuery,
        discoverySearchOutcome,
        setDiscoverySearchOutcome,
        discoveryQuery,
        setDiscoveryQuery,
        discoverySelectedIndexes,
        setDiscoverySelectedIndexes,
        isDiscoverySearching,
        setIsDiscoverySearching,
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
        showStoryDetails, setShowStoryDetails, isFoundationLlm, setIsFoundationLlm,
        storyContext, setStoryContext,
        storyStoryline, setStoryStoryline,
        isGeneratingStory, setIsGeneratingStory,
        contextualMetadataSourceIds, setContextualMetadataSourceIds,
        isGeneratingMetadata, setIsGeneratingMetadata,
        contextualMetadataContext, setContextualMetadataContext,
        contextualMetadataVerbosity, setContextualMetadataVerbosity,
        shortsSourceIds, setShortsSourceIds,
        isGeneratingShorts, setIsGeneratingShorts,
        shortsContext, setShortsContext,
        shortsTitle, setShortsTitle,
        shortsVerbosity, setShortsVerbosity,
        analyticsActiveTab, setAnalyticsActiveTab,
        analyticsSourceIds, setAnalyticsSourceIds,
        timeSegmentStart, setTimeSegmentStart,
        timeSegmentEnd, setTimeSegmentEnd,
        timeSegmentContext, setTimeSegmentContext,
        timeSegmentTitle, setTimeSegmentTitle,
        timeSegmentFullLength, setTimeSegmentFullLength,
        isGeneratingTimeSegment, setIsGeneratingTimeSegment,
        timeSegmentResultsDescription, setTimeSegmentResultsDescription,
        findMomentsContext, setFindMomentsContext,
        findMomentsTitle, setFindMomentsTitle,
        isGeneratingMoments, setIsGeneratingMoments
    };

    return (
        <MainContext.Provider value={value}>{children}</MainContext.Provider>
    );
}