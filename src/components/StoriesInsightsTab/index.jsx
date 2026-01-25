import "react-quill/dist/quill.snow.css";
import LoadingSpinner from '../LoadingSpinner/index.jsx';
import makeApiRequest from '../../api/index.js';
import { MainContext } from '../../contexts/mainContext.jsx';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick.js';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useToast } from "../../contexts/toastContext.jsx";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RippleButton from '../RippleButton/index.jsx';
import useResources from '../../hooks/useResources.js';
import useFirebase from '../../hooks/useFirebase.js';
import InsightsList from "../InsightsList/index.jsx";
import { useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import { useResizableSidebar } from '../../hooks/useResizableSidebar.js';
import MetadataGen from '../MetadataGen/index.jsx';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";
import toast from 'react-simple-toasts';
import BaseHeading from '../BaseHeading/index.jsx';
import { generateRandomHash, htmlToPlainText, searchByKey, sortArrayOfObjects, sortBySourcePath } from '../../utils.js';
import MediaEntertainment from '../MediaEntertainment/index.jsx';
import ReelViewer from '../ReelViewer/index.jsx';
import GsFile from '../GsFile/index.jsx';
import FilenameUpdateModal from "../AppSingleValueModal/index.jsx";
import StoriesList from '../StoriesList/index.jsx';

function StoriesInsightsTab({ generatedStory: story, setGeneratedStory, setShowStoriesEditor }) {

    const { getPublicUrl } = useFirebase();

    const {
        setSelectedNote,
        setIsEditingTitle,
        setIsNewNote,
        setShowNoteDetails,
        reels,
        setReels,
        notes,
        isNewNote,
        setNotes,
        showEditor,
        setShowEditor,
        selectedNote,
        noteIndex,
        setNoteIndex,
        knowledgeBase,
        isRightSidebarOpen,
        setIsRightSidebarOpen,
        stories,
        setSelectedStory,
        selectedStory,
        displayedSources, theme, setStories,
        setIsNewStory,
    } = useContext(MainContext);

    const { notify } = useToast();
    const { getReels, getStories, getNotes } = useResources({ setReels, setStories, setNotes });

    const [noteTitle, setNoteTitle] = useState('');

    const [isNewInsight, setIsNewInsight] = useState(false);
    function createNewInsight() {
        setSelectedNote({
            note_id: "",
            text: [{
                content: "", model: "", color: theme === 'light' ? "#333" : '#fff', question: '', answer: "", references: {
                    videoLinks: [],
                    keyframeLinks: [],
                    pdfLinks: [],
                    imageLinks: [],
                }
            }],
            images: [],
            note_name: "",
        });
        setIsNewInsight(true);
        setShowEditor(true);
    }

    useEffect(() => {
        setNoteTitle(selectedNote?.note_name);
    }, [selectedNote?.note_name]);

    const showSelectedNote = (event, note, index) => {
        setSelectedStory({
            story_id: "",
            text: [],
            story_name: "",
            models: [],
        });
        event.preventDefault();
        setNoteIndex(index);
        setSelectedNote(note);
        setIsEditingTitle(false);
        setIsNewNote(false);
        setShowNoteDetails(true);
        setShowEditor(true);
    };

    const [currentTab, setCurrentTab] = useState("Insights");  // insights | stories

    const showSelectedStory = (e, story) => {
        setSelectedNote({
            note_id: "",
            text: [{
                content: "", model: "", color: theme === 'light' ? "#333" : '#fff', question: '', answer: "", references: {
                    videoLinks: [],
                    keyframeLinks: [],
                    pdfLinks: [],
                    imageLinks: [],
                }
            }],
            images: [],
            note_name: "",
        });
        setSelectedStory(story);
        setGeneratedStory(story);
        setIsNewStory(false);
        setShowStoriesEditor(true);
    };

    const [actualTab, setActualTab] = useState("genMetadata"); //genMetadata | genStories

    const [hoveredInsight, setHoveredInsight] = useState(null);
    const handleMouseEnterInsight = (id) => {
        setHoveredInsight(id);
    };
    const handleMouseLeaveInsight = () => {
        setHoveredInsight(null);
    };

    const [isInsightDeleting, setIsInsightDeleting] = useState(false);
    async function deleteInsight(id, name) {
        try {
            setIsInsightDeleting(true);
            await makeApiRequest(`/delete-note`, 'post', { noteID: id, noteName: name });
            // send request to update notes
            notify({
                variant: "success",
                heading: "Insight deleted successfully!",
            });
            getNotes();
        } catch (e) {
            console.log(e);
        } finally {
            setIsInsightDeleting(false);
        }
    }

    const [hoveredStory, setHoveredStory] = useState(null);
    const handleMouseEnterStory = (id) => {
        setHoveredStory(id);
    };
    const handleMouseLeaveStory = () => {
        setHoveredStory(null);
    };

    const [isStoryDeleting, setIsStoryDeleting] = useState(false);

    async function deleteStory(event, id) {
        event.preventDefault();
        setIsStoryDeleting(true);
        try {
            await makeApiRequest(`/stories/${id}`, 'delete');
            notify({
                variant: "success",
                heading: "Story deleted successfully!",
            });
            // fetch stories
            getStories();
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "An error occurred while deleting story",
            });
        } finally {
            setIsStoryDeleting(false);
        }
    }

    const [insightSearchValue, setInsightSearchValue] = useState("");
    const [notesResults, setNotesResults] = useState(notes);
    useEffect(() => {
        setNotesResults(sortBySourcePath(notes));
    }, [notes]);
    const handleInsightSearch = (e) => {
        const value = e.target.value;
        setInsightSearchValue(value);

        if (value.trim() === "") {
            setNotesResults(sortArrayOfObjects(notes, "note_name"));
        } else {
            const filtered = searchByKey(notes, "note_name", value);
            setNotesResults(sortArrayOfObjects(filtered, "note_name"));
        }
    };
    const [storiesSearchValue, setStoriesSearchValue] = useState("");
    const [storiesResults, setStoriesResults] = useState(stories);
    useEffect(() => {
        setStoriesResults(sortBySourcePath(stories));
    }, [stories]);
    const handleStoriesSearch = (e) => {
        const value = e.target.value;
        setStoriesSearchValue(value);

        if (value.trim() === "") {
            setStoriesResults(sortArrayOfObjects(stories, "story_name"));
        } else {
            const filtered = searchByKey(stories, "story_name", value);
            setStoriesResults(sortArrayOfObjects(filtered, "story_name"));
        }
    };




    const { handlePDFLinkClick, handleVideoLinkClick } = useReferenceLinkClick(true);

    const [context, setContext] = useState('');
    const [storyline, setStoryline] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [isPending, setIsPending] = useState(false);

    const [value, setValue] = useState('');
    const editorRef = useRef(null);

    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, true] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'image', 'video'],
        ],
    };

    const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'list',
        'bullet',
        'link',
        'image',
    ];

    // const [story, setStory] = useState(generatedStory);

    const [storyTitle, setStoryTitle] = useState(story?.story_name);
    useEffect(() => {
        story?.story_name?.replace(/#/g, "").trim();
        setStoryTitle(story?.story_name);
    }, [story?.story_name]);

    async function autoGenerateStory() {
        setIsLoading(true);
        const httpPayload = {
            storyContext: context,
            storyline,
            with_checked_sources: displayedSources?.filter(item => item?.is_checked)?.map(item => ({ source_path: item?.source_path, category: item?.category }))
        };
        try {

            if (!displayedSources?.every(item => item?.is_checked === false)) {
                await makeApiRequest(
                    `/handle-embeddings`,
                    "post",
                    JSON.stringify({
                        sources: displayedSources?.filter(item => item?.is_checked)?.map(item => ({ source_path: item?.source_path, category: item?.category })),
                    })
                );
            }

            const res = await makeApiRequest(
                "/auto-generate-story",
                "post",
                httpPayload
            );

            setGeneratedStory({ ...res, story_name: storyTitle || res?.story_name });
            setShowStoriesEditor(true);
        } catch (error) {
            console.log(error);
        } finally {
            // setIsGeneratingIntroConlusion(false);
            setIsLoading(false);
        }
    }

    const [tooltipVisible, setTooltipVisible] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setPosition({
            x: e.clientX - rect.left - 60,
            y: e.clientY - rect.top + 10,
        });
    };

    const handleMouseEnter = () => context === "" && setTooltipVisible(true);
    const handleMouseLeave = () => setTooltipVisible(false);

    return (
        <div className="relative z-10 flex flex-col h-full gap-1">
            {/* context */}
            <div className="relative w-full">
                {/* <label
                    className={`absolute left-2 top-2 text-gray-500  px-1 transition-all duration-200 pointer-events-none
                    ${isActive ? 'text-md -top-7 left-1 text-blue-600' : 'text-base'}`}
                >
                    Write your story outline
                </label> */}
                <textarea
                    className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows="1"
                    placeholder="Provide story context"
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                />
            </div>

            {/* storyline */}
            <div className="relative w-full">
                {/* <label
                    className={`absolute left-2 top-2 text-gray-500  px-1 transition-all duration-200 pointer-events-none
                    ${isActive ? 'text-md -top-7 left-1 text-blue-600' : 'text-base'}`}
                >
                    Write your story outline
                </label> */}
                <textarea
                    className={`w-full p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md text-textColor-200" : '!border !border-textColor-100 text-textColor-300'} rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    rows="1"
                    placeholder="Storyline"
                    value={storyline}
                    onChange={(e) => setStoryline(e.target.value)}
                />
            </div>

            {/* generate outline button */}
            {/* <button onClick={autoGenerateStory} className='relative flex items-center justify-center w-full max-w-full gap-2 py-2 m-auto text-center text-white rounded-md cursor-not-allowed disabled:opacity-50 bg-primary-300/85 hover:bg-primary-300'
                disabled={isLoading}>
                {isLoading ? <><LoadingSpinner isSmall /> Generating...</> : 'Generate outline'}
            </button> */}
            {/* generate button */}
            <div className='relative inline-block' onMouseMove={handleMouseMove}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}>
                <RippleButton fullWidth cssClasses='flex items-center gap-1 disabled:cursor-not-allowed  p-2'
                    disabled={context === "" || isLoading} onClick={autoGenerateStory}>
                    {isLoading ? <><AutoAwesomeIcon color="white" className="animate-customPulse" /> <span className="animate-customPulse">Generating...</span></> : 'Generate story'}
                </RippleButton>
                {tooltipVisible && (
                    <p
                        // onMouseEnter={() => setTooltipVisible(false)}
                        className={`absolute p-2 text-sm font-semibold rounded shadow-2xl bg-background_workspace top-full ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} z-20`}
                        style={{ top: position.y, left: position.x, opacity: tooltipVisible ? 1 : 0 }}
                    >
                        Please provide the context
                    </p>
                )}
            </div>

            {/* list of insights and stories */}
            <div className='relative z-10 flex flex-col flex-1 h-full overflow-hidden'>
                <div>
                    {/* <MetadataGen key={0} name="genMetadata" /> */}
                    <div className="relative z-10 flex items-center gap-3 mt-4 mb-3">
                        {
                            [
                                {
                                    icon: ArticleOutlinedIcon,
                                    title: "Insights"
                                },
                                {
                                    icon: AutoStoriesOutlinedIcon,
                                    title: "Stories"
                                },
                            ].map(({ icon: Icon, title }, index) => {
                                return (
                                    <div className={`cursor-pointer flex items-center gap-1 pb-1 ${title === currentTab ? ' !text-primary-300' : ''}`} key={title} onClick={() => setCurrentTab(title)}>
                                        <Icon className={`${title !== currentTab && (theme === 'light' ? 'text-textColor-200' : 'text-[#ABAEB4]')}`} />
                                        <BaseHeading key={index} text={title} className={` font-extrabold !text-[12px] ${title === currentTab ? ' !text-primary-300' : ''}`} />
                                    </div>
                                );
                            })
                        }
                    </div>
                </div>
                {/* notes */}
                {
                    currentTab === "Insights" ?
                        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
                            <InsightsList />
                        </div>
                        : currentTab === "Stories" ?
                            <>
                                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-auto">
                                    <StoriesList setShowStoriesEditor={setShowStoriesEditor} setGeneratedStory={setGeneratedStory} />
                                </div>
                            </>
                            :
                            null
                }
            </div>
        </div>
    );
}

export default StoriesInsightsTab;
