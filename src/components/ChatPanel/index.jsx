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
    chatLoaded,
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
    activeTab,
    setActiveTab
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


  const handleSave = useCallback(async (event) => {
    event?.preventDefault();

    if (selectedNote.note_name === "") {
      toast('Note title cannot be empty', { className: 'p-2 rounded-md', theme });
      return;
    }

    if (isNewNote && notes.every(n => n.note_name !== selectedNote.note_name)) {
      const dateTimeStr = new Date().toISOString().replace(/:/g, '-').split('.')[0] + Math.random().toString(36).substring(7);
      selectedNote.note_id = dateTimeStr;
    }

    try {
      await makeApiRequest('/save-note', 'post', {
        noteID: selectedNote.note_id,
        selectedNote,
        noteName: 'note_json',
        noteNumber: parseInt(noteIndex),
        isNewNote: isNewNote
      });

      const data = await makeApiRequest("/notes", "post");
      setNotes(() => data);
      toast('Insight saved successfully', { className: 'p-2 rounded-md', theme });
    } catch (error) {
      console.error('Error saving note:', error);
      toast('Failed to save insight', { className: 'p-2 rounded-md', theme });
    }
  }, [selectedNote, selectedNote?.note_name, notes, noteIndex, isNewNote, theme, setNotes]);

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

  return (
    <aside
      className={`relative w-1/4 h-full overflow-hidden bg-background ${!isRightSidebarOpen ? '!w-0 !px-0 !border-none' : "px-2"
        } flex flex-col`}
      style={{ width: rightWidth }}
    >
      <div className="flex items-center justify-between">
        <h5 className={`${theme === "light" ? "text-textColor-300" : "text-textColor-200"
          }`}>
          Studio
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
      <div className="px-2 py-2 rounded-md w-fit absolute right-0 h-auto top-1/2 flex flex-col justify-center items-center z-40">
        <SwapHorizOutlinedIcon
          className={`cursor-pointer ${theme === 'dark' && 'text-textColor-100'}`}
          onClick={handleSidebarToggle}
        />
      </div>

      {/* Editor or Tabs */}
      {showEditor ? (
        <div className="flex flex-col flex-1 h-full">
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
                Save insight
              </span>
            </div>
            <div>
              <input
                className={`${theme === 'dark' && 'text-textColor-100'
                  } font-medium py-2 px-1 bg-transparent !border border-textColor-300 !outline-none w-full`}
                placeholder="New title..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>
            <div style={{}}>
              <ReactQuill
                ref={editorRef}
                theme="snow"
                value={value}
                onChange={setValue}
                readOnly={true}
                className="custom-quill"
                modules={modules}
                formats={formats}
              />
            </div>





            <div className="space-y-6 !z-10 relative">
              {selectedNote?.text.map((item, index) => (
                <div
                  key={index}
                  style={{
                    paddingLeft: '8px',
                    marginBottom: '16px',
                  }}
                >
                  <h4 className="text-white font-bold z-10 mt-2">{item.question}</h4>
                  <p className="text-textColor-100 z-10" dangerouslySetInnerHTML={{ __html: item.answer }}></p>
                  {/* <p className="text-white font-bold z-10">
                    <strong>Model:</strong> {item.model}
                  </p> */}

                  {/* PDF Links */}
                  {(item?.references?.pdfLinks?.length > 0 || item?.refs?.pdfLinks?.length > 0) && (
                    <div>
                      {/* <strong className="font-bold text-white z-10">PDF:</strong>{' '} */}
                      {item[item.refs ? 'refs' : 'references'].pdfLinks.map((link, i) => (
                        <a
                          key={i}
                          href="#"
                          onClick={(e) => handleReferenceClick(e, extractFilenameAndType(typeof link === "string" ? link : link?.source_path), (typeof link === "string" ? null : link))}
                          className="reference-link mr-2 z-10"
                        >
                          {typeof link === "string" ? link : (link?.source_path + " | " + parseInt(link?.page) + 1)}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Video Links */}
                  {(item?.references?.videoLinks?.length > 0 || item?.refs?.videoLinks?.length > 0) && (
                    <div>
                      {/* <strong className="font-bold text-white z-10">Video:</strong>{' '} */}
                      {item[item.refs ? 'refs' : 'references'].videoLinks.map((link, i) => (
                        <li
                          key={i}
                          onClick={(e) => handleReferenceClick(e, extractFilenameAndType(typeof link === "string" ? link : link?.source_path), (typeof link === "string" ? null : link))}
                          className="reference-link mr-2 z-10 break-words text-blue-600 cursor-pointer list-none"
                        >
                          {typeof link === "string" ? link : (link?.source_path + " | " + link?.timestamp)}
                        </li>
                      ))}
                    </div>
                  )}

                  {/* Image Links */}
                  {(item?.references?.imageLinks?.length > 0 || item?.refs?.imageLinks?.length > 0) && (
                    <div>
                      {/* <strong className="font-bold text-white z-10">Images:</strong>{' '} */}
                      {item[item.refs ? 'refs' : 'references'].imageLinks.map((link, i) => (
                        <img
                          key={i}
                          src={typeof link === "string" ? link : link?.source_path}
                          alt="image"
                          className="reference-link mr-2 max-w-full z-10"
                          onClick={(e) => handleReferenceClick(e, typeof link === "string" ? link : link?.source_path, typeof link === "string" ? null : link)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>













          </div>
        </div>
      ) : (
        <div className='flex flex-col h-full'>
          <div>
            <MetadataGen key={0} name="genMetadata" />
            <BaseHeading text="Insights" className="mt-3" />
          </div>
          <div className="overflow-y-auto flex flex-col">
            {/* notes */}
            {
              notes?.map((note) => (
                <div key={note.note_id} className={`flex gap-2 ${theme === 'light'
                  ? 'hover:bg-light-hover-100/30'
                  : 'hover:bg-light-hover-200/20'
                  } cursor-pointer p-2 rounded-md select-none`}>
                  <ArticleOutlinedIcon style={{ color: theme === 'light' ? '#333' : '#5293FD' }} />
                  <p className="text-white font-semibold">{note.note_name}</p>
                </div>
              ))
            }
          </div>
        </div>
        // <Tabs
        //   transition={false}
        //   defaultActiveKey="genMetadata"
        //   onSelect={(k) => setActiveTab(() => k)}
        //   activeKey={activeTab}
        //   id="uncontrolled-tab-example"
        //   className={`mb-3 user-select-none text-center flex justify-center items-center !border-b-0 ${!isRightSidebarOpen && '!hidden'
        //     }`}
        // >
        //   <Tab
        //     eventKey="genMetadata"
        //     title="GenMetadata"
        //     className="flex-1 h-full overflow-y-auto"
        //     tabClassName="text-primary-300"
        //   >
        //     <MetadataGen key={0} name="genMetadata" />
        //   </Tab>

        //   <Tab
        //     eventKey="insights"
        //     title="Insights"
        //     className="flex-1 h-full overflow-y-auto"
        //   >
        //     <NotesSection
        //       setNoteIndex={setNoteIndex}
        //       nodeIndex={noteIndex}
        //       key={2}
        //       name="Notes"
        //     />
        //     {(activeTab === 'insights' &&
        //       (Boolean(localStorage.getItem('guide_completed_insights')) === false ||
        //         localStorage.getItem('guide_completed_sources') === "false")) &&
        //       <Guide steps={notesSectionSteps} tabIdentifier="insights" />
        //     }
        //   </Tab>

        //   <Tab
        //     eventKey="stories"
        //     title="Stories"
        //     className="flex-1 h-full overflow-y-auto"
        //   >
        //     <StoriesSection />
        //     {(activeTab === 'stories' &&
        //       (Boolean(localStorage.getItem('guide_completed_stories')) === false ||
        //         localStorage.getItem('guide_completed_sources') === "false")) &&
        //       <Guide steps={storiesSectionSteps} tabIdentifier="stories" />
        //     }
        //   </Tab>
        // </Tabs>
      )}
    </aside>
  );
};

export default ChatPanel;