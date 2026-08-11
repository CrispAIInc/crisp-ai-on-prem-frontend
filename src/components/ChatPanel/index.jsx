
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import ImageResize from "quill-image-resize-module-react";
import { useCallback, useContext, useEffect, useState } from 'react';
import { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import makeApiRequest, { axiosInstance } from '../../api/index.js';
import { MainContext } from '../../contexts/mainContext.jsx';
import { ProjectContext } from '../../contexts/projectContext.jsx';
import { useToast } from '../../contexts/toastContext.jsx';
import { DEFAULT_TOTAL_PDF_PAGES } from '../../globals.js';
import useAuth from '../../hooks/useAuth.js';
import useMetadata from '../../hooks/useMetadata.js';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';
import { formatTime, toSeconds } from '../../utils.js';
import KnowledgeGraph from '../Entities/index.jsx';
import InsightEditor from '../InsightEditor/index.jsx';
import MediaEntertainment from '../MediaEntertainment';
import MetadataGen from '../MetadataGen';
import ReelViewer from '../ReelViewer';
import StoriesInsightsTab from '../StoriesInsightsTab';
import StoryEditor from '../StoryEditor/index.jsx';
import VideoSegmentDescription from '../VideoSegmentDescription/index.jsx';
import './chat-panel.css';
import BlogViewerModal from '../BlogViewerModal/index.jsx';

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

  const { token } = useAuth();

  const {
    currentProject,
    isProjectReadOnly
  } = useContext(ProjectContext);

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
    checkedSources,
    currentChat,
    displayedSources,
    knowledgeBase,
    setSelectedBlog,
    setJsonEntities,
    setSelectedJsonEntity,
    setBlogs,
  } = useContext(MainContext);

  const { notify } = useToast();

  const [isNewInsight, setIsNewInsight] = useState(false);

  const [currentTab, setCurrentTab] = useState("Stories");  // insights | stories | Blogs
  const [showStoriesEditor, setShowStoriesEditor] = useState(false);

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



  useEffect(() => {
    if (showStoriesEditor === true || showEditor === true) {
      setSidebarWidth(prev => {
        if (prev !== (maxWidth - (maxWidth * 0.3))) return maxWidth - (maxWidth * 0.5);
        return window.innerWidth / 5;
      });
      setIsRightSidebarOpen(true);
    }
  }, [showStoriesEditor, showEditor]);

  const [actualTab, setActualTab] = useState("genMetadata"); //genMetadata | genStories | genMedia | genGraph

  function handleTabClick(item) {
    setActualTab(item);
  }

  const [isGeneratingMetadata, setIsGeneratingMetadata] = useState(false);
  const [verbosityValue, setVerbosityValue] = useState('Low');
  const [context, setContext] = useState('');

  const [isGeneratingReel, setIsGeneratingReel] = useState(false);
  const [reelContext, setReelContext] = useState('');
  const [reelVerbosityValue, setReelVerbosityValue] = useState('Short (1m)');

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

  /**
   * ============== VIDEO SEGMENT FEAT ==================
   */

  const [currentSegmentTab, setCurrentSegmentTab] = useState("Time segment description");

  // ========== time segment description ==============
  const checkedVideosCount = checkedSources.filter(source => source.file_type === "video").length;

  const [isSegmentPending, setIsSegmentPending] = useState(false);
  const [showSegmentList, setShowSegmentList] = useState(true);
  const [currentSegment, setCurrentSegment] = useState(null);
  const [segmentTitle, setSegmentTitle] = useState("");
  const [startSegmentDescription, setStartSegmentDescription] = useState({ h: "00", m: "00", s: "00" });
  const [endSegmentDescription, setEndSegmentDescription] = useState({ h: "00", m: "00", s: "00" });

  const [promptSegmentDescription, setPromptSegmentDescription] = useState("");

  const [isInfoTooltipOpen, setIsInfoTooltipOpen] = useState(false);

  const [segmentDescriptions, setSegmentDescriptions] = useState([]);

  const [resultsDescription, setResultsDescription] = useState({
    start: formatTime(startSegmentDescription),
    end: formatTime(endSegmentDescription),
    description: "",
    refs: []
  });

  const canGenerate = checkedVideosCount > 0 && !isSegmentPending && promptSegmentDescription && promptSegmentDescription.trim().length > 0 && !isProjectReadOnly;
  async function generateDescription() {
    try {
      if (!canGenerate) {
        throw new Error('Make sure you provided video sources and prompt');
      }

      if (toSeconds(endSegmentDescription) <= toSeconds(startSegmentDescription)) {
        throw new Error("Your timestamp range is invalid.");
      }

      setIsSegmentPending(true);
      setResultsDescription(prev => ({
        ...prev,
        start: formatTime(startSegmentDescription),
        end: formatTime(endSegmentDescription),
        refs: []
      }));

      let url = new URLSearchParams();

      url.append("start_timestamp", formatTime((startSegmentDescription)));
      url.append("end_timestamp", formatTime((endSegmentDescription)));
      url.append("video_filename", checkedSources.filter(items => items.file_type === "video")[0].source_path);
      url.append("prompt", promptSegmentDescription);
      url.append("title", segmentTitle);

      axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axiosInstance.defaults.headers.common['SessionId'] = currentChat?.sessionId;
      axiosInstance.defaults.headers.common['ProjectId'] = currentProject.project_id;

      const { data, success, message } = await makeApiRequest(`/segment?${url.toString()}`, 'GET', null, {
        Authorization: `Bearer ${token}`,
        SessionId: currentChat?.sessionId,
        ProjectId: currentProject?.project_id,
      });

      if (success) {

        notify({
          variant: "success",
          heading: "Description generated successfully",
        });

        setSegmentDescriptions(prev => [
          ...prev,
          { ...data }
        ]);
        setCurrentSegment(data);
        setShowSegmentList(false);
      } else {
        throw new Error(message);
      }

    } catch (error) {
      console.log(error);
      notify({
        variant: "error",
        heading: "Couldn't generate description",
        subheading: error?.message
      });
    } finally {
      setIsSegmentPending(false);
    }
  }

  useEffect(() => {

    async function fetchTimeSegments() {
      try {
        axiosInstance.defaults.headers.common['ProjectId'] = currentProject.project_id;
        const { data, success } = await makeApiRequest("/chat/segment", 'GET', null, {
          ProjectId: currentProject.project_id,
        });

        if (success) {
          setSegmentDescriptions(data);
        }
      } catch (error) {
        console.log(error);
      }
    }

    fetchTimeSegments();
  }, []);

  // ========== time segment summary ==============
  // const [startSegmentSummary, setStartSegmentSummary] = useState({ h: "00", m: "00", s: "00" });
  // const [endSegmentSummary, setEndSegmentSummary] = useState({ h: "00", m: "00", s: "00" });

  // const [promptSegmentSummary, setPromptSegmentSummary] = useState("");

  // const [resultsSummary, setResultsSummary] = useState({
  //     start: formatTime(startSegmentSummary),
  //     end: formatTime(endSegmentSummary),
  //     description: "",
  //     refs: []
  // });

  // ========= Find moments in videos ===========

  const [prompt, setPrompt] = useState("");
  const [showList, setShowList] = useState(true);
  const [momentTitle, setMomentTitle] = useState("");
  const [currentMoment, setCurrentMoment] = useState(null);
  const [moments, setMoments] = useState([]);
  const [captionResults, setCaptionResults] = useState({
    prompt: "",
    context: "",
    refs: [],
  });

  useEffect(() => {

    async function fetchFindMoments() {
      try {
        axiosInstance.defaults.headers.common['ProjectId'] = currentProject.project_id;
        const { data, success } = await makeApiRequest("/chat/moment", 'GET', null, {
          ProjectId: currentProject.project_id,
        });
        if (success) {
          setMoments(data);
        }
      } catch (error) {
        console.log(error);
      }
    }

    fetchFindMoments();
  }, []);

  const [isPending, setIsPending] = useState(false);

  async function handleCaptioning(query, momentTitle) {
    let response = await makeApiRequest('/moment', 'POST', JSON.stringify({
      prompt: query,
      title: momentTitle,
      sources: checkedSources.filter(items => items.file_type === "video"),
      fromCrispWiz: false
    }));

    return response;
  }
  async function handleCaptionSubmit() {
    try {
      setIsPending(true);
      // if (!momentTitle) {
      //   notify({
      //     variant: "error",
      //     heading: "Moment title is required"
      //   });
      //   setIsPending(false);
      //   return;
      // }
      if (!displayedSources?.every(item => item?.is_checked === false)) {
        await makeApiRequest(
          `/handle-embeddings`,
          "post",
          JSON.stringify({
            sources: checkedSources.filter(items => items.file_type === "video")?.map(item => ({ source_path: item?.source_path, category: item?.category })),
          })
        );
      }
      let { results, success, message, ...rest } = await handleCaptioning(prompt, momentTitle);

      if (success) {
        if (results.length > 0) {
          const finalResults = results.map((segment) => {
            const source = knowledgeBase.find(item => item.source_id === segment.source_id);

            if (!source) return null;

            return {
              ...segment,
              timestampText: `${source.source_path} | ${segment.timestamp}`,
              source: {
                ...source,
                timestamp: segment.timestamp
              }
            };
          }).filter(Boolean);
          const moment = {
            ...rest,
            title: momentTitle,
            results: finalResults
          };

          setCurrentMoment(moment);

          setPrompt("");
          setMomentTitle("");
          setIsPending(false);
          setShowList(false);
        } else {
          setIsPending(false);
          notify({
            variant: "info",
            heading: "No moments found with the prompt you provided",
            subheading: "Try providing another prompt for better results"
          });
        }
      }
      else {
        throw new Error(message);
      }
    } catch (error) {
      notify({
        variant: "error",
        heading: "Couldn't generate moment",
        subheading: error?.message || ""
      });
      console.log(error);
      setIsPending(false);
      setShowList(false);
    }
  }

  async function saveMoment(moment) {
    try {
      const { success, message } = await makeApiRequest('/moment/save', 'POST', JSON.stringify({ moment }));

      if (!success) {
        throw new Error(message);
      }

      setMoments(prev => {
        return [
          moment,
          ...prev,
        ];
      });
      notify({
        variant: "success",
        heading: "Moment saved successfully"
      });
    } catch (error) {
      notify({
        variant: "error",
        heading: "Couldn't save moment",
        subheading: error?.message || ""
      });
    }
  }

  /**
   * ============== VIDEO SEGMENT FEAT ==================
   */

  // =================== structure ====================
  // const MAX_SOURCES_COUNT = 1;
  const [entityContext, setEntityContext] = useState('');
  const [ontology, setOntology] = useState('');
  const [title, setTitle] = useState('');
  const [isGeneratingGraph, setIsGeneratingGraph] = useState(false);
  const [showGraphModal, setShowGraphModal] = useState(false);

  const [isFullSourceDuration, setIsFullSourceDuration] = useState(false);


  const checkedPdfSourcesEntity = checkedSources.filter(source => source.file_type === 'pdf');

  const [entityVideoStart, setEntityVideoStart] = useState({ h: "00", m: "00", s: "00" });
  const [entityVideoEnd, setEntityVideoEnd] = useState({ h: "00", m: "00", s: "00" });
  const [entityPageFrom, setEntityPageFrom] = useState("1");
  const [entityPageTo, setEntityPageTo] = useState(checkedPdfSourcesEntity[0]?.total_pages || DEFAULT_TOTAL_PDF_PAGES);

  const checkedVideoSource = checkedSources.filter(source => source.file_type === 'video')[0];




  // const checkedVideoSources = checkedSources.filter(source => source.file_type === 'video');
  const checkedVideoOrPdfSources = checkedSources.filter(source => source.file_type === 'video' || source.file_type === 'pdf');

  const sourceHasMetadata = Boolean(checkedVideoOrPdfSources[0]?.metadata?.summary?.content?.length > 0 && checkedVideoOrPdfSources[0]?.metadata?.highlights?.content?.length > 0 && checkedVideoOrPdfSources[0]?.metadata?.chapters?.content?.length > 0);

  const canGenerateEntity = checkedVideoOrPdfSources.length === 1 && !isProjectReadOnly;

  const { generateMetadata } = useMetadata();
  const STEPS = [
    "Generating metadata...",
    "Generating business intelligence...",
    "Generating blog content...",
    "Almost there..."
  ];
  const [step, setStep] = useState(""); // This state displays the current process description during the generation phase.

  async function generateGraph(isContextRequired = true) {
    try {
      if (!canGenerateEntity || (isContextRequired && !entityContext?.trim())) return;
      setIsGeneratingGraph(true);

      setStep("");

      if (!sourceHasMetadata) {
        setStep(STEPS[0]);
        await generateMetadata("", "medium", [{ id: "summary" }, { id: "highlights" }, { id: "chapters" }], [checkedVideoOrPdfSources[0]], { isGraph: true });
      }

      setStep(STEPS[1]);
      const payload = {
        sources: { file_type: checkedVideoOrPdfSources[0].file_type, source_path: checkedVideoOrPdfSources[0].source_path, category: Array.isArray(checkedVideoOrPdfSources[0].category) ? checkedVideoOrPdfSources[0].category.filter(cat => cat !== "all")[0] : checkedVideoOrPdfSources[0].category },
        selectedOptions: ["graph"],
        inputContext: entityContext,
        ontology,
        title,
        isFullSource: isFullSourceDuration,
        from: checkedVideoOrPdfSources[0].file_type === "video" ? formatTime(entityVideoStart) : Number(entityPageFrom),
        to: checkedVideoOrPdfSources[0].file_type === "video" ? formatTime(entityVideoEnd) : Number(entityPageTo),
      };
      let response = await makeApiRequest('/graph', 'POST', payload);

      setStep(STEPS.at(-1));
      setSelectedJsonEntity(response);
      setJsonEntities(prev => [...prev, response]);
      setShowGraphModal(true);
      setEntityContext("");
    } catch (error) {
      console.log(error);
    } finally {
      setIsGeneratingGraph(false);
      setStep("");
    }
  }
  // =================== structure ====================


  /**
   * ============== BLOGS FEAT ===================
   */
  const checkedPdfSources = checkedSources.filter(source => source.file_type === "pdf");
  const [videoStart, setVideoStart] = useState({ h: "00", m: "00", s: "00" });
  const [videoEnd, setVideoEnd] = useState({ h: "00", m: "00", s: "00" });
  const [pageFrom, setPageFrom] = useState("1");
  const [pageTo, setPageTo] = useState(checkedPdfSources[0]?.total_pages || DEFAULT_TOTAL_PDF_PAGES);
  const [isFullSourceDurationBlog, setIsFullSourceDurationBlog] = useState(false);
  const [blogContext, setBlogContext] = useState("");
  const [isGeneratinBlog, setIsGeneratingBlog] = useState(false);
  const canGenerateBlog = checkedVideoOrPdfSources.length === 1 && blogContext?.trim() !== "" && !isProjectReadOnly;

  function isValidTimeFrame(sourceLength, start, end) {
    const startInSeconds = toSeconds(start);
    const endInSeconds = toSeconds(end);
    return startInSeconds >= 0 && endInSeconds <= sourceLength && startInSeconds < endInSeconds;
  }

  function isValidPageFrame(totalPages, from, to) {
    const fromPage = Number(from);
    const toPage = Number(to);
    return fromPage >= 1 && toPage <= totalPages && fromPage < toPage;
  }

  async function generateBlog() {
    try {
      if (!canGenerateBlog) return;

      if (!isFullSourceDurationBlog && checkedVideoOrPdfSources[0].file_type === "video" && !isValidTimeFrame(checkedVideoOrPdfSources[0].source_duration, videoStart, videoEnd)) {
        throw new Error("Invalid time frame selected.");
      }

      if (!isFullSourceDurationBlog && checkedVideoOrPdfSources[0].file_type === "pdf" && !isValidPageFrame(checkedVideoOrPdfSources[0].total_pages, pageFrom, pageTo)) {
        throw new Error("Invalid page frame selected.");
      }


      setIsGeneratingBlog(true);

      setStep("");

      // ============== generating metadata =====================
      if (!sourceHasMetadata) {
        setStep(STEPS[0]);
        await generateMetadata("", "medium", [{ id: "summary" }, { id: "highlights" }, { id: "chapters" }], [checkedVideoOrPdfSources[0]], { isGraph: true });
      }

      // ============= generating json structure ==================
      // setStep(STEPS[1]);
      // const payload = {
      //   isBlog: true,
      // sources: { file_type: checkedVideoOrPdfSources[0].file_type, source_path: checkedVideoOrPdfSources[0].source_path, category: Array.isArray(checkedVideoOrPdfSources[0].category) ? checkedVideoOrPdfSources[0].category.filter(cat => cat !== "all")[0] : checkedVideoOrPdfSources[0].category },
      //   selectedOptions: ["graph"],
      //   inputContext: "",
      //   ontology: "",
      //   title: "",
      // isFullSource: isFullSourceDurationBlog,
      // from: checkedVideoOrPdfSources[0].file_type === "video" ? formatTime(videoStart) : Number(pageFrom),
      // to: checkedVideoOrPdfSources[0].file_type === "video" ? formatTime(videoEnd) : Number(pageTo),
      // };
      // let response = await makeApiRequest('/graph', 'POST', payload);

      // =============== generating blog ===================
      setStep(STEPS[2]);
      const payload = {
        sources: { file_type: checkedVideoOrPdfSources[0].file_type, source_path: checkedVideoOrPdfSources[0].source_path, category: Array.isArray(checkedVideoOrPdfSources[0].category) ? checkedVideoOrPdfSources[0].category.filter(cat => cat !== "all")[0] : checkedVideoOrPdfSources[0].category },
        isFullSource: isFullSourceDurationBlog,
        from: checkedVideoOrPdfSources[0].file_type === "video" ? formatTime(videoStart) : Number(pageFrom),
        to: checkedVideoOrPdfSources[0].file_type === "video" ? formatTime(videoEnd) : Number(pageTo),
        context: blogContext
      };
      const { success, message, ...newBlog } = await makeApiRequest('/blog', 'POST', payload);

      if (success) {
        setStep(STEPS[3]);
        setBlogs(prev => [...prev, newBlog]);
        setSelectedBlog(newBlog);
        setShowBlogModal(true);
      } else {
        throw new Error(message || "couldn't donwload the blog");
      }

    } catch (error) {
      console.log(error);
      notify({
        variant: "error",
        heading: "Couldn't generate blog",
        subheading: error.message || "Something went wrong. Please verify your inputs and try again..",
      });
    } finally {
      setIsGeneratingBlog(false);
      setStep("");
    }
  }

  const [showBlogModal, setShowBlogModal] = useState(false);

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
            Generator Services</h5>
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

      {/* <h5 className={`select-none ${theme === "light" ? " text-textColor-200" : "text-textColor-100"
        }  text-center`}>
        Generator Services</h5> */}

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
          <div className={`${theme === "light" ? " text-textColor-200" : "text-textColor-100"
            } pb-[10px]`}>
            {/* buttons */}
            <div className={`flex justify-around gap-5 mt-2 flex-items overflow-x-auto [&::-webkit-scrollbar]:h-1
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700'}`}>
              {[
                { id: "genMetadata", title: "Catalog" },
                { id: "genMedia", title: "Reels" },
                { id: "genTimeSegment", title: "Analytics" },
                { id: "genStories", title: "Stories & Blogs" },
                { id: "genGraph", title: "Business Intelligence" },
              ].map(item => (
                // ${item.id === "genGraph" ? 'pointer-events-none opacity-30' : ''}
                <h6
                  id={item.id}
                  onClick={() => handleTabClick(item.id)}
                  className={`text-[14px] select-none text-md cursor-pointer min-w-fit ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100/70'} ${item.id === actualTab && `font-bold !text-primary-300`}
                   
                   `}
                  key={item.id}
                >
                  {item.title}
                </h6>
              ))}
            </div>
            {/* <GeneratorServicesDropdown
              defaultTab={actualTab}
              tabs={[
                { id: "genMetadata", title: "Cataloging" },
                { id: "genStories", title: "Insights & Stories" },
                { id: "genMedia", title: "Reels" },
                { id: "genGraph", title: "Composer" },
              ]}
              onChange={(id) => handleTabClick(id)}
            /> */}
          </div>
          {actualTab !== null && <div className='h-full overflow-hidden'>
            {
              actualTab === "genMetadata" ? (
                <MetadataGen verbosityValue={verbosityValue} setVerbosityValue={setVerbosityValue}
                  context={context} setContext={setContext} isGeneratingMetadata={isGeneratingMetadata} setIsGeneratingMetadata={setIsGeneratingMetadata} />
              ) : actualTab === "genStories" ? (
                <StoriesInsightsTab
                  isNewInsight={isNewInsight}
                  setIsNewInsight={setIsNewInsight}
                  currentTab={currentTab}
                  setCurrentTab={setCurrentTab}
                  setShowStoriesEditor={setShowStoriesEditor}
                  videoStart={videoStart}
                  setVideoStart={setVideoStart}
                  videoEnd={videoEnd}
                  setVideoEnd={setVideoEnd}
                  pageFrom={pageFrom}
                  setPageFrom={setPageFrom}
                  pageTo={pageTo}
                  setPageTo={setPageTo}
                  isFullSourceDurationBlog={isFullSourceDurationBlog}
                  setIsFullSourceDurationBlog={setIsFullSourceDurationBlog}
                  handleGenerateBlog={generateBlog}
                  context={blogContext}
                  setContext={setBlogContext}
                  isGeneratinBlog={isGeneratinBlog}
                  setIsGeneratingBlog={setIsGeneratingBlog}
                />
              ) : actualTab === "genMedia" ? (
                <MediaEntertainment isGeneratingReel={isGeneratingReel} setIsGeneratingReel={setIsGeneratingReel} context={reelContext} setContext={setReelContext}
                  verbosityValue={reelVerbosityValue} setVerbosityValue={setReelVerbosityValue} reel={reel} setReel={setReel} reels={reels} setReels={setReels}
                  isReelOpen={isReelOpen} setIsReelOpen={setIsReelOpen} />
              ) : actualTab === "genTimeSegment" ? (
                <VideoSegmentDescription
                  timeSegmentTitle={segmentTitle}
                  setTimeSegmentTitle={setSegmentTitle}
                  momentTitle={momentTitle}
                  setMomentTitle={setMomentTitle}
                  currentSegmentTab={currentSegmentTab}
                  setCurrentSegmentTab={setCurrentSegmentTab}
                  isSegmentPending={isSegmentPending}
                  setIsSegmentPending={setIsSegmentPending}
                  showSegmentList={showSegmentList}
                  setShowSegmentList={setShowSegmentList}
                  currentSegment={currentSegment}
                  setCurrentSegment={setCurrentSegment}
                  startSegmentDescription={startSegmentDescription}
                  setStartSegmentDescription={setStartSegmentDescription}
                  endSegmentDescription={endSegmentDescription}
                  setEndSegmentDescription={setEndSegmentDescription}
                  promptSegmentDescription={promptSegmentDescription}
                  setPromptSegmentDescription={setPromptSegmentDescription}
                  isInfoTooltipOpen={isInfoTooltipOpen}
                  setIsInfoTooltipOpen={setIsInfoTooltipOpen}
                  segmentDescriptions={segmentDescriptions}
                  setSegmentDescriptions={setSegmentDescriptions}
                  resultsDescription={resultsDescription}
                  setResultsDescription={setResultsDescription}
                  canGenerate={canGenerate}
                  generateDescription={generateDescription}
                  prompt={prompt}
                  setPrompt={setPrompt}
                  showList={showList}
                  setShowList={setShowList}
                  currentMoment={currentMoment}
                  setCurrentMoment={setCurrentMoment}
                  moments={moments}
                  setMoments={setMoments}
                  captionResults={captionResults}
                  setCaptionResults={setCaptionResults}
                  isPending={isPending}
                  setIsPending={setIsPending}
                  handleCaptionSubmit={handleCaptionSubmit}
                  saveMoment={saveMoment}
                />
              ) : actualTab === "genGraph" ? (
                <KnowledgeGraph
                  context={entityContext}
                  setContext={setEntityContext}
                  ontology={ontology}
                  setOntology={setOntology}
                  title={title}
                  setTitle={setTitle}
                  isGeneratingGraph={isGeneratingGraph}
                  setIsGeneratingGraph={setIsGeneratingGraph}
                  showGraphModal={showGraphModal}
                  setShowGraphModal={setShowGraphModal}
                  checkedVideoSource={checkedVideoSource}
                  sourceHasMetadata={sourceHasMetadata}
                  canGenerate={canGenerateEntity}
                  STEPS={STEPS}
                  step={step}
                  setStep={setStep}
                  generateGraph={generateGraph}
                  entityVideoStart={entityVideoStart}
                  setEntityVideoStart={setEntityVideoStart}
                  entityVideoEnd={entityVideoEnd}
                  setEntityVideoEnd={setEntityVideoEnd}
                  entityPageFrom={entityPageFrom}
                  setEntityPageFrom={setEntityPageFrom}
                  entityPageTo={entityPageTo}
                  setEntityPageTo={setEntityPageTo}
                  isFullSourceDuration={isFullSourceDuration}
                  setIsFullSourceDuration={setIsFullSourceDuration}
                />
              ) : null
            }
          </div>}
        </div>
      )}
      {isReelOpen && <ReelViewer reel={reel} closeReel={() => setIsReelOpen(false)} setReel={setReel} />}
      {
        showBlogModal && (
          <BlogViewerModal show={showBlogModal} onHide={() => setShowBlogModal(false)} />
        )
      }
    </aside>
  );
};

export default ChatPanel;