
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import ImageResize from "quill-image-resize-module-react";
import { useCallback, useContext, useEffect, useState } from 'react';
import { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { MainContext } from '../../contexts/mainContext.jsx';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';
import InsightEditor from '../InsightEditor/index.jsx';
import MediaEntertainment from '../MediaEntertainment';
import MetadataGen from '../MetadataGen';
import ReelViewer from '../ReelViewer';
import StoriesInsightsTab from '../StoriesInsightsTab';
import StoryEditor from '../StoryEditor/index.jsx';
import './chat-panel.css';

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

  const {
    setSelectedNote,
    reels,
    setReels,
    showEditor,
    setShowEditor,
    isRightSidebarOpen,
    setIsRightSidebarOpen,
    theme,
    selectedStory,
    setSelectedStory,
  } = useContext(MainContext);

  const [isNewInsight, setIsNewInsight] = useState(false);

  const [currentTab, setCurrentTab] = useState("Insights");  // insights | stories

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


  const handleSidebarToggle = useCallback(() => {
    setSidebarWidth(prev => {
      if (prev !== (maxWidth - (maxWidth * 0.3))) return maxWidth - (maxWidth * 0.3);
      return window.innerWidth / 3.3333;
    });
    setIsRightSidebarOpen(true);
  }, [setSidebarWidth, maxWidth, setIsRightSidebarOpen]);

  const [showStoriesEditor, setShowStoriesEditor] = useState(false);

  useEffect(() => {
    if (showStoriesEditor === true || showEditor === true) {
      setSidebarWidth(prev => {
        if (prev !== (maxWidth - (maxWidth * 0.3))) return maxWidth - (maxWidth * 0.5);
        return window.innerWidth / 5;
      });
      setIsRightSidebarOpen(true);
    }
  }, [showStoriesEditor, showEditor]);

  const [actualTab, setActualTab] = useState("genMedia"); //genMetadata | genStories | genMedia

  function handleTabClick(item) {
    setActualTab(item);
  }

  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [verbosityValue, setVerbosityValue] = useState('Medium');
  const [context, setContext] = useState('');

  const [isGeneratingReel, setIsGeneratingReel] = useState(false);
  const [reelContext, setReelContext] = useState('');
  const [reelVerbosityValue, setReelVerbosityValue] = useState('Short (1min)');

  const [storyTitle, setStoryTitle] = useState(selectedStory?.story_name);

  useEffect(() => {
    setStoryTitle(selectedStory?.story_name);
  }, [selectedStory?.story_name]);

  const [reel, setReel] = useState({
    id: "",
    title: "",
    reel_video_url: "",
    thumbnail: ""
  });
  const [isReelOpen, setIsReelOpen] = useState(false);


  return (
    <aside
      className={`relative w-1/4 h-full overflow-hidden overflow-y-hidden bg-background ${!isRightSidebarOpen ? '!w-0 !px-0 !border-none' : "px-2 pb-[10px]"
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
        <InsightEditor isNewInsight={isNewInsight} />
      ) : showStoriesEditor ? (
        <StoryEditor storyTitle={storyTitle} setStoryTitle={setStoryTitle} />
      ) : (
        <div className='z-20 flex flex-col h-full gap-2 overflow-y-hidden'>
          {/* GenMetadata & GenStories */}
          {/* ::::::::::::::::::::::::::::::::::::::::::: */}
          <div>
            {/* buttons */}
            <div className={`flex justify-around gap-5 mt-2 flex-items overflow-x-auto [&::-webkit-scrollbar]:h-[6px]
    [&::-webkit-scrollbar-track]:bg-transparent
    [&::-webkit-scrollbar-thumb]:bg-gray-400
    [&::-webkit-scrollbar-thumb]:rounded-full
    [&::-webkit-scrollbar-thumb]:border-2
    [&::-webkit-scrollbar-thumb]:border-transparent
    [&::-webkit-scrollbar-thumb]:bg-clip-padding`}>
              {[
                { id: "genMetadata", title: "Cataloging" },
                { id: "genStories", title: "Insights & Stories" },
                { id: "genMedia", title: "Reels" },
                { id: "genTimeSegment", title: "Time Segment Description" },
              ].map(item => (
                <h6
                  id={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`text-[14px] select-none text-md cursor-pointer min-w-fit ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} ${item.id === actualTab && "font-bold !text-primary-300"}`}
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
                <StoriesInsightsTab isNewInsight={isNewInsight}
                  setIsNewInsight={setIsNewInsight} currentTab={currentTab} setCurrentTab={setCurrentTab} setShowStoriesEditor={setShowStoriesEditor} />
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