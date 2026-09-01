import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { useContext, useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import ReactPlayer from "react-player";
import ImageViewer from "../ImageViewer";
import makeApiRequest from "../../api";
import { MainContext } from "../../contexts/mainContext.jsx";
import { SettingsContext } from '../../contexts/settingsContext.jsx';
import useFirebase from '../../hooks/useFirebase.js';
import { flattenMetadata, timeToSeconds } from '../../utils.js';
import Chip from '../Chip/index.jsx';
import CustomSelectTwo from "../CustomSelectTwo";
import Faqs from '../Faqs';
import GsFile from "../GsFile";
import HorizontalCard from '../HorizontalCard/index.jsx';
import SearchSection from '../SearchSection';
import MetadataSkeleton from '../Skeletons/MetadataSkeleton';
import TimelineHorizontal from '../TimelineHorizontal/index.jsx';
import CustomVideoPlayer from '../CustomVideoPlayer/index.jsx';
import PdfViewer from '../PdfViewer/';
import {
  FileText,
  ChevronUp,
  ChevronDown,
  Minus,
  Plus,
  Download,
  Maximize2,
} from "lucide-react";
import BaseHeading from '../BaseHeading/index.jsx';
import Metadata from '../Metadata/index.jsx';

const MetadataPanel = ({ workspaceContainer, centerPanelRef, leftWidth, maxWidth }) => {
  const {
    currentResource,
    setCurrentResource,
    resourceURL,
    chatLoaded,
    sourcesWithExclusive, setSourcesWithExclusive,
    player,
    setIsSourceUncheckedOrClosed,
    languageOptions,
    isPlayerReady,
    setIsPlayerReady,
    hasDuration,
    setHasDuration,
    pdfRef,
    jumpToPage,
    committedSources,
    activeView,
    theme,
    generatedResources,
    metadataPanelContainer,
    setJumpToPage
  } = useContext(MainContext);


  const { generalSettings: { video_autoplay, video_loop } } = useContext(SettingsContext);

  const { getPublicUrl } = useFirebase();

  const [translatedResource, setTranslatedResource] = useState(generatedResources?.find((item) => item.source_id === currentResource.source_id));
  // const [generatedResource, setGeneratedResource] = useState(null);
  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  const [numPages, setNumPages] = useState();
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);
  const [chosenLanguage, setChosenLanguage] = useState(currentResource?.originalSourceLanguage || "en");

  useEffect(() => {
    if (
      isPlayerReady &&
      currentResource?.file_type === "video"
    ) {
      const timestamp = currentResource?.timestamp;

      if (timestamp !== undefined && timestamp !== null) {
        const redirectedTimestamp =
          typeof timestamp === "number"
            ? timestamp
            : timeToSeconds(timestamp);

        const seekContext = `${currentResource?.source_path ?? ""}:${redirectedTimestamp}`;

        if (seekContext !== lastSeekContextRef.current) {
          lastSeekContextRef.current = seekContext;

          setTimeout(() => {
            player.current?.seekTo(redirectedTimestamp, "seconds");
          }, 1500);
        }
      }
    }
  }, [isPlayerReady, currentResource?.source_id, currentResource?.timestamp, currentResource?.file_type]);

  // pdfRef.current?.goToPage(jumpToPage.page);
  useEffect(() => {
    if (isPdfLoaded && jumpToPage.page > 0 && jumpToPage.page <= numPages) {
      setTimeout(() => {
        const targetRef = pageRefs.current[jumpToPage.page - 1];
        if (targetRef && targetRef.scrollIntoView) {
          targetRef.scrollIntoView({ behavior: "smooth" });
          workspaceContainer.current.scrollTo({
            top: 0,
            behavior: "smooth",
          });
        }
      }, 500);
    }
  }, [jumpToPage, numPages, isPdfLoaded]);

  useEffect(() => {
    if (activeView === "resource") {
      // setTranslatedResource(currentResource);
      if (currentResource) {

        const updatedResource = {
          ...currentResource,
          ...generatedResources?.find(item => item.source_id === currentResource.source_id)
        };

        // Update the currentResource state
        setCurrentResource(updatedResource);

        // Call translateMetadata with the updated resource

        // updateContent();
        translateMetadata(chosenLanguage, updatedResource);
      }
    }
  }, [currentResource?.source_id, JSON.stringify(generatedResources)]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsPdfLoaded(true);
  };

  const pageRefs = useRef([]);
  const lastSeekContextRef = useRef(null);

  const requestIdRef = useRef(0);
  async function translateMetadata(_chosenLanguage, object, fromTranslateDropdown = false) {
    const thisRequestId = ++requestIdRef.current; // mark this call as "the latest"

    let prevLang = chosenLanguage;
    setChosenLanguage(prev => fromTranslateDropdown ? _chosenLanguage : prev);
    setIsTranslationLoading(true);
    // make sure response body is also like httpRequestBody (w/o lang)
    // the response body object must contain keys in English
    let httpRequestBody = {
      prevLang,
      lang: _chosenLanguage,
      summary: {
        title: "",
        content: "",
      },
      visual_summary: {
        title: "Visual Flow",
        content: "",
      },
      // combined_summary: {
      //   title: "",
      //   content: "",
      // },
      topic_summaries: {
        title: "",
        content: "",
      },
      transcription: {
        title: "",
        content: [],
      },
      knowledgeGraoh: {
        title: "",
        content: "",
      },
      caption: {
        title: "",
        content: "",
      },
      keywords: {
        title: "",
        content: null,
      },
      chapters: {
        title: "",
        content: null,
      },
      highlights: {
        title: "",
        content: null,
      },
      faqs: {
        title: "",
        content: null,
      },

    };
    const TRANSLATABLE_KEYS = [
      "summary",
      "visual_summary",
      // "combined_summary",
      "topic_summaries",
      "transcription",
      "caption",
      "keywords",
      "chapters",
      "highlights",
      "knowledgeGraph",
      "faqs"
    ];

    // 
    let obj = (object.metadata !== undefined || object.metadata !== null) ? flattenMetadata(object) : object;
    // extract keys/values from object (summary, topic_summaries, keywords, transcript and caption)
    for (const [key, value] of Object.entries(obj)) {
      if (
        TRANSLATABLE_KEYS.includes(key)
      ) {
        httpRequestBody[key].title =
          key === "topic_summaries"
            ? "Detailed summary"
            : key === "caption" ? "Summary" : key.charAt(0).toUpperCase() + key.slice(1);
        httpRequestBody[key].content =
          typeof value === "object" ? value.content : value;
      }
    }

    try {
      const httpResponseBody = await makeApiRequest(
        "/translate-metadata",
        "post",
        httpRequestBody
      );

      // Only apply this response if no newer call has started since we began
      if (thisRequestId === requestIdRef.current) {
        setTranslatedResource({ ...httpResponseBody, lang: _chosenLanguage, prevLang });
      }

    } catch (error) {
      console.log(error);
    } finally {
      setIsTranslationLoading(false);
    }
  }

  const [visibleHighlightCount, setVisibleHighlightCount] = useState(3);
  const showMoreHighlights = () => {
    setVisibleHighlightCount((prevCount) => prevCount + 3);
  };

  const [visibleChaptersCount, setVisibleChaptersCount] = useState(3);

  useEffect(() => {
    return () => {
      setSourcesWithExclusive(prev => prev?.filter(item => item !== currentResource?.source_id));
    };
  }, [currentResource]);


  const areSourcesSame = (arr1, arr2) => {
    const set1 = new Set(arr1.map(obj => obj.source_id));
    const set2 = new Set(arr2.map(obj => obj.source_id));

    if (set1.size !== set2.size) return false; // Different sizes

    for (const id of set1) {
      if (!set2.has(id)) return false; // Different elements
    }

    return true; // Arrays contain the same objects (ignoring order)
  };
  const [isChecked, setIsChecked] = useState(Boolean(sourcesWithExclusive?.find(item => item === currentResource?.source_path)?.length));

  const [sourcesAfterCheckCrispWiz, setSourcesAfterCheckCrispWiz] = useState([]);

  useEffect(() => {
    setIsSourceUncheckedOrClosed(!isChecked);

    if (isChecked) {
      setSourcesAfterCheckCrispWiz(committedSources);
    }
  }, [isChecked]);

  const [parentWidth, setParentWidth] = useState(0);

  useEffect(() => {
    if (metadataPanelContainer.current) {
      setParentWidth(metadataPanelContainer.current.offsetWidth);
    }
  }, []);

  const [sourcePublicUrl, setSourcePublicUrl] = useState(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(video_autoplay);
  const [thumbnailPublicUrl, setThumbnailPublicUrl] = useState(null);

  const handleDownload = async () => {

    try {
      const publicReelUrl = await getPublicUrl(sourcePublicUrl || resourceURL);

      const response = await fetch(publicReelUrl);
      const blob = await response.blob();

      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${currentResource.source_path}.pdf`;

      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);

    } catch (error) {
      console.log(error);
    }
  };


  useEffect(() => {
    if (!currentResource) return;

    const urlMap = {
      pdf: currentResource.pdf_url,
      video: currentResource.video_url,
      img: currentResource.thumbnail,
    };

    const fileUrl = urlMap[currentResource.file_type] || null;

    if (fileUrl) {
      getPublicUrl(fileUrl)
        .then(setSourcePublicUrl)
        .catch(console.error);
    }
  }, [currentResource]);

  useEffect(() => {
    if (currentResource?.thumbnail) {
      getPublicUrl(currentResource.thumbnail)
        .then(setThumbnailPublicUrl)
        .catch(console.error);
    }
  }, [currentResource]);

  const [pageInput, setPageInput] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [scale, setScale] = useState(1.1);

  const isPrevArrowDisabled = currentPage <= 1;
  const isNextArrowDisabled = currentPage >= numPages;


  useEffect(() => {
    if (!numPages) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find the page that's most visible
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length > 0) {
          const page = Number(
            visible[0].target.getAttribute("data-page")
          );

          setCurrentPage(page);
        }
      },
      {
        root: workspaceContainer.current, // your scroll container
        threshold: [0.25, 0.5, 0.75],
      }
    );

    pageRefs.current.forEach((page) => {
      if (page) observer.observe(page);
    });

    return () => observer.disconnect();
  }, [numPages, pageInput, jumpToPage.page, jumpToPage]);

  useEffect(() => {
    setPageInput(jumpToPage.page);
  }, [jumpToPage, jumpToPage.page]);

  useEffect(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const handlePageInputSubmit = (e) => {
    e.preventDefault();
    setJumpToPage({ page: parseInt(pageInput, 10) });
  };

  const handleToPagePrevious = () => {
    const newPage = currentPage <= 1 ? 1 : currentPage - 1;
    setJumpToPage({ page: newPage });
    // setPageInput(newPage);
  };

  const handleToPageNext = () => {
    const newPage = currentPage >= numPages ? numPages : currentPage + 1;
    setJumpToPage({ page: newPage });
    // setPageInput(newPage);
  };

  const [index, setIndex] = useState(0);

  return (
    <div className={`max-w-4xl mx-auto [&::-webkit-scrollbar]:h-1
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700'}`} ref={metadataPanelContainer}>

      {currentResource?.file_type === "video" && (
        <>
          <div className="relative ">
            <CustomVideoPlayer
              sourcePublicUrl={sourcePublicUrl}
              resourceURL={resourceURL}
              video_autoplay={video_autoplay}
              video_loop={video_loop}
              title={currentResource?.source_path}
              chapters={translatedResource?.chapters?.content || []}
              highlights={translatedResource?.highlights?.content || []}
              onReady={() => setIsPlayerReady(true)}
              onDuration={() => setHasDuration(true)}
              playerRef={player}
            />
          </div>
        </>
      )
      }
      {
        currentResource?.file_type === "pdf" && (
          <>
            <div
              className={`relative w-[90%] h-[500px] mx-auto overflow-y-hidden ${theme === "light" ? "!border !border-textColor-200/20" : "!border !border-textColor-300"} flex flex-col rounded-md overflow-x-auto shadow-sm [&::-webkit-scrollbar]:h-1
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700'}`}
            // ref={workspaceContainer}
            // style={{ height: leftWidth === maxWidth ? parentWidth * 1.3 : parentWidth * 1.4 }}
            >
              <div
                className="backdrop-blur-md !bg-transparent"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  padding: "8px 14px",
                  // background: "var(--pdf-surface-2)",
                  borderBottom: "1px solid var(--pdf-border)",
                  flexShrink: 0,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                  <FileText size={17} style={{ color: "var(--pdf-text-secondary)", flexShrink: 0 }} />
                  <BaseHeading text={currentResource.source_path} />
                </div>
                {/* Page jump */}
                <div style={pillStyle}>
                  <button disabled={isPrevArrowDisabled} style={iconBtnStyle} className={isPrevArrowDisabled ? "!cursor-not-allowed" : ""} onClick={handleToPagePrevious} aria-label="Previous page">
                    <ChevronUp size={15} />
                  </button>
                  <form onSubmit={handlePageInputSubmit} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <input
                      min={1}
                      max={numPages}
                      value={pageInput}
                      onChange={(e) => setPageInput(e.target.value)}
                      style={pageInputStyle}
                      aria-label="Current page"
                      className={`outline-none ${theme === 'light' ? '!border !border-textColor-200/30' : '!border !border-textColor-200/20'}`}
                    />
                    <span style={{ fontSize: 12, color: "var(--pdf-text-secondary)", fontVariantNumeric: "tabular-nums" }}>
                      / {numPages || "—"}
                    </span>
                  </form>
                  <button disabled={isNextArrowDisabled} style={iconBtnStyle} className={isNextArrowDisabled ? "!cursor-not-allowed" : ""} onClick={handleToPageNext} aria-label="Next page">
                    <ChevronDown size={15} />
                  </button>
                </div>


                {/* Actions */}
                <div style={{ display: "flex", gap: 2 }}>
                  <button style={actionBtnStyle} onClick={handleDownload} aria-label="Download">
                    <Download size={16} />
                  </button>
                </div>
              </div>
              <div className={`flex-1 h-full overflow-y-auto [&::-webkit-scrollbar]:h-1
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700'}`}>
                <Document
                  className="!w-full mx-auto relative "
                  file={sourcePublicUrl || resourceURL}
                  onLoadSuccess={onDocumentLoadSuccess}
                >

                  {Array.from(new Array(numPages), (el, index) => (
                    <div
                      key={`page_${index + 1}`}
                      data-page={index + 1}
                      ref={(el) => {
                        pageRefs.current[index] = el;
                      }}
                    >
                      <Page
                        className="mx-auto"
                        pageNumber={index + 1}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        scale={scale}
                      />
                    </div>
                  ))}
                </Document>
              </div>
            </div>
          </>
        )}
      {
        currentResource?.file_type === "img" && (
          <div className="pb-10">
            <ImageViewer
              src={currentResource?.thumbnail || resourceURL}
              alt={currentResource.source_path}
              eyebrow={currentResource.source_path}
            />
          </div>
        )
      }

      {/* source metadata */}
      {!isTranslationLoading ? (
        <div className="mt-3">
          <Metadata
            translateMetadata={translateMetadata}
            translatedResource={translatedResource}
          />
        </div>
      ) : (
        <div className="flex items-center gap-3 mt-10">
          <MetadataSkeleton className="w-full" />
        </div>
      )}
    </div>
  );
};
export default MetadataPanel;


const pillStyle = {
  display: "flex",
  alignItems: "center",
  gap: 4,
  background: "var(--pdf-surface-1)",
  border: "1px solid var(--pdf-border)",
  borderRadius: 6,
  padding: 3,
};

const iconBtnStyle = {
  width: 26,
  height: 26,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  borderRadius: 4,
  color: "var(--pdf-text-secondary)",
  cursor: "pointer",
};

const actionBtnStyle = {
  width: 30,
  height: 30,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "transparent",
  border: "none",
  borderRadius: 6,
  color: "var(--pdf-text-secondary)",
  cursor: "pointer",
};

const pageInputStyle = {
  width: 30,
  height: 24,
  textAlign: "center",
  // border: "1px solid var(--pdf-border)",
  borderRadius: 4,
  fontSize: 12,
  background: "var(--pdf-surface-1)",
  color: "var(--pdf-text-primary)",
};
