import "react-quill/dist/quill.snow.css";
import LoadingSpinner from '../LoadingSpinner';
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext.jsx';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';
import AddIcon from '@mui/icons-material/Add';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useToast } from "../../contexts/toastContext";
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RippleButton from '../RippleButton';
import useResources from '../../hooks/useResources';
import useFirebase from '../../hooks/useFirebase.js';
import InsightsList from "../InsightsList";
import { useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import DeleteIcon from "@mui/icons-material/Delete";
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import AutoStoriesOutlinedIcon from '@mui/icons-material/AutoStoriesOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';
import MetadataGen from '../MetadataGen';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";
import toast from 'react-simple-toasts';
import BaseHeading from '../BaseHeading';
import { generateRandomHash, htmlToPlainText, searchByKey, sortArrayOfObjects, sortBySourcePath } from '../../utils';
import MediaEntertainment from '../MediaEntertainment';
import ReelViewer from '../ReelViewer';
import GsFile from '../GsFile/index.jsx';
import FilenameUpdateModal from "../AppSingleValueModal";

function StoriesEditor({ generatedStory: story, setGeneratedStory: setStory, setShowStoriesEditor }) {

    const { getPublicUrl } = useFirebase();

    const [generatedStory, setGeneratedStory] = useState(null);

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

            setStory({ ...res, story_name: storyTitle || res?.story_name });
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

    async function handleSaveStory() {
        try {
            setIsPending(true);
            await makeApiRequest('/stories', "POST", JSON.stringify({ ...story, story_name: storyTitle || story?.story_name }));
            notify({
                variant: "success",
                heading: "Story saved successfully!",
            });

            // update stories
            getStories();
        }
        catch (e) {
            console.log(e);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: 'Something bad happened. Please try again.',
            });
        } finally {
            setIsPending(false);
        }
    }

    function exportHTML() {
        var header =
            "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
            "xmlns:w='urn:schemas-microsoft-com:office:word' " +
            "xmlns='http://www.w3.org/TR/REC-html40'>" +
            `<head><meta charset='utf-8'><title>Story:${story.story_name}</title></head><body>`;
        var footer = "</body></html>";
        const htmlString = `
    <div>
        <h1 style='text-align: center; margin-bottom: 30px;'>${story.story_name
            }</h1>
    </div>
    
    <div>
        ${story?.content ? `<div>${story?.content}</div>` : story.text
                ?.map(
                    (item) => `
            <div>
                ${item.outline.name
                            ? `
                    <div>
                        <div>
                            <div>
                                ${item.sectionImages?.length > 0
                                ? `
                                    <div>
                                        ${item.sectionImages
                                    .map(
                                        (imgBlob) => `
                                            <img width="300" height="300" src="${imgBlob}" alt="img" />
                                        `
                                    )
                                    .join("")}
                                    </div>
                                `
                                : ""
                            }
                                <h3>${item.outline.name.replace(
                                /\n/g,
                                "<br>"
                            )}</h3>
                            </div>
                        </div>
                    </div>
                `
                            : ""
                        }
                <div>
                    <div>
                        ${item.content
                            ? `
                            <div>
                                <div>
                                    ${typeof item.content === "string"
                                ? `
                                        ${item.contentImages?.length > 0
                                    ? `
                                            <div>
                                                ${item.contentImages
                                        .map(
                                            (imgBlob) => `
                                                    <img width="300" height="300" src="${imgBlob}" alt="img" />
                                                `
                                        )
                                        .join("")}
                                            </div>
                                        `
                                    : ""
                                }
                                        <h5>${item.content.replace(
                                    /\n/g,
                                    "<br>"
                                )}</h5>
                                    `
                                : `
                                        ${item.content?.map(
                                    (i) => `
                                            <div>
                                                <div>
                                                    ${!i.answer.includes(
                                        "https://oaidalleapiprodscus.blob"
                                    )
                                            ? `
                                                        <p>${i.answer.replace(
                                                /\n/g,
                                                "<br>"
                                            )}</p>
                                                    `
                                            : `
                                                        <img width="300" height="300" src="${i.answer}" alt="image" />
                                                    `
                                        }
                                                </div>
                                                ${(i?.videosArr?.length > 0 ||
                                            i?.keyframesArr?.length > 0 ||
                                            i?.pdfsArr?.length > 0 ||
                                            i?.imgsArr?.length > 0)
                                            ? `
                                                    <div>
                                                        <p>References:</p>
                                                        ${i?.videosArr?.length >
                                                0
                                                ? `
                                                            <ul>
                                                                ${i?.videosArr
                                                    ?.map(
                                                        (video) => `
                                                                    <li>${video.source_path +
                                                            " | Timestamp: " +
                                                            video.timestamp
                                                            }</li>
                                                                `
                                                    )
                                                    .join("")}
                                                            </ul>
                                                        `
                                                : ""
                                            }
                                                        ${i?.keyframeArr
                                                ?.length > 0
                                                ? `
                                                            <ul>
                                                                ${i?.keyframeArr
                                                    ?.map(
                                                        (video) => `
                                                                    <li>${video.source_path +
                                                            " | Keyframe: " +
                                                            video.timestamp
                                                            }</li>
                                                                `
                                                    )
                                                    .join("")}
                                                            </ul>
                                                        `
                                                : ""
                                            }
                                                        ${i?.pdfsArr?.length > 0
                                                ? `
                                                            <ul>
                                                                ${i?.pdfsArr
                                                    ?.map(
                                                        (pdf) => `
                                                                    <li>${pdf.source_path +
                                                            " | Page: " +
                                                            (parseInt(
                                                                pdf.page
                                                            ) +
                                                                1)
                                                            }</li>
                                                                `
                                                    )
                                                    .join("")}
                                                            </ul>
                                                        `
                                                : ""
                                            }
                                                        ${i?.imgsArr?.length > 0
                                                ? `
                                                            <ul>
                                                                ${i?.imgsArr?.map(
                                                    (img) => `
                                                                    <li>${img.source_path}</li>
                                                                `
                                                )
                                                    .join("")}
                                                            </ul>
                                                        `
                                                : ""
                                            }
                                                    </div>
                                                `
                                            : ""
                                        }
                                            </div>
                                        `
                                )
                                    .join("")}
                                    `
                            }
                                </div>
                            </div>
                        `
                            : `<p></p>`
                        }
                    </div>
                </div>
            </div>
        `
                )
                .join("")}
    </div>
    `;
        var sourceHTML = header + htmlString + footer;

        var source =
            "data:application/vnd.ms-word;charset=utf-8," +
            encodeURIComponent(sourceHTML);
        var fileDownload = document.createElement("a");
        document.body.appendChild(fileDownload);
        fileDownload.href = source;
        fileDownload.download = story.story_name + ".doc";
        fileDownload.click();
        document.body.removeChild(fileDownload);
    }

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
                    {isLoading ? <><AutoAwesomeIcon color="white" className="animate-customPulse" /> <span className="animate-customPulse">Generating...</span></> : 'Generate'}
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

            {/* save button */}
            {story !== null && <div className="flex items-center gap-1">
                <div
                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light'
                        ? 'hover:bg-light-hover-100/30'
                        : 'hover:bg-light-hover-200/20'
                        } z-10`}
                    onClick={handleSaveStory}
                >
                    {isPending ? <LoadingSpinner isSmall /> : <AddIcon style={{ color: theme === 'light' ? '#333' : '#ABAEB4' }} />}
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'
                        }`}>
                        Save story
                    </span>
                </div>
                <div
                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light'
                        ? 'hover:bg-light-hover-100/30'
                        : 'hover:bg-light-hover-200/20'
                        } z-10`}
                    onClick={exportHTML}
                >
                    <FileDownloadIcon style={{ color: theme === 'light' ? '#333' : '#ABAEB4' }} />
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'
                        }`}>
                        Export
                    </span>
                </div>
                <div
                    className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light'
                        ? 'hover:bg-light-hover-100/30'
                        : 'hover:bg-light-hover-200/20'
                        } z-10`}
                    onClick={() => { setStory(null); setStoryTitle(''); setContext(''); setShowStoriesEditor(false); }}
                >
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'
                        }`}>
                        Clear story
                    </span>
                </div>

            </div>
            }

            {/* editor */}

            <style>
                {`
                    .ql-toolbar.ql-snow + .ql-container.ql-snow {
                        display: none !important;
                    }
                `}
            </style>

            {
                theme === "light" ? (
                    <style>
                        {`
                        .ql-toolbar {
                          border-color: #78716C;
                          background-color: rgba(119, 168, 249, 0.2) !important;
                          color: red;
                        }
                        .ql-snow .ql-stroke {
                          stroke: #333 !important;
                        }

                        .ql-picker-label {
                          color: #333 !important;
                        }
                    `}
                    </style>
                ) : (
                    <style>
                        {`
                        .ql-toolbar {
                          border-color: #78716C;
                          background-color: rgba(119, 168, 249, 0.2) !important;
                          color: red;
                        }
                        .ql-snow .ql-stroke {
                          stroke: #fff !important;
                          fill: #fff !important;
                        }

                        .ql-picker-label {
                          color: #fff !important;
                        }
                    `}
                    </style>
                )
            }
            {/* <div className='flex flex-col flex-1 h-full max-h-full overflow-y-hidden'> */}
            {/* story title */}
            {/* <input
                    className={`${theme === 'dark' && 'text-textColor-100'
                        } font-medium p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-200/50 rounded-md" : '!border !border-textColor-100'} !outline-none w-full`}
                    placeholder="New title..."
                    value={storyTitle}
                    onChange={(e) => setStoryTitle(e.target.value)}
                />
                <ReactQuill
                    ref={editorRef}
                    theme="snow"
                    value={value}
                    onChange={setValue}
                    readOnly={false}
                    className=""
                    modules={modules}
                    formats={formats}
                />

                {story !== null && <div className={`flex-1 pl-2 !border ${theme === "dark" ? "!border !border-textColor-300" : '!border !border-textColor-100'} overflow-y-auto h-full ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                    }`}>
                    {
                        (story.text.length === 0 && story?.content !== "") ? (
                            <p dangerouslySetInnerHTML={{ __html: story?.content }}></p>
                        ) : story?.text?.map(section => (
                            <div key={section.id}>
                                <h4>{section.outline.name}</h4>
                                {
                                    section.content?.map((content, index) => (
                                        <div key={index}>
                                            <p>{content.answer}</p>
                                            <div className="mt-2 mb-4">
                                                {
                                                    content?.videosArr?.map((ref, index) => (
                                                        <p onClick={(e) => handleVideoLinkClick(e, ref)} className="mb-2 ml-2 break-words cursor-pointer text-primary-300 w-fit" key={index}>{ref?.source_path} | {ref?.timestamp}</p>
                                                    ))
                                                }

                                                {
                                                    content?.pdfsArr?.map((ref, index) => (
                                                        <p onClick={(e) => handlePDFLinkClick(e, ref)} className="mb-2 ml-2 break-words cursor-pointer text-primary-300 w-fit" key={index}>{ref.source_path + " | Page: " + (parseInt(ref?.page) + 1)}</p>
                                                    ))
                                                }
                                                {
                                                    content?.imgsArr?.map((ref, index) => (
                                                        <p onClick={(e) => handlePDFLinkClick(e, ref)} className="mb-2 ml-2 break-words cursor-pointer text-primary-300 w-fit" key={index}>{ref.source_path}</p>
                                                    ))
                                                }

                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        ))
                    }
                </div>} */}
            {/* </div> */}


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
                                <div className="flex flex-col overflow-y-auto">
                                    {(stories?.length > 0 || storiesResults?.length > 0) && <input className={`mt-4 mb-2 py-1 text-sm bg-transparent outline-none ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200 text-textColor-100'} w-full  rounded-full !pl-[10px]`} placeholder={"Search..."} value={storiesSearchValue} onChange={handleStoriesSearch} />}
                                    {
                                        (storiesResults?.length === 0 || stories?.length === 0) ? <BaseHeading text="No stories found" className={`text-center mt-4 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} />
                                            :
                                            storiesResults?.map((story, index) => (
                                                <div key={story.story_id} className={`flex items-center gap-2 ${theme === 'light'
                                                    ? 'hover:bg-textColor-100/10'
                                                    : 'hover:bg-light-hover-200/20'
                                                    } cursor-pointer p-2 rounded-md select-none`} onMouseEnter={() => handleMouseEnterStory(story.story_id)} onMouseLeave={handleMouseLeaveStory} onClick={(event) => showSelectedStory(event, story, index)}>
                                                    <AutoStoriesOutlinedIcon style={{ color: theme === 'light' ? '#333' : '#5293FD' }} />
                                                    <p className={`font-semibold flex-1 ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                                                        }`}>{story.story_name}</p>
                                                    {
                                                        hoveredStory === story?.story_id && (
                                                            isStoryDeleting ? <LoadingSpinner isSmall /> : <DeleteIcon
                                                                onClick={(event) => { event.stopPropagation(); deleteStory(event, story?.story_id); }}
                                                                className="text-red-400 cursor-pointer"
                                                            />
                                                        )
                                                    }
                                                </div>
                                            ))
                                    }
                                </div>
                            </>
                            :
                            null
                }
            </div>
        </div>
    );
}

export default StoriesEditor;
