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
import Accordion from '../Accordion/index.jsx';
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

  const [translatedResource, setTranslatedResource] = useState(generatedResources?.find((item) => item.source_path === currentResource.source_path));
  // const [generatedResource, setGeneratedResource] = useState(null);
  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  const [numPages, setNumPages] = useState();
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);
  const [chosenLanguage, setChosenLanguage] = useState(currentResource?.originalSourceLanguage || "en");

  useEffect(() => {
    if (
      isPlayerReady &&
      resourceURL &&
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
  }, [isPlayerReady, resourceURL, currentResource?.source_path, currentResource?.timestamp, currentResource?.file_type]);

  // pdfRef.current?.goToPage(jumpToPage.page);
  useEffect(() => {
    console.log(1);
    if (isPdfLoaded && jumpToPage.page > 0 && jumpToPage.page <= numPages) {
      console.log(2);
      setTimeout(() => {
        console.log(3);
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
          ...generatedResources?.find(item => item.source_path === currentResource.source_path)
        };

        // Update the currentResource state
        setCurrentResource(updatedResource);

        // Call translateMetadata with the updated resource

        // updateContent();
        translateMetadata(chosenLanguage, updatedResource);
      }
    }
  }, [currentResource?.source_path, JSON.stringify(generatedResources)]);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsPdfLoaded(true);
  };

  const pageRefs = useRef([]);
  const lastSeekContextRef = useRef(null);

  async function translateMetadata(_chosenLanguage, object, fromTranslateDropdown = false) {
    // updateContent();
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
      combined_summary: {
        title: "",
        content: "",
      },
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
      "combined_summary",
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
      setTranslatedResource({ ...httpResponseBody, lang: _chosenLanguage, prevLang });

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
      setSourcesWithExclusive(prev => prev?.filter(item => item !== currentResource?.source_path));
    };
  }, [currentResource]);


  const areSourcesSame = (arr1, arr2) => {
    const set1 = new Set(arr1.map(obj => obj.source_path));
    const set2 = new Set(arr2.map(obj => obj.source_path));

    if (set1.size !== set2.size) return false; // Different sizes

    for (const path of set1) {
      if (!set2.has(path)) return false; // Different elements
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

  const zoomIn = () => setScale((s) => Math.min(2.5, +(s + 0.1).toFixed(2)));
  const zoomOut = () => setScale((s) => Math.max(0.5, +(s - 0.1).toFixed(2)));


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
    <div className={`max-w-4xl mx-auto overflow-y-auto [&::-webkit-scrollbar]:h-1
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
            {/* <div className={`relative aspect-video w-full overflow-hidden rounded-md shadow-sm ${theme === 'light' ? '!border' : '!border !border-textColor-300'} `}>
              <ReactPlayer
                id="react-player"
                className="absolute top-0 left-0"
                width="100%"
                height="100%"
                playing={video_autoplay}
                loop={video_loop}
                url={sourcePublicUrl || resourceURL}
                onReady={() => setIsPlayerReady(true)}
                onDuration={() => setHasDuration(true)}
                ref={player}
                controls
              />
            </div> */}
            {/* video summary */}
            {!isTranslationLoading ? (
              <div
                className={`mt-10 metadata-container ${(chosenLanguage === "ar" ||
                  chosenLanguage === "ku" ||
                  chosenLanguage === "ckb" ||
                  chosenLanguage === "iw" ||
                  chosenLanguage === "ur") &&
                  "text-right"
                  }`}
              >
                {/* search */}
                {/* {currentResource?.metadata?.embeddings_generated && <SearchSection isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />} */}
                <SearchSection fromMetadata={true} isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />
                {/* generate visual/combined summary */}
                {(currentResource?.metadata && Object.keys(currentResource?.metadata).length > 0 && Object.keys(currentResource?.metadata).some(key => key !== "embeddings_generated")) && <div className={`flex flex-wrap items-center mb-2 mt-6 !border w-fit ${theme === 'light' ? "!border !border-textColor-100/70 bg-light-hover-100/30" : "!border !border-textColor-300 bg-light-hover-200/20 text-textColor-100"} rounded-full`}>
                  <LanguageOutlinedIcon className={`text-primary-300 ml-1`} />
                  <CustomSelectTwo
                    withIcon
                    options={languageOptions}
                    onChange={(lang) =>
                      translateMetadata(lang.value, translatedResource, true)
                    }
                    placeholder="Select a language"
                    className="!border-none"
                  />
                </div>}
                <>
                  {/* {translatedResource?.transcription?.content !== undefined && <> */}
                  <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.transcription?.title || "Transcription"}>
                    <p
                      className={`text-md ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}
                    >
                      <div className="flex flex-col gap-3">
                        {
                          (translatedResource?.transcription?.content &&
                            Array.isArray(translatedResource?.transcription?.content)) ? translatedResource?.transcription?.content?.map((topic, index) => (
                              <div key={topic.content} className="flex flex-col">
                                <div>
                                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                                    setCurrentResource(prev => ({ ...prev, timestamp: topic.start_time }));
                                    workspaceContainer?.current.scrollTo({
                                      top: 0,
                                      behavior: "smooth", // Enables smooth scrolling
                                    });
                                  }}>
                                    <h6 className='mb-0 text-xs font-semibold text-primary-200 '>{topic.start_time} - {topic.end_time}</h6>
                                  </div>
                                </div>
                                <p className="select-text" dangerouslySetInnerHTML={{ __html: topic.content.replace(/\n/g, "<br>") }}></p>
                              </div>
                            ))
                            :
                            (
                              <p className="italic">Transcription not available for this source.</p>
                            )
                        }
                      </div>
                    </p>
                  </Accordion>
                  {/* </>} */}
                  {translatedResource?.summary?.content !== undefined &&
                    <>
                      <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.summary?.title}>
                        <p
                          className={`text-md ${theme === "light"
                            ? "text-textColor-300"
                            : "text-textColor-100"
                            }`}
                          dangerouslySetInnerHTML={{ __html: `<p>${translatedResource?.summary?.content?.replace(/\n/gi, '<br />')}</p>` }}
                        ></p>
                      </Accordion>
                    </>}
                </>

                {/* {currentResource.source_path != "Sacred_Valley___PERU.mp4" && ( */}
                {translatedResource?.chapters?.content !== undefined && <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.chapters?.title}>
                  {/* {isMobile ? ( */}
                  <TimelineHorizontal workspaceContainer={workspaceContainer} theme={theme} chapters={translatedResource?.chapters?.content} />
                </Accordion>}


                {translatedResource?.highlights?.content !== undefined && <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.highlights?.title}>
                  <div>
                    {
                      translatedResource?.highlights?.content.slice(0, visibleHighlightCount).map((highlight) => (
                        <HorizontalCard key={highlight.id} item={highlight} workspaceContainer={workspaceContainer} />
                      ))
                    }

                    {translatedResource?.highlights?.content.slice(0, visibleHighlightCount).length < translatedResource?.highlights?.content?.length && <p className='font-semibold cursor-pointer text-primary-300' onClick={showMoreHighlights}>View more</p>}
                  </div>
                </Accordion>}

                {translatedResource?.keywords?.content !== undefined && <>
                  <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.keywords?.title}>
                    <p
                      className={`flex items-center gap-2 flex-wrap`}
                    >
                      {
                        translatedResource?.keywords?.content?.map(({ id, keyword }) => <Chip key={id} content={keyword} />)
                      }
                    </p>
                  </Accordion>
                </>}


                {translatedResource?.faqs?.content !== undefined && <div className="mt-5 mb-5">
                  <Faqs chosenLanguage={chosenLanguage} heading={translatedResource?.faqs?.title} faqs={translatedResource?.faqs?.content} />
                </div>}
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-10">
                <MetadataSkeleton className="w-full" />
              </div>
            )}
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
              {/* <PdfViewer
                sourcePublicUrl={sourcePublicUrl}
                resourceURL={resourceURL}
                fileName={null}
                ref={pdfRef}
              /> */}
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
                  position: 'sticky',
                  left: 0,
                  top: 0,
                  width: '100%',
                  // height: "100%",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0, flex: 1 }}>
                  <FileText size={17} style={{ color: "var(--pdf-text-secondary)", flexShrink: 0 }} />
                  <BaseHeading text={currentResource.source_path} />
                </div>
                {/* Page jump */}
                <div style={pillStyle}>
                  <button disabled={isPrevArrowDisabled} style={iconBtnStyle} className={`${isPrevArrowDisabled ? `!cursor-not-allowed ${(theme === 'light' ? ' !text-gray-400/80' : ' !text-gray-500')}` : ''}`} onClick={handleToPagePrevious} aria-label="Previous page">
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
                  <button disabled={isNextArrowDisabled} style={iconBtnStyle} className={`${isNextArrowDisabled ? `!cursor-not-allowed ${(theme === 'light' ? ' !text-gray-400/80' : ' !text-gray-500')}` : ''}`} onClick={handleToPageNext} aria-label="Next page">
                    <ChevronDown size={15} />
                  </button>
                </div>

                {/* Zoom */}
                <div style={pillStyle}>
                  <button style={iconBtnStyle} onClick={zoomOut} aria-label="Zoom out">
                    <Minus size={14} />
                  </button>
                  <span style={{ fontSize: 12, color: "var(--pdf-text-secondary)", minWidth: 36, textAlign: "center" }}>
                    {Math.round(scale * 100)}%
                  </span>
                  <button style={iconBtnStyle} onClick={zoomIn} aria-label="Zoom in">
                    <Plus size={14} />
                  </button>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 2 }}>
                  <button style={actionBtnStyle} onClick={handleDownload} aria-label="Download">
                    <Download size={16} />
                  </button>
                  {/* <button style={actionBtnStyle} onClick={handleFullscreen} aria-label="Fullscreen">
                    <Maximize2 size={16} />
                  </button> */}
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
                      // width={pageWidth}
                      // onRenderSuccess={() => {
                      //   if (jumpToPage.page === index + 1) {
                      //     pageRefs.current[index]?.scrollIntoView({
                      //       behavior: "smooth",
                      //     });
                      //   }
                      // }}
                      />

                    </div>
                  ))}
                </Document>
              </div>
            </div>
            {/* PDF summary */}
            {!isTranslationLoading ? (
              <div
                className={`mt-10 metadata-container ${(chosenLanguage === "ar" ||
                  chosenLanguage === "ku" ||
                  chosenLanguage === "ckb" ||
                  chosenLanguage === "iw" ||
                  chosenLanguage === "ur") &&
                  "text-right"
                  }`}
              >
                {/* search */}
                <SearchSection fromMetadata={true} isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />
                {(currentResource?.metadata && Object.keys(currentResource?.metadata).length > 0 && Object.keys(currentResource?.metadata).some(key => key !== "embeddings_generated")) && <div className={`flex flex-wrap items-center mt-5 mb-2 !border w-fit ${theme === 'light' ? "!border !border-textColor-100/70 bg-light-hover-100/30" : "!border !border-textColor-300 bg-light-hover-200/20 text-textColor-100"} rounded-md`}>
                  <LanguageOutlinedIcon className={`text-primary-300 ml-1`} />
                  <CustomSelectTwo
                    withIcon
                    options={languageOptions}
                    onChange={(lang) =>
                      translateMetadata(lang.value, translatedResource, true)
                    }
                    placeholder="Select a language"
                    className="!border-none"
                  />
                </div>}
                {translatedResource?.summary?.content !== undefined && <>
                  <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.summary?.title}>
                    <p
                      className={`text-md ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}

                      dangerouslySetInnerHTML={{ __html: `${translatedResource?.summary?.content?.replace(/\n/gi, '<br />')}` }}
                    ></p>
                  </Accordion>
                </>}
                {translatedResource?.chapters?.content !== undefined && <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.chapters?.title}>
                  {/* {isMobile ? ( */}
                  <TimelineHorizontal workspaceContainer={workspaceContainer} theme={theme} chapters={translatedResource?.chapters?.content} />
                </Accordion>}

                {translatedResource?.highlights?.content !== undefined && <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.highlights?.title}>
                  <div>
                    {
                      translatedResource?.highlights?.content.slice(0, visibleHighlightCount).map((highlight) => (
                        <HorizontalCard key={highlight.id} item={highlight} workspaceContainer={workspaceContainer} />
                      ))
                    }

                    {translatedResource?.highlights?.content.slice(0, visibleHighlightCount).length < translatedResource?.highlights?.content?.length && <p className='font-semibold cursor-pointer text-primary-300' onClick={showMoreHighlights}>View more</p>}
                  </div>
                </Accordion>}

                {translatedResource?.keywords?.content !== undefined && <>
                  <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.keywords?.title}>
                    <p
                      className={`flex items-center gap-2 flex-wrap`}
                    >
                      {
                        translatedResource?.keywords?.content?.map(({ id, keyword }) => <Chip key={id} content={keyword} />)
                      }
                    </p>
                  </Accordion>
                </>}




                {translatedResource?.faqs?.content !== undefined && <div className="mt-5 mb-5">
                  <Faqs chosenLanguage={chosenLanguage} heading={translatedResource?.faqs?.title} faqs={translatedResource?.faqs?.content} />
                </div>}
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-10">
                <MetadataSkeleton className="w-full" />
              </div>
            )}
          </>
        )}
      {
        currentResource?.file_type === "img" && (
          <div className="pb-10">
            {/* <div className={`relative pt-[56.25%] w-full max-w-lg mx-auto h-80 ${theme === " light" ? "!border" : "!border !border-textColor-300"} rounded-md overflow-hidden [&::-webkit-scrollbar]:h-1 */}
            {/* [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-800 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700'}`}> */}
            {/* <GsFile
                className="absolute top-0 left-0 object-contain w-full h-full"
                gsUrl={currentResource?.thumbnail || resourceURL}
              /> */}
            <ImageViewer
              src={currentResource?.thumbnail || resourceURL}
              alt={currentResource.source_path}
              eyebrow={currentResource.source_path}
            />
            {/* </div> */}
            {/* Image Caption */}
            {!isTranslationLoading ? (
              <div
                className={`mt-10 metadata-container ${(chosenLanguage === "ar" ||
                  chosenLanguage === "ku" ||
                  chosenLanguage === "ckb" ||
                  chosenLanguage === "iw" ||
                  chosenLanguage === "ur") &&
                  "text-right"
                  }`}
              >
                {/* search */}
                {(currentResource?.metadata && Object.keys(currentResource?.metadata).length > 0 && Object.keys(currentResource?.metadata).some(key => key !== "embeddings_generated")) && <div className={`flex flex-wrap items-center mb-10 !border w-fit ${theme === 'light' ? "!border !border-textColor-100/70 bg-light-hover-100/30" : "!border !border-textColor-300 bg-light-hover-200/20 text-textColor-100"} rounded-md`}>
                  <LanguageOutlinedIcon className={`text-primary-300 ml-1`} />
                  <CustomSelectTwo
                    withIcon
                    options={languageOptions}
                    onChange={(lang) =>
                      translateMetadata(lang.value, translatedResource, true)
                    }
                    placeholder="Select a language"
                    className="!border-none"
                  />
                </div>}
                {translatedResource?.summary?.content !== undefined && <>
                  <Accordion isFirstOpen chosenLanguage={chosenLanguage} heading={translatedResource?.summary?.title} >
                    <p
                      className={`text-md ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}

                      dangerouslySetInnerHTML={{ __html: `${translatedResource?.summary?.content?.replace(/\n/gi, '<br />')}` }}
                    >
                    </p>
                  </Accordion>
                </>}

                {translatedResource?.keywords?.content !== undefined && <>
                  <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.keywords?.title}>
                    <p
                      className={`flex items-center gap-2 flex-wrap`}
                    >
                      {
                        translatedResource?.keywords?.content?.map(({ keyword, id }) => <Chip key={id} content={keyword} />)
                      }
                    </p>
                  </Accordion>
                </>}
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-10">
                <MetadataSkeleton className="w-full" />
              </div>
            )}
          </div>
        )
      }
    </div >
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
