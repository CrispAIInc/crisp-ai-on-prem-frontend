import AddIcon from '@mui/icons-material/Add';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import ImageResize from "quill-image-resize-module-react";
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext.jsx';
import { useToast } from '../../contexts/toastContext.jsx';
import useFirebase from '../../hooks/useFirebase.js';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';
import useResources from '../../hooks/useResources';
import { generateRandomHash, htmlToPlainText, searchByKey, sortArrayOfObjects, sortBySourcePath } from '../../utils';
import MediaEntertainment from '../MediaEntertainment';
import MetadataGen from '../MetadataGen';
import ReelViewer from '../ReelViewer';
import RippleButton from '../RippleButton';
import StoriesInsightsTab from '../StoriesInsightsTab';
import './chat-panel.css';
import StoryEditor from '../StoryEditor/index.jsx';

Quill.register("modules/imageResize", ImageResize);

// Custom module to handle reference link clicks
class ReferenceClickHandler {
  constructor(quill, options) {
    this.quill = quill;
    this.options = options;
    this.handleClick = this.handleClick.bind(this);

    // Add click event listener to the editor
    this.quill.root.addEventListener('click', this.handleClick);
  }

  handleClick(e) {
    const target = e.target;

    // Check if clicked element is a reference link
    if (target.classList.contains('reference-link')) {
      e.preventDefault();
      e.stopPropagation();

      const type = target.getAttribute('data-ref-type');
      const value = target.getAttribute('data-ref-value');

      // Call the callback function passed from options
      if (this.options.onReferenceClick && type && value) {
        this.options.onReferenceClick(type, value);
      }
    }
  }
}

// Extend the Block blot to allow custom attributes
const Block = Quill.import("blots/block");

class ReferenceLink extends Block {
  static create(value) {
    const node = super.create();
    if (value?.["data-ref-type"]) {
      node.setAttribute("data-ref-type", value["data-ref-type"]);
    }
    if (value?.["data-ref-value"]) {
      node.setAttribute("data-ref-value", value["data-ref-value"]);
    }
    if (value?.["class"]) {
      node.classList.add(value["class"]);
    }
    return node;
  }

  static formats(domNode) {
    return {
      "data-ref-type": domNode.getAttribute("data-ref-type"),
      "data-ref-value": domNode.getAttribute("data-ref-value"),
      class: domNode.getAttribute("class"),
    };
  }
}

ReferenceLink.blotName = "reference";
ReferenceLink.tagName = "li"; // or 'div', depending on your use
Quill.register(ReferenceLink, true);
Quill.register('modules/referenceClickHandler', ReferenceClickHandler);

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
const ChatPanel = () => {
  const { sidebarWidth: rightWidth, handleMouseDown: handleRightMouseDown, handleDoubleClick, maxWidth, setSidebarWidth } = useResizableSidebar(200, false);

  const { handlePDFLinkClick, handleVideoLinkClick } = useReferenceLinkClick(true);

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
    theme,
    stories,
    setSelectedStory,
    selectedStory,
    setIsNewStory,
    setStories
  } = useContext(MainContext);

  const { notify } = useToast();

  const { getStories, getNotes } = useResources({ setReels, setStories, setNotes });

  const [value, setValue] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const editorRef = useRef(null);

  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, true] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image', 'video'],
    ],
    imageResize: {
      parchment: Quill.import("parchment"),
      modules: ["Resize", "DisplaySize", "Toolbar"],
    }
  }), []);

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

  const closeEditor = useCallback(() => {
    setIsNewInsight(false);
    // setActualTab(null);
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
    setSelectedStory({
      story_id: "",
      text: [],
      story_name: "",
      models: [],
    });
    setShowEditor(false);
    setShowStoriesEditor(false);
  }, [setShowEditor]);

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

  const handleSave = async (event) => {
    event?.preventDefault();
    if ((!isNewInsight && selectedNote.note_name === "") || (isNewInsight && noteTitle === "")) {
      notify({
        variant: "error",
        heading: "Oops!",
        subheading: "Note title cannot be empty",
      });
      return;
    }

    if ((isNewNote || isNewInsight) && notes.every(n => n.note_name !== selectedNote.note_name)) {
      const dateTimeStr = new Date().toISOString().replace(/:/g, '-').split('.')[0] + Math.random().toString(36).substring(7);
      selectedNote.note_id = dateTimeStr;
    }

    try {
      const noteId = new Date().toISOString().replace(/:/g, '-').split('.')[0] + Math.random().toString(36).substring(7);
      await makeApiRequest('/save-note', 'post', {
        noteID: selectedNote.note_id || noteId,
        selectedNote: isNewInsight ? { ...selectedNote, note_id: noteId, note_name: noteTitle, text: [{ answer: htmlToPlainText(value), content: value, question: "", model: "", id: generateRandomHash(5), references: { videoLinks: [], pdfLinks: [], imageLinks: [] } }] } : { ...selectedNote, note_name: noteTitle },
        noteName: noteTitle,
        noteNumber: parseInt(noteIndex),
        isNewNote: (isNewNote || isNewInsight)
      });

      getNotes();
      notify({
        variant: "success",
        heading: "Insight saved successfully!",
      });
    } catch (error) {
      console.error('Error saving note:', error);
      notify({
        variant: "error",
        heading: "Oops!",
        subheading: "Failed to save insight.",
      });
    }
  };

  const handleSidebarToggle = useCallback(() => {
    setSidebarWidth(prev => {
      if (prev !== (maxWidth - (maxWidth * 0.3))) return maxWidth - (maxWidth * 0.3);
      return window.innerWidth / 4;
    });
    setIsRightSidebarOpen(true);
  }, [setSidebarWidth, maxWidth, setIsRightSidebarOpen]);
  const handleReferenceClick = (e, { fileName, fileType }, file) => {

    const _file = file || knowledgeBase?.find(item => item?.source_path === (fileName + "." + fileType));

    if (_file) {
      if (fileType === "mp4") {
        handleVideoLinkClick(e, _file);
      } else {
        handlePDFLinkClick(e, _file);
      }
    }
  };

  function extractFilenameAndType(input) {
    const trimmed = input.split('|')[0].trim(); // Get part before '|'
    const parts = trimmed.split('.');

    if (parts.length < 2) return null; // Invalid format

    const fileType = parts.pop(); // Get extension
    const fileName = parts.join('.'); // Join rest in case filename has dots

    return {
      fileName,
      fileType
    };
  }

  useEffect(() => {
    setNoteTitle(selectedNote?.note_name);
  }, [selectedNote?.note_name]);

  const [showStoriesEditor, setShowStoriesEditor] = useState(false);
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
  // const showSelectedReel = (e, reel, index) => {
  //   setReel(reel);
  //   setIsReelOpen(true);
  // };

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

  // const [hoveredReel, setHoveredReel] = useState(null);
  // const hoveredReelRef = useRef(null);
  // const handleMouseEnterReel = (id) => {
  //   setHoveredReel(id);
  //   hoveredReelRef.current = id;
  // };
  // const handleMouseLeaveReel = () => {
  //   setHoveredReel(null);
  // };

  // const [isReelDeleting, setIsReelDeleting] = useState(false);
  // async function deleteReel(event, reel) {
  //   event.preventDefault();
  //   setIsReelDeleting(true);
  //   try {
  //     const publicReelUrl = await getPublicUrl(reel.reel_video_url);
  //     await makeApiRequest('/remove-reel', 'POST', JSON.stringify({
  //       videoUrl: publicReelUrl,
  //     }));

  //     notify({
  //       variant: "success",
  //       heading: "Reel deleted successfully!",
  //     });
  //     getReels();
  //   } catch (error) {
  //     console.log(error);
  //     notify({
  //       variant: "error",
  //       heading: "Oops!",
  //       subheading: "An error occurred while deleting the reel",
  //     });
  //   } finally {
  //     setIsReelDeleting(false);
  //   }
  // }

  function handleTabClick(item) {
    setActualTab(item);
  }

  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [verbosityValue, setVerbosityValue] = useState('Medium');
  const [context, setContext] = useState('');

  const [isGeneratingReel, setIsGeneratingReel] = useState(false);
  const [reelContext, setReelContext] = useState('');
  const [reelVerbosityValue, setReelVerbosityValue] = useState('Short (1min)');

  const [storyTitle, setStoryTitle] = useState(generatedStory?.story_name);

  useEffect(() => {
    setStoryTitle(generatedStory?.story_name);
  }, [generatedStory?.story_name]);

  const [reel, setReel] = useState({
    id: "",
    title: "",
    reel_video_url: "",
    thumbnail: ""
  });
  const [isReelOpen, setIsReelOpen] = useState(false);

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
  // const [reelsSearchValue, setReelsSearchValue] = useState("");
  // const [reelsResults, setReelsResults] = useState(reels);
  // useEffect(() => {
  //   setReelsResults(sortBySourcePath(reels));
  // }, [reels]);
  // const handleReelsSearch = (e) => {
  //   const value = e.target.value;
  //   setReelsSearchValue(value);

  //   if (value.trim() === "") {
  //     setReelsResults(sortArrayOfObjects(reels, "title"));
  //   } else {
  //     const filtered = searchByKey(reels, "title", value);
  //     setReelsResults(sortArrayOfObjects(filtered, "title"));
  //   }
  // };

  // const [showUpdateReelTitleModal, setShowUpdateReelTitleModal] = useState(false);
  // function handleOpenFilenameUpdateModal(event, reel) {
  //   event.stopPropagation();
  //   setReelTitleUpdateValue(reel.title);
  //   setShowUpdateReelTitleModal(true);
  // }

  // const [reelTitleUpdateValue, setReelTitleUpdateValue] = useState('');

  const [isPending, setIsPending] = useState(false);

  async function handleSaveStory() {
    try {
      setIsPending(true);
      await makeApiRequest('/stories', "POST", JSON.stringify({ ...generatedStory, story_name: storyTitle || generatedStory?.story_name }));
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
      `<head><meta charset='utf-8'><title>Story:${generatedStory.story_name}</title></head><body>`;
    var footer = "</body></html>";
    const htmlString = `
    <div>
        <h1 style='text-align: center; margin-bottom: 30px;'>${generatedStory.story_name
      }</h1>
    </div>
    
    <div>
        ${generatedStory?.content ? `<div>${generatedStory?.content}</div>` : generatedStory.text
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
    fileDownload.download = generatedStory.story_name + ".doc";
    fileDownload.click();
    document.body.removeChild(fileDownload);
  }

  return (
    <aside
      className={`relative w-1/4 h-full overflow-hidden overflow-y-auto bg-background ${!isRightSidebarOpen ? '!w-0 !px-0 !border-none' : "px-2"
        }  ${theme === 'light' && '!border-r !border-textColor-100/50'} flex flex-col max-h-full z-1`}
      style={{ width: rightWidth }}
    >
      <div className={`flex relative items-center justify-between gap-2 ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
        }`}>
        <div className='flex flex-col w-full'>
          <h5 className={`select-none p-[10px]   ${theme === "light" ? "!border-b !border-b-textColor-100/50 text-textColor-200" : "text-textColor-100 !border-b !border-b-textColor-300"
            }  text-center w-full`}>
            Studio</h5>
        </div>
        {/* <RippleButton>Hello</RippleButton> */}
        {(showEditor || showStoriesEditor) && (
          <h5
            onClick={closeEditor}
            className={`absolute right-0 top-2 rotate-180 cursor-pointer ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
              } text-[22px]`}
          >
            <KeyboardReturnIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
          </h5>
        )}
      </div>

      <h5 className={`select-none ${theme === "light" ? " text-textColor-200" : "text-textColor-100"
        }  text-center`}>
        Generator Services</h5>

      {/* Background blur elements */}
      <div className="w-56 h-56 bg-blue-500 rounded-full absolute left-3/4 top-10 -z-1 blur-[160px]"></div>
      <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-35 top-40 -z-1 blur-[160px]"></div>
      <div className="w-56 h-56 bg-pink-300 rounded-full absolute left-1/2 top-80 -z-1 blur-[160px]"></div>

      {/* Resizer */}
      {isRightSidebarOpen && (
        <div
          className="absolute top-0 bottom-0 z-40 w-1 h-full bg-primary-200/10 hover:bg-primary-100 hover:cursor-col-resize"
          style={{ right: rightWidth - (rightWidth * 0.01) }}
          onMouseDown={handleRightMouseDown}
          onDoubleClick={handleDoubleClick}
        />
      )}



      {/* Toggle button */}
      <div className="absolute left-0 z-10 flex flex-col items-center justify-center h-auto px-2 py-2 rounded-md top-1.5 w-fit">
        <button
          className={`cursor-pointer ${theme === 'dark' && 'text-textColor-100'} rotate-180`}
          onClick={handleSidebarToggle}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className="icon max-md:hidden">
            <path d="M6.83496 3.99992C6.38353 4.00411 6.01421 4.0122 5.69824 4.03801C5.31232 4.06954 5.03904 4.12266 4.82227 4.20012L4.62207 4.28606C4.18264 4.50996 3.81498 4.85035 3.55859 5.26848L3.45605 5.45207C3.33013 5.69922 3.25006 6.01354 3.20801 6.52824C3.16533 7.05065 3.16504 7.71885 3.16504 8.66301V11.3271C3.16504 12.2712 3.16533 12.9394 3.20801 13.4618C3.25006 13.9766 3.33013 14.2909 3.45605 14.538L3.55859 14.7216C3.81498 15.1397 4.18266 15.4801 4.62207 15.704L4.82227 15.79C5.03904 15.8674 5.31234 15.9205 5.69824 15.9521C6.01398 15.9779 6.383 15.986 6.83398 15.9902L6.83496 3.99992ZM18.165 11.3271C18.165 12.2493 18.1653 12.9811 18.1172 13.5702C18.0745 14.0924 17.9916 14.5472 17.8125 14.9648L17.7295 15.1415C17.394 15.8 16.8834 16.3511 16.2568 16.7353L15.9814 16.8896C15.5157 17.1268 15.0069 17.2285 14.4102 17.2773C13.821 17.3254 13.0893 17.3251 12.167 17.3251H7.83301C6.91071 17.3251 6.17898 17.3254 5.58984 17.2773C5.06757 17.2346 4.61294 17.1508 4.19531 16.9716L4.01855 16.8896C3.36014 16.5541 2.80898 16.0434 2.4248 15.4169L2.27051 15.1415C2.03328 14.6758 1.93158 14.167 1.88281 13.5702C1.83468 12.9811 1.83496 12.2493 1.83496 11.3271V8.66301C1.83496 7.74072 1.83468 7.00898 1.88281 6.41985C1.93157 5.82309 2.03329 5.31432 2.27051 4.84856L2.4248 4.57317C2.80898 3.94666 3.36012 3.436 4.01855 3.10051L4.19531 3.0175C4.61285 2.83843 5.06771 2.75548 5.58984 2.71281C6.17898 2.66468 6.91071 2.66496 7.83301 2.66496H12.167C13.0893 2.66496 13.821 2.66468 14.4102 2.71281C15.0069 2.76157 15.5157 2.86329 15.9814 3.10051L16.2568 3.25481C16.8833 3.63898 17.394 4.19012 17.7295 4.84856L17.8125 5.02531C17.9916 5.44285 18.0745 5.89771 18.1172 6.41985C18.1653 7.00898 18.165 7.74072 18.165 8.66301V11.3271ZM8.16406 15.995H12.167C13.1112 15.995 13.7794 15.9947 14.3018 15.9521C14.8164 15.91 15.1308 15.8299 15.3779 15.704L15.5615 15.6015C15.9797 15.3451 16.32 14.9774 16.5439 14.538L16.6299 14.3378C16.7074 14.121 16.7605 13.8478 16.792 13.4618C16.8347 12.9394 16.835 12.2712 16.835 11.3271V8.66301C16.835 7.71885 16.8347 7.05065 16.792 6.52824C16.7605 6.14232 16.7073 5.86904 16.6299 5.65227L16.5439 5.45207C16.32 5.01264 15.9796 4.64498 15.5615 4.3886L15.3779 4.28606C15.1308 4.16013 14.8165 4.08006 14.3018 4.03801C13.7794 3.99533 13.1112 3.99504 12.167 3.99504H8.16406C8.16407 3.99667 8.16504 3.99829 8.16504 3.99992L8.16406 15.995Z"></path>
          </svg>
        </button>
      </div>

      {/* Editor or Tabs */}
      {showEditor ? (
        <div className="flex-1 h-full overflow-y-auto">
          <div className="h-full max-h-full ml-auto overflow-y-auto !overflow-y-hidden flex flex-col">
            <div className="flex items-center justify-between">
              <RippleButton
                cssClasses="py-1 pl-2 !pr-3 mb-3 mt-4"
                onClick={handleSave}
              >
                <AddIcon />
                <span className={` !text-[12px] font-medium`}>
                  Save {currentTab === "Insights" ? "insight" : "story"}
                </span>
              </RippleButton>
            </div>
            <div>
              <input
                className={`${theme === 'dark' && 'text-textColor-100'
                  } font-medium p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-300" : '!border !border-textColor-100'} !outline-none w-full !z-[999999]`}
                placeholder="New title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>
            <div className={`${isNewInsight && 'h-full'}`}>
              {!isNewInsight && (
                <style>
                  {`
                    .ql-toolbar.ql-snow + .ql-container.ql-snow {
                      display: none !important;
                    }
                  `}
                </style>
              )}
              {
                theme === "light" ? (
                  <style>
                    {`
                    .custom-quill .ql-editor { color: #333 !important; }
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
                    .custom-quill .ql-editor { color: #FFF !important; }
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
              <ReactQuill
                ref={editorRef}
                theme="snow"
                value={value}
                onChange={setValue}
                readOnly={!isNewInsight}
                className="h-full custom-quill"
                modules={modules}
                formats={formats}
              />
            </div>
            {selectedNote?.note_name !== "" ? <div className={`overflow-y-auto h-full max-h-full space-y-6  !z-10 relative !border ${theme === "dark" ? "!border !border-textColor-300" : '!border !border-textColor-100'}`}>
              {selectedNote?.text.map((item, index) => (
                <div
                  key={index}
                  className="pl-2 mb-4"
                >
                  <h5 className={`z-10 mt-2 font-bold ${theme === "light" ? "text-textColor-300" : "text-textColor-200 text-md"
                    }`}>{typeof item?.question === "string" ? item?.question : item?.question?.query}</h5>
                  <p className={`z-10 text-textColor-200 ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                    }`} dangerouslySetInnerHTML={{ __html: item?.answer }}></p>

                  {/* PDF Links */}
                  {(item?.references?.pdfLinks?.length > 0 || item?.refs?.pdfLinks?.length > 0) && (
                    <div>
                      {item[item.refs ? 'refs' : 'references']?.pdfLinks?.map((link, i) => (
                        <a
                          key={i}
                          href="#"
                          onClick={(e) => handleReferenceClick(e, extractFilenameAndType(typeof link === "string" ? link : link?.source_path), (typeof link === "string" ? null : link))}
                          className="z-10 mr-2 reference-link"
                        >
                          {typeof link === "string" ? link : (link?.source_path + " | " + parseInt(link?.page) + 1)}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Video Links */}
                  {(item?.references?.videoLinks?.length > 0 || item?.refs?.videoLinks?.length > 0) && (
                    <div>
                      {item[item.refs ? 'refs' : 'references']?.videoLinks?.map((link, i) => (
                        <li
                          key={i}
                          onClick={(e) => handleReferenceClick(e, extractFilenameAndType(typeof link === "string" ? link : link?.source_path), (typeof link === "string" ? null : link))}
                          className="z-10 mr-2 text-blue-600 break-words list-none cursor-pointer reference-link"
                        >
                          {typeof link === "string" ? link : (link?.source_path + " | " + link?.timestamp)}
                        </li>
                      ))}
                    </div>
                  )}

                  {/* Image Links */}
                  {(item?.references?.imageLinks?.length > 0 || item?.refs?.imageLinks?.length > 0) && (
                    <div>
                      {item[item.refs ? 'refs' : 'references']?.imageLinks?.map((link, i) => (
                        <img
                          key={i}
                          src={typeof link === "string" ? link : link?.source_path}
                          alt="image"
                          className="z-10 max-w-full mr-2 reference-link"
                          onClick={(e) => handleReferenceClick(e, typeof link === "string" ? link : link?.source_path, typeof link === "string" ? null : link)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
              :
              <>
                {selectedStory.story_name !== "" && <div className={`overflow-y-auto h-full max-h-full space-y-6 !z-10 relative !border bg-red-600 !border-textColor-100`}>
                  <div className={`flex-1 pl-2 !border ${theme === "dark" ? "!border !border-textColor-300" : '!border !border-textColor-100'} overflow-y-auto h-full ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                    }`}>
                    {
                      selectedStory?.text?.map(section => (
                        <div key={section.id}>
                          <h4>{section.outline.name}</h4>
                          {
                            section.content?.map((content, index) => (
                              <div key={index}>
                                <p>{content.answer}</p>
                                {/* refs */}
                                <div className="mt-2 mb-4">
                                  {
                                    content?.videosArr?.map((ref, index) => (
                                      <p onClick={(e) => handleVideoLinkClick(e, ref)} className="mb-2 ml-2 break-words cursor-pointer text-primary-300 w-fit" key={index}>{ref?.source_path} | {ref?.timestamp}</p>
                                    ))
                                  }

                                  {
                                    content?.pdfsArr?.map((ref, index) => (
                                      <p onClick={(e) => handlePDFLinkClick(e, ref)} className="mb-2 ml-2 break-words cursor-pointer text-primary-300 w-fit" key={index}>{ref?.source_path} | {ref?.timestamp}</p>
                                    ))
                                  }
                                  {
                                    content?.imgsArr?.map((ref, index) => (
                                      <p onClick={(e) => handlePDFLinkClick(e, ref)} className="mb-2 ml-2 break-words cursor-pointer text-primary-300 w-fit" key={index}>{ref?.source_path} | {ref?.timestamp}</p>
                                    ))
                                  }

                                </div>
                                {/* ... */}
                              </div>
                            ))
                          }
                        </div>
                      ))
                    }
                  </div>
                </div>
                }</>
            }
          </div>
        </div>
      ) : showStoriesEditor ? (
        <StoryEditor generatedStory={generatedStory} storyTitle={storyTitle} setStoryTitle={setStoryTitle} />
      ) : (
        <div className='z-20 flex flex-col h-full gap-2 overflow-y-hidden'>
          {/* GenMetadata & GenStories */}
          {/* ::::::::::::::::::::::::::::::::::::::::::: */}
          <div>
            {/* buttons */}
            <div className="flex justify-around gap-5 mt-2 flex-items">
              {[
                { id: "genMetadata", title: "Cataloging" },
                { id: "genStories", title: "Insights & Stories" },
                { id: "genMedia", title: "Reels" }
              ].map(item => (
                <h6
                  id={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`text-[14px] select-none text-md cursor-pointer ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} ${item.id === actualTab && "font-bold !text-primary-300"}`}
                  key={item.id}
                >
                  {item.title}
                </h6>
              ))}
            </div>
          </div>
          {actualTab !== null && <div className='h-full overflow-y-hidden'>
            {
              actualTab === "genMetadata" ? (
                <MetadataGen verbosityValue={verbosityValue} setVerbosityValue={setVerbosityValue}
                  context={context} setContext={setContext} isGeneratingMetadata={isGeneratingMetadata} setIsGeneratingMetadata={setIsGeneratingMetadata} />
              ) : actualTab === "genStories" ? (
                <StoriesInsightsTab setShowStoriesEditor={setShowStoriesEditor} generatedStory={generatedStory} setGeneratedStory={setGeneratedStory} />
              ) : actualTab === "genMedia" ? (
                <MediaEntertainment isGeneratingReel={isGeneratingReel} setIsGeneratingReel={setIsGeneratingReel} context={reelContext} setContext={setReelContext}
                  verbosityValue={reelVerbosityValue} setVerbosityValue={setReelVerbosityValue} reel={reel} setReel={setReel} reels={reels} setReels={setReels}
                  isReelOpen={isReelOpen} setIsReelOpen={setIsReelOpen} />
              ) : null
            }
          </div>}
        </div>
      )}
      {isReelOpen && <ReelViewer reel={reel} closeReel={() => setIsReelOpen(false)} setReel={setReel} />}
    </aside>
  );
};

export default ChatPanel;