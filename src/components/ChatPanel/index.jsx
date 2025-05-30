import { useContext, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import GenStories from '../GenStories';
import Guide from "../Guide";
import NotesSection from "../NotesSection";
import StoriesSection from '../StoriesSection';
import CopilotSection from '../CopilotSection';
import { MainContext } from '../../contexts/mainContext';

import AddIcon from '@mui/icons-material/Add';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';

import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import './chat-panel.css';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';
import MetadataGen from '../MetadataGen';

import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";
import toast from 'react-simple-toasts';
import makeApiRequest from '../../api';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick';
import BaseHeading from '../BaseHeading';
import { generateRandomHash, htmlToPlainText } from '../../utils';
import StoriesEditor from '../StoriesEditor';

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

const ChatPanel = () => {
  const { sidebarWidth: rightWidth, handleMouseDown: handleRightMouseDown, handleDoubleClick, maxWidth, setSidebarWidth } = useResizableSidebar(200, false);

  const { handlePDFLinkClick, handleVideoLinkClick } = useReferenceLinkClick(true);

  const {
    setSelectedNote,
    setIsEditingTitle,
    setIsNewNote,
    setShowNoteDetails,
    activeTab,
    setActiveTab,
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
  } = useContext(MainContext);

  const notesSectionSteps = [
    {
      target: ".new-note-button",
      content: "Click here to create a new insight.",
      disableBeacon: true,
      placement: "right",
    },
    {
      target: ".saved-notes",
      content: "This section contains all your saved insights. Click on a saved insight to view or edit it in the workspace.",
      placement: "right",
    },
  ];

  const storiesSectionSteps = [
    {
      target: ".new-story-button",
      content: "Click here to create a new story.",
      disableBeacon: true,
      placement: "right",
    },
    {
      target: ".saved-stories",
      content: "This section contains all your saved insights. Click on a saved insight to view or edit it in the workspace.",
      placement: "right",
    }
  ];

  const [value, setValue] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const editorRef = useRef(null);

  // Test function to handle reference link clicks
  const test = useCallback((type, value) => {
    console.log('eee');
    console.log(`Clicked ${type} reference:`, value);

    // You can add specific logic for different reference types here
    switch (type) {
      case 'pdf':
        // Handle PDF click
        console.log('PDF link clicked:', value);
        // Add your PDF handling logic here
        break;
      case 'video':
        // Handle video click
        console.log('Video link clicked:', value);
        // Add your video handling logic here
        break;
      case 'image':
        // Handle image click
        console.log('Image link clicked:', value);
        // Add your image handling logic here
        break;
      default:
        console.log('Unknown reference type:', type);
    }
  }, []);

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
    },
    referenceClickHandler: {
      onReferenceClick: test
    }
  }), [test]);

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
  }, [setShowEditor]);

  // const generateHtmlFromText = useCallback((textArray) => {
  //   return textArray
  //     .map((item) => {
  //       const refs = [];

  //       if (item?.references?.pdfLinks?.length > 0) {
  //         refs.push(
  //           `<div><strong>PDF:</strong> ${item.references.pdfLinks
  //             .map(
  //               (link) =>
  //                 `<a style="font-weight: bold;" class="reference-link"  data-ref-type="pdf" data-ref-value="${link}">${link}</a>`
  //             )
  //             .join(", ")}</div>`
  //         );
  //       }

  //       if (item?.references?.videoLinks?.length > 0) {
  //         refs.push(
  //           `<div><strong>Video:</strong> ${item.references.videoLinks
  //             .map(
  //               (link) =>
  //                 `<a onClick="${() => console.log("hehe")}" class="reference-link" data-ref-type="video" data-ref-value="${link}">${link}</a>`
  //             )
  //             .join(", ")}</div>`
  //         );
  //       }

  //       if (item?.references?.imageLinks?.length > 0) {
  //         refs.push(
  //           `<div><strong>Images:</strong> ${item.references.imageLinks
  //             .map(
  //               (link) =>
  //                 `<img src="${link}" alt="image" style="max-width: 100px;" class="reference-link" data-ref-type="image" data-ref-value="${link}" />`
  //             )
  //             .join(" ")}</div>`
  //         );
  //       }

  //       return `
  //         <div style="border-left: 4px solid ${item.color}; padding-left: 8px; margin-bottom: 16px;">
  //           <h2 style="color: #fff;"><strong>${item.question}</strong></h2>
  //           <br />
  //           <p>${item.answer}</p>
  //           <p><strong>Model:</strong> ${item.model}</p>
  //           ${refs.join("")}
  //           <br /><br />
  //         </div>
  //       `;
  //     })
  //     .join("<hr/>");
  // }, []);

  // useEffect(() => {
  //   const quill = editorRef.current?.getEditor();
  //   console.log(quill);
  //   console.log(value);
  //   if (!quill) return;

  //   quill.clipboard.dangerouslyPasteHTML(0, value);

  //   const root = quill.root;
  //   const handleClick = (e) => {
  //     const target = e.target.closest(".reference-link");
  //     if (target) {
  //       console.log("Clicked:", target.dataset.refType, target.dataset.refValue);
  //     }
  //   };

  //   root.addEventListener("click", handleClick);
  //   return () => root.removeEventListener("click", handleClick);
  // }, [value]);
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
      toast('Note title cannot be empty', { className: 'p-2 rounded-md', theme });
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
        selectedNote: isNewInsight ? { ...selectedNote, note_id: noteId, note_name: noteTitle, text: [{ answer: htmlToPlainText(value), content: value, question: "", model: "", id: generateRandomHash(5), references: { videoLinks: [], pdfLinks: [], imageLinks: [] } }] } : selectedNote,
        noteName: noteTitle,
        noteNumber: parseInt(noteIndex),
        isNewNote: (isNewNote || isNewInsight)
      });

      const data = await makeApiRequest("/notes", "post");
      setNotes(() => data);
      toast('Insight saved successfully', { className: 'p-2 rounded-md', theme });
    } catch (error) {
      console.error('Error saving note:', error);
      toast('Failed to save insight', { className: 'p-2 rounded-md', theme });
    }
  };

  const handleSidebarToggle = useCallback(() => {
    setSidebarWidth(prev => {
      if (prev !== maxWidth) {
        return maxWidth;
      }
      return window.innerWidth / 3.3333;
    });
    setIsRightSidebarOpen(true);
  }, [setSidebarWidth, maxWidth, setIsRightSidebarOpen]);

  // Effect to handle selected note changes
  // useEffect(() => {
  //   if (selectedNote?.note_id !== "") {
  //     setValue(generateHtmlFromText(selectedNote?.text));
  //     setNoteTitle(selectedNote?.note_name);
  //     setShowEditor(true);
  //   }
  // }, [selectedNote, generateHtmlFromText, setShowEditor]);
  const handleReferenceClick = (e, { fileName, fileType }, file) => {

    const _file = file || knowledgeBase?.find(item => item?.source_path === (fileName + "." + fileType));
    console.log(_file);

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

  const showSelectedNote = (event, note, index) => {
    setSelectedStory({
      story_id: "",
      text: [],
      story_name: "",
      models: [],
    });
    event.preventDefault();
    // console.log(note);
    setNoteIndex(index);
    setSelectedNote(note);
    setIsEditingTitle(false);
    setIsNewNote(false);
    setShowNoteDetails(true);
    // setActiveView('note');
    setShowEditor(true);
  };

  const [currentTab, setCurrentTab] = useState("insights");  // insights | stories

  const showSelectedStory = (e, story, index) => {
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
    setIsNewStory(false);
    setShowEditor(true);
  };

  const [actualTab, setActualTab] = useState(null); //genMetadata | genStories

  function handleTabClick(item) {
    if (item === 'Generate metadata') {
      setActualTab("genMetadata");
    } else if (item === "Generate stories") {
      setActualTab("genStories");
    }
  }

  function closeTopTabs() {
    setActualTab(null);
  }

  return (
    <aside
      className={`relative w-1/4 h-full overflow-hidden overflow-y-auto bg-background ${!isRightSidebarOpen ? '!w-0 !px-0 !border-none' : "px-2"
        } flex flex-col max-h-full`}
      style={{ width: rightWidth }}
    >
      <div className={`flex items-center gap-2 ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
        }`}>
        <h5 onClick={closeTopTabs} className={` ${(actualTab === "genMetadata" || actualTab === "genStories") && `${theme === "light" ? "text-textColor-300" : "text-textColor-200"
          } cursor-pointer`}`}>
          Studio</h5>
        <h5>{
          actualTab === "genMetadata" ? " > Metadata generation" : actualTab === "genStories" ? " > Story generation" : null
        }
        </h5>
        {showEditor && (
          <h5
            onClick={closeEditor}
            className={`cursor-pointer ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
              }`}
          >
            ×
          </h5>
        )}
      </div>

      {/* Background blur elements */}
      <div className="w-56 h-56 bg-blue-500 rounded-full absolute left-3/4 top-10 -z-0 blur-[160px]"></div>
      <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-35 top-40 -z-0 blur-[160px]"></div>
      <div className="w-56 h-56 bg-pink-300 rounded-full absolute left-1/2 top-80 -z-0 blur-[160px]"></div>

      {/* Resizer */}
      {isRightSidebarOpen && (
        <div
          className="absolute top-0 bottom-0 z-50 w-1 h-full hover:bg-primary-100 hover:cursor-col-resize"
          style={{ right: rightWidth }}
          onMouseDown={handleRightMouseDown}
          onDoubleClick={handleDoubleClick}
        />
      )}

      {/* Toggle button */}
      <div className="absolute right-0 z-40 flex flex-col items-center justify-center h-auto px-2 py-2 rounded-md w-fit top-1/2">
        <SwapHorizOutlinedIcon
          className={`cursor-pointer ${theme === 'dark' && 'text-textColor-100'}`}
          onClick={handleSidebarToggle}
        />
      </div>

      {/* GenMetadata & GenStories */}
      {/* ::::::::::::::::::::::::::::::::::::::::::: */}

      {/* <Tabs
        transition={false}
        defaultActiveKey="genMetadata"
        onSelect={(k) => setActiveTab(() => k)}
        activeKey={activeTab}
        id="uncontrolled-tab-example"
        className={`mb-3 user-select-none  text-center flex justify-center items-center !border-b-0 ${!isRightSidebarOpen && '!hidden'
          }`}
      >
        <Tab
          eventKey="genMetadata"
          title="GenMetadata"
          className="flex-1 overflow-y-auto bg-red-600"
          tabClassName="text-primary-300"
        >
          <MetadataGen key={0} name="genMetadata" />
        </Tab>

        <Tab
          eventKey="insights"
          title="Insights"
          className="flex-1 h-full overflow-y-auto"
        >
          <NotesSection
            setNoteIndex={setNoteIndex}
            nodeIndex={noteIndex}
            key={2}
            name="Notes"
          />
          {(activeTab === 'insights' &&
            (Boolean(localStorage.getItem('guide_completed_insights')) === false ||
              localStorage.getItem('guide_completed_sources') === "false")) &&
            <Guide steps={notesSectionSteps} tabIdentifier="insights" />
          }
        </Tab>

        <Tab
          eventKey="stories"
          title="GenStories"
          className="flex-1 h-full overflow-y-auto"
        >
          <StoriesSection />
          {(activeTab === 'stories' &&
            (Boolean(localStorage.getItem('guide_completed_stories')) === false ||
              localStorage.getItem('guide_completed_sources') === "false")) &&
            <Guide steps={storiesSectionSteps} tabIdentifier="stories" />
          }
        </Tab>
      </Tabs> */}

      {/* ::::::::::::::::::::::::::::::::::::::::::: */}

      {/* Editor or Tabs */}
      {showEditor ? (
        <div className="flex-1 h-full overflow-y-auto">
          <div className="h-full max-h-full ml-auto overflow-y-auto">
            <div
              className={`mt-3 flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light'
                ? 'hover:bg-light-hover-100/30'
                : 'hover:bg-light-hover-200/20'
                } z-10`}
              onClick={handleSave}
            >
              <AddIcon style={{ color: theme === 'light' ? '#333' : '#ABAEB4' }} />
              <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'
                }`}>
                Save {currentTab === "insights" ? "insight" : "story"}
              </span>
            </div>
            <div>
              <input
                className={`${theme === 'dark' && 'text-textColor-100'
                  } font-medium p-2 bg-transparent !border ${theme === "dark" ? "!border !border-textColor-300" : '!border !border-textColor-100'} !outline-none w-full`}
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





            {selectedNote?.note_name !== "" ? <div className={`space-y-6 !z-10 relative !border ${theme === "dark" ? "!border !border-textColor-300" : '!border !border-textColor-100'}`}>
              {selectedNote?.text.map((item, index) => (
                <div
                  key={index}
                  className="pl-2 mb-4"
                >
                  <h4 className={`z-10 mt-2 font-bold ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                    }`}>{item.question}</h4>
                  <p className="z-10 text-textColor-200" dangerouslySetInnerHTML={{ __html: item.answer }}></p>
                  {/* <p className="z-10 font-bold text-white">
                    <strong>Model:</strong> {item.model}
                  </p> */}

                  {/* PDF Links */}
                  {(item?.references?.pdfLinks?.length > 0 || item?.refs?.pdfLinks?.length > 0) && (
                    <div>
                      {/* <strong className="z-10 font-bold text-white">PDF:</strong>{' '} */}
                      {item[item.refs ? 'refs' : 'references'].pdfLinks.map((link, i) => (
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
                      {/* <strong className="z-10 font-bold text-white">Video:</strong>{' '} */}
                      {item[item.refs ? 'refs' : 'references'].videoLinks.map((link, i) => (
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
                      {/* <strong className="z-10 font-bold text-white">Images:</strong>{' '} */}
                      {item[item.refs ? 'refs' : 'references'].imageLinks.map((link, i) => (
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
              <div className="space-y-6 !z-10 relative !border !border-textColor-300">
                {
                  selectedStory?.text?.map((heading) => {
                    return (
                      <div key={heading?.id} className="pl-2 mb-4">
                        <h4 className="z-10 mt-2 font-bold text-white">{heading?.outline?.name}</h4>
                        <p className="z-10 font-bold text-white">{heading?.content?.answer}</p>
                      </div>
                    );
                  })
                }
              </div>
            }













          </div>
        </div>
      ) : (
        <div className='flex flex-col h-full gap-2 overflow-y-hidden'>
          {/* GenMetadata & GenStories */}
          {/* ::::::::::::::::::::::::::::::::::::::::::: */}
          <div>
            {/* buttons */}
            <div className="flex justify-center gap-5 mt-4 flex-items">
              {["Generate metadata", "Generate stories"].map(item => <h6 onClick={() => handleTabClick(item)} className={`cursor-pointer ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} key={item}>{item}</h6>)}
            </div>
          </div>
          {actualTab !== null && <div className='h-full overflow-y-hidden'>
            {
              actualTab === "genMetadata" ? (
                <MetadataGen />
              ) : actualTab === "genStories" ? (
                <StoriesEditor />
              ) : null
            }
          </div>}
          {/* ::::::::::::::::::::::::::::::::::::::::::: */}
          {/* insights and stories list */}
          {actualTab === null && <div className='relative z-10 flex-1 overflow-y-auto'>
            <div>
              {/* <MetadataGen key={0} name="genMetadata" /> */}
              <div className="relative z-10 flex items-center gap-3">
                {
                  ["insights", "stories"].map((item, index) => <BaseHeading key={index} text={item} className={`mt-3 cursor-pointer ${item === currentTab ? '!text-primary-300' : ''}`} onClick={() => setCurrentTab(item)} />)
                }
              </div>
            </div>
            {/* notes */}
            {
              currentTab === "insights" ?
                <>
                  <div
                    className={` flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light'
                      ? 'hover:bg-light-hover-100/30'
                      : 'hover:bg-light-hover-200/20'
                      } z-10`}
                    onClick={createNewInsight}
                  >
                    <AddIcon style={{ color: theme === 'light' ? '#333' : '#ABAEB4' }} />
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'
                      }`}>
                      New insight
                    </span>
                  </div>
                  <div className="flex flex-col overflow-y-auto">
                    {/* single note */}
                    {
                      notes?.map((note, index) => (
                        <div key={note.note_id} className={`flex gap-2 ${theme === 'light'
                          ? 'hover:bg-light-hover-100/30'
                          : 'hover:bg-light-hover-200/20'
                          } cursor-pointer p-2 rounded-md select-none`} onClick={(event) => showSelectedNote(event, note, index)}>
                          <ArticleOutlinedIcon style={{ color: theme === 'light' ? '#333' : '#5293FD' }} />
                          <p className={`font-semibold ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                            }`}>{note.note_name}</p>
                        </div>
                      ))
                    }
                  </div>
                </>
                :
                <>
                  {/* <div
                    className={`mb-3 flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light'
                      ? 'hover:bg-light-hover-100/30'
                      : 'hover:bg-light-hover-200/20'
                      } z-10`}
                    onClick={createNewInsight}
                  >
                    <AddIcon style={{ color: theme === 'light' ? '#333' : '#ABAEB4' }} />
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'
                      }`}>
                      New Story
                    </span>
                  </div> */}
                  <div className="flex flex-col overflow-y-auto">
                    {/* single note */}
                    {
                      stories?.map((story, index) => (
                        <div key={story.story_id} className={`flex gap-2 ${theme === 'light'
                          ? 'hover:bg-light-hover-100/30'
                          : 'hover:bg-light-hover-200/20'
                          } cursor-pointer p-2 rounded-md select-none`} onClick={(event) => showSelectedStory(event, story, index)}>
                          <ArticleOutlinedIcon style={{ color: theme === 'light' ? '#333' : '#5293FD' }} />
                          <p className={`font-semibold ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
                            }`}>{story.story_name}</p>
                        </div>
                      ))
                    }
                  </div>
                </>
            }
          </div>}
        </div>
      )}
    </aside>
  );
};

export default ChatPanel;