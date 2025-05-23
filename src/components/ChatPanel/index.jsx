import { useContext, useEffect, useRef, useState } from 'react';
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

import './chat-panel.css';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';
import MetadataGen from '../MetadataGen';

import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageResize from "quill-image-resize-module-react";
import toast from 'react-simple-toasts';
import makeApiRequest from '../../api';

Quill.register("modules/imageResize", ImageResize);

const ChatPanel = () => {
  const { sidebarWidth: rightWidth, sidebarWidth, handleMouseDown: handleRightMouseDown, handleDoubleClick, maxWidth, setSidebarWidth } = useResizableSidebar(200, false);

  const { chatLoaded,
    notes,
    isNewNote,
    setNotes, showEditor, setShowEditor, selectedNote, noteIndex, setNoteIndex, setChatLoaded, isRightSidebarOpen, setIsRightSidebarOpen, theme, activeTab, setActiveTab } = useContext(MainContext);

  // let copilotSectionSteps = [
  //   {
  //     target: '.language-dropdown',
  //     content: "Select a language to translate copilot chat",
  //     disableBeacon: true,
  //     placement: 'bottom'
  //   },
  //   {
  //     target: '.models-list-button',
  //     content: "Select an LLM to be used for the query processing",
  //     placement: 'bottom'
  //   },
  //   {
  //     target: '.copilot-chat-container',
  //     content: "This is where you interact with the LLM to generate insights",
  //     placement: 'bottom'
  //   },
  // ];

  // let genStorieSectionSteps = [
  //   {
  //     target: '.genstory-models-list-button',
  //     content: "Select an LLM to be used for the query processing",
  //     disableBeacon: true,
  //     placement: 'bottom'
  //   },
  //   {
  //     target: '.genstory-chat-container',
  //     content: "This is where you interact with the LLM to generate stories",
  //     placement: 'bottom'
  //   },
  // ];

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

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, true] }],
      ['bold', 'italic', 'underline'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['link', 'image', 'video'],
    ],
    imageResize: {
      // optional configuration
      parchment: Quill.import("parchment"),
      modules: ["Resize", "DisplaySize", "Toolbar"],
    },
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

  function closeEditor() {
    setShowEditor(false);
  }

  useEffect(() => {
    if (selectedNote?.note_id !== "") {
      setValue(generateHtmlFromText(selectedNote?.text));
      setNoteTitle(selectedNote?.note_name);
      setShowEditor(true);
    }
  }, [selectedNote]);

  // function generateHtmlFromText(textArray) {
  //   return textArray
  //     .map((item) => {
  //       const refs = [];

  //       if (item?.references?.pdfLinks?.length > 0) {
  //         refs.push(
  //           `<div><strong>PDF:</strong> ${item?.references?.pdfLinks?.map((link) => `<a href="#">${link}</a>`)
  //             .join(", ")}</div>`
  //         );
  //       }

  //       if (item?.references?.videoLinks?.length > 0) {
  //         refs.push(
  //           `<div><strong>Video:</strong> ${item?.references?.videoLinks?.map((link) => `<a href="#">${link}</a>`)
  //             .join(", ")}</div>`
  //         );
  //       }

  //       if (item?.references?.imageLinks?.length > 0) {
  //         refs.push(
  //           `<div><strong>Images:</strong> ${item?.references?.imageLinks?.map((link) => `<img src="${link}" alt="image" style="max-width: 100px;" />`)
  //             .join(" ")}</div>`
  //         );
  //       }

  //       return `
  //         <div style="border-left: 4px solid ${item.color}; padding-left: 8px; margin-bottom: 16px;">
  //           <h2><strong>${item.question}</strong></h2>
  //           <br />
  //           <p>${item.answer}</p>
  //           <p><strong>Model:</strong> ${item.model}</p>
  //           ${refs.join("")}
  //           <br />
  //           <br />
  //         </div>
  //       `;
  //     })
  //     .join("<hr/>");
  // }
  function generateHtmlFromText(textArray) {
    return textArray
      .map((item) => {
        const refs = [];

        if (item?.references?.pdfLinks?.length > 0) {
          refs.push(
            `<div><strong>PDF:</strong> ${item.references.pdfLinks
              .map(
                (link) =>
                  `<a href="#" class="reference-link" data-ref-type="pdf" data-ref-value="${link}">${link}</a>`
              )
              .join(", ")}</div>`
          );
        }

        if (item?.references?.videoLinks?.length > 0) {
          refs.push(
            `<div><strong>Video:</strong> ${item.references.videoLinks
              .map(
                (link) =>
                  `<a href="#" class="reference-link" data-ref-type="video" data-ref-value="${link}">${link}</a>`
              )
              .join(", ")}</div>`
          );
        }

        if (item?.references?.imageLinks?.length > 0) {
          refs.push(
            `<div><strong>Images:</strong> ${item.references.imageLinks
              .map(
                (link) =>
                  `<img src="${link}" alt="image" style="max-width: 100px;" class="reference-link" data-ref-type="image" data-ref-value="${link}" />`
              )
              .join(" ")}</div>`
          );
        }

        return `
          <div style="border-left: 4px solid ${item.color}; padding-left: 8px; margin-bottom: 16px;">
            <h2><strong>${item.question}</strong></h2>
            <br />
            <p>${item.answer}</p>
            <p><strong>Model:</strong> ${item.model}</p>
            ${refs.join("")}
            <br /><br />
          </div>
        `;
      })
      .join("<hr/>");
  }

  const editorRef = useRef(null);
  useEffect(() => {
    const editorEl = editorRef.current?.getEditor()?.root;
    if (!editorEl) return;

    const handleClick = (e) => {
      const target = e.target;
      if (target.classList.contains("reference-link")) {
        const type = target.getAttribute("data-ref-type");
        const value = target.getAttribute("data-ref-value");

        console.log("Clicked reference:", { type, value });

        // ✨ Call your handler here
        e.preventDefault();
      }
    };

    editorEl.addEventListener("click", handleClick);
    return () => editorEl.removeEventListener("click", handleClick);
  }, []);

  const handleSave = async (event) => {
    event && event.preventDefault();
    if (selectedNote.note_name === "") {
      // add shadow to toast classnames
      toast('Note title cannot be empty', { className: `p-2 rounded-md`, theme });
      return;
    }
    if (isNewNote && notes.every(n => n.note_name !== selectedNote.note_name)) {
      const dateTimeStr = new Date().toISOString().replace(/:/g, '-').split('.')[0] + Math.random().toString(36).substring(7);

      selectedNote.note_id = dateTimeStr;
    }
    try {
      await makeApiRequest(`/save-note`, 'post', { noteID: selectedNote.note_id, selectedNote, noteName: 'note_json', noteNumber: parseInt(noteIndex), isNewNote: isNewNote });

      const data = await makeApiRequest("/notes", "post");
      setNotes(() => data);
      toast('Insight saved successfully', { className: 'p-2 rounded-md', theme });
    } catch (error) {
      console.log(error);
    }
  };


  return (
    <aside className={`relative w-1/4 h-full overflow-hidden bg-background  ${!isRightSidebarOpen ? '!w-0 !px-0 !border-none' : "px-2"}  flex flex-col`} style={{
      width: rightWidth
    }}>
      <div className="flex items-center justify-between">
        <h5 className={`${theme === "light" ? "text-textColor-300" : "text-textColor-200"
          }`}>Studio</h5>
        {showEditor && <h5 onClick={closeEditor} className={`cursor-pointer ${theme === "light" ? "text-textColor-300" : "text-textColor-200"
          }`}>x</h5>}
      </div>
      <div className="w-56 h-56 bg-blue-500 rounded-full absolute left-3/4 top-10 -z-0 blur-[160px]"></div>
      <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-35 top-40 -z-0 blur-[160px]"></div>
      <div className="w-56 h-56 bg-pink-300 rounded-full absolute left-1/2 top-80 -z-0 blur-[160px]"></div>
      {isRightSidebarOpen && <div
        className="absolute top-0 bottom-0 z-50 w-1 h-full hover:bg-primary-100 hover:cursor-col-resize"
        style={{ right: rightWidth }}
        onMouseDown={handleRightMouseDown}
        onDoubleClick={handleDoubleClick}
      ></div>}

      <div
        className={`px-2 py-2 rounded-md w-fit absolute right-0 h-auto top-1/2 flex flex-col justify-center items-center z-40`}
      >
        <SwapHorizOutlinedIcon className={`cursor-pointer ${theme === 'dark' && 'text-textColor-100'}`} onClick={() => {
          setSidebarWidth(prev => {
            if (prev !== maxWidth) {
              return maxWidth;
            }
            return window.innerWidth / 3.3333;
          });
          setIsRightSidebarOpen(true);
        }} />
      </div>

      {showEditor ? (
        <div className="flex flex-col flex-1 h-full">
          <div className="h-full max-h-full overflow-y-auto">
            <div>
              <input className={`${theme === 'dark' && 'text-textColor-100'} font-medium py-2 px-1 bg-transparent !border border-textColor-300 !outline-none w-full`} placeholder="New title..." value={noteTitle} />
            </div>
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <ReactQuill
                theme="snow"
                value={value}
                onChange={setValue}
                className="custom-quill"
                style={{ flex: 1 }}
                modules={modules}
                formats={formats}
              />
            </div>
            <div
              className={`mt-3 flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
              onClick={handleSave}
            >
              <AddIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
              <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Save insight</span>
            </div>
          </div>
        </div>
      ) : <Tabs
        transition={false}
        defaultActiveKey="genMetadata"
        onSelect={(k) => {
          setActiveTab(() => k);
        }}
        activeKey={activeTab}
        id="uncontrolled-tab-example"
        className={`mb-3 user-select-none text-center flex justify-center items-center !border-b-0 ${!isRightSidebarOpen && '!hidden'}`}
      >
        <Tab eventKey="genMetadata" title="GenMetadata" className={`flex-1 h-full overflow-y-auto`} tabClassName={`text-primary-300`} style={{}} >
          <MetadataGen key={0} name="genMetadata" />
          {/* {(activeTab === 'genMetadata' && (Boolean(localStorage.getItem(`guide_completed_genMetadata`)) === false || localStorage.getItem(`guide_completed_genMetadata`) === "false")) && <Guide steps={copilotSectionSteps} tabIdentifier="genMetadata" />} */}
        </Tab>
        <Tab eventKey="insights" title="Insights" className='flex-1 h-full overflow-y-auto'>
          <NotesSection
            setNoteIndex={setNoteIndex}
            nodeIndex={noteIndex}
            key={2}
            name="Notes"
          />
          {(activeTab === 'insights' && (Boolean(localStorage.getItem(`guide_completed_insights`)) === false || localStorage.getItem(`guide_completed_sources`) === "false")) && <Guide steps={notesSectionSteps} tabIdentifier="insights" />}
        </Tab>
        <Tab eventKey="stories" title="Stories" className='flex-1 h-full overflow-y-auto'>
          <StoriesSection
          />
          {(activeTab === 'stories' && (Boolean(localStorage.getItem(`guide_completed_stories`)) === false || localStorage.getItem(`guide_completed_sources`) === "false")) && <Guide steps={storiesSectionSteps} tabIdentifier="stories" />}
        </Tab>
        {/* <Tab eventKey="genInsights" title="GenInsights" className={`flex-1 h-full overflow-y-auto`} tabClassName={`text-primary-300`} style={{}}>
          <CopilotSection chatLoaded={chatLoaded} setChatLoaded={setChatLoaded} sidebarWidth={sidebarWidth} key={0} name="genInsights" />
          {(activeTab === 'genInsights' && (Boolean(localStorage.getItem(`guide_completed_genInsights`)) === false || localStorage.getItem(`guide_completed_genInsights`) === "false")) && <Guide steps={copilotSectionSteps} tabIdentifier="genInsights" />}
        </Tab>
        <Tab eventKey="genStories" title="GenStories" className={`flex-1 h-full overflow-y-auto`} tabClassName={`text-primary-300`}>
          <GenStories key={2} name="genStories" sidebarWidth={sidebarWidth} />
          {(activeTab === 'genStories' && (Boolean(localStorage.getItem(`guide_completed_genStories`)) === false || localStorage.getItem(`guide_completed_genStories`) === "false")) && <Guide steps={genStorieSectionSteps} tabIdentifier="genStories" />}
        </Tab> */}
      </Tabs>}
    </aside>
  );
};

export default ChatPanel;