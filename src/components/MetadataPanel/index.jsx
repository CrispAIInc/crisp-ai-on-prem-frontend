import { useContext, useRef, useState, useEffect } from "react";
import { MainContext } from "../../contexts/mainContext.js";
import makeApiRequest from "../../api";
import ReactPlayer from "react-player";
import CancelIcon from "@mui/icons-material/Cancel";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import CustomSelectTwo from "../CustomSelectTwo";
import { flattenMetadata, timeToSeconds } from '../../utils.js';
import Chip from '../Chip/index.jsx';
import MetadataSkeleton from '../Skeletons/MetadataSkeleton';
import SearchSection from '../SearchSection';
import Faqs from '../Faqs';
import Accordion from '../Accordion/index.jsx';
import TimelineHorizontal from '../TimelineHorizontal/index.jsx';
import Timeline from '../Timeline/index.jsx';
import useCheckMobileScreen from '../../hooks/useCheckMobileScreen.js';
import HorizontalCard from '../HorizontalCard/index.jsx';

/**
 * chapters: [{id: number, thumbnail: string | file, timestamps: [number, number], title: string, description: string}]
 * highlights: [{id: number, thumbnail: string | file, timestamps: [number, number], title: string }]
 * faqs: [{id: number, question: string, answer: string}]
*/


const MetadataPanel = ({ workspaceContainer }) => {
  const {
    currentResource,
    setCurrentResource,
    resourceURL,
    chatLoaded,
    setResourceURL,
    player,
    languageOptions,
    isPlayerReady,
    setIsPlayerReady,
    setActiveView,
    jumpToPage,
    selectedNote,
    activeView,
    theme,
    selectedStory,
    translatedResource, setTranslatedResource,
  } = useContext(MainContext);
  // const [generatedResource, setTranslatedResource] = useState(currentResource);
  const [generatedResource, setGeneratedResource] = useState(null);
  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  const [numPages, setNumPages] = useState();
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);
  const [chosenLanguage, setChosenLanguage] = useState("en");
  const PdfContainer = useRef();
  const metadataPanelContainer = useRef(null);


  let currentResourceType = currentResource?.file_type;
  console.log(generatedResource);

  useEffect(() => {
    if (isPlayerReady && resourceURL && currentResource?.file_type === "video") {
      const timestamp = currentResource?.timestamp; // Make sure you have the timestamp here
      if (timestamp !== undefined && timestamp !== null) {
        player.current.seekTo(typeof timestamp === "number" ? timestamp : timeToSeconds(timestamp));
        setCurrentResource(prev => {
          const { timestamp, ...rest } = prev;
          return rest;
        });
      }
      // setFromStory(false);
    }
  }, [isPlayerReady, currentResource, currentResource?.timestamp]);

  useEffect(() => {
    if (isPdfLoaded && jumpToPage.page > 0 && jumpToPage.page <= numPages) {
      setTimeout(() => {
        const targetRef = pageRefs.current[jumpToPage.page - 1];
        if (targetRef && targetRef.scrollIntoView) {
          targetRef.scrollIntoView({ behavior: "smooth" });
        }
      }, 1500);
    }
  }, [jumpToPage, numPages, isPdfLoaded]);

  useEffect(() => {
    if (activeView === "resource") {
      // setTranslatedResource(currentResource);
      if (currentResource) {
        setGeneratedResource(translatedResource?.find((item) => item.source_path === currentResource.source_path));
        console.log(translatedResource?.find((item) => item.source_path === currentResource.source_path));
        // console.log(item.source_path === currentResource.source_path)
        console.log(generatedResource);
        // translateMetadata("en", currentResource);
      }
    }
  }, [currentResource?.source_path, translatedResource]);

  const closeVideo = (event) => {
    event.preventDefault();
    setCurrentResource(null);
    setResourceURL(null);
    setIsPlayerReady(false);
    setActiveView(() => {
      if (selectedStory.text.length > 0) {
        return "story";
      }
      if (selectedNote.text.length > 1) {
        return "note";
      }
      return null;
    });
  };

  const closePDF = (event) => {
    event.preventDefault();
    setCurrentResource(null);
    setResourceURL(null);
    setActiveView(() => {
      if (selectedStory.text.length > 0) {
        return "story";
      }
      if (selectedNote.text.length > 1) {
        return "note";
      }
      return null;
    });
  };

  const closeImage = (event) => {
    event.preventDefault();
    setCurrentResource(null);
    setResourceURL(null);
    setActiveView(() => {
      if (selectedStory.text.length > 0) {
        return "story";
      }
      if (selectedNote.text.length > 1) {
        return "note";
      }
      return null;
    });
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsPdfLoaded(true);
  };

  const pageRefs = useRef({});

  async function translateMetadata(chosenLanguage, object) {
    setChosenLanguage(chosenLanguage);
    setIsTranslationLoading(true);
    // make sure response body is also like httpRequestBody (w/o lang)
    // the response body object must contain keys in English
    let httpRequestBody = {
      lang: chosenLanguage,
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
      transcript: {
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
      "transcript",
      "caption",
      "keywords",
      "chapters",
      "highlights",
      "faqs"
    ];

    let obj = object.metadata ? flattenMetadata(object) : object;

    // extract keys/values from object (summary, topic_summaries, keywords, transcript and caption)
    for (const [key, value] of Object.entries(obj)) {
      if (
        TRANSLATABLE_KEYS.includes(key) &&
        (key !== "transcript" || currentResourceType !== "pdf")
      ) {
        httpRequestBody[key].title =
          key === "topic_summaries"
            ? "Detailed summary"
            : key.charAt(0).toUpperCase() + key.slice(1);
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
      setTranslatedResource({ ...httpResponseBody, lang: chosenLanguage });
    } catch (error) {
      console.log(error);
    } finally {
      setIsTranslationLoading(false);
    }
  }

  const [isGeneratingCombinedSummary, setIsGeneratingCombinedSummary] = useState(false);

  async function generateVisualAndCombinedSummary() {
    try {
      setIsGeneratingCombinedSummary(true);
      const { visual_summary, combined_summary } = await makeApiRequest('/generate-combined-summary', 'post', { video_filename: currentResource?.source_path });
      setTranslatedResource((prev) => ({
        ...prev,
        visual_summary: {
          title: "Visual Flow",
          content: visual_summary,
        },
        combined_summary: {
          title: "Combined Summary",
          content: combined_summary,
        },
      }));
      console.log(visual_summary, combined_summary);
    } catch (error) {
      console.log(error);
    } finally {
      setIsGeneratingCombinedSummary(false);
    }
  }

  const [visibleHighlightCount, setVisibleHighlightCount] = useState(3);
  const showMoreHighlights = () => {
    setVisibleHighlightCount((prevCount) => prevCount + 3);
  };

  const [visibleChaptersCount, setVisibleChaptersCount] = useState(3);
  const showMoreChapters = () => {
    setVisibleChaptersCount((prevCount) => prevCount + 3);
  };

  const isMobile = useCheckMobileScreen();

  return (
    <div className="max-w-4xl pt-10 mx-auto overflow-y-auto" ref={metadataPanelContainer}>
      {currentResource?.file_type === "video" && (
        <>
          <div className="relative ">
            <div className="h-full shadow-[0px_0px_38px_-2px_rgba(82,79,79,0.6)] rounded-md overflow-hidden">
              <CancelIcon
                onClick={closeVideo}
                color="error"
                className="absolute z-50 shadow-lg cursor-pointer right-4 top-2"
              />
              <ReactPlayer

                id="react-player"
                width={"100%"}
                height='500px'
                playing={true}
                url={resourceURL}
                onReady={() => setIsPlayerReady(true)}
                ref={player}
                controls
              />
            </div>
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
                <SearchSection isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />
                {/* generate visual/combined summary */}
                <div className="flex flex-wrap items-center justify-between gap-1 mb-10">
                  {/* {!isGeneratingCombinedSummary ? <div
                    className={`user-select-none flex items-center justify-center gap-2 py-1 mb-2 rounded-md cursor-pointer w-fit text-sm ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`} onClick={() => generateVisualAndCombinedSummary()}>
                    <AutoAwesomeOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                      Generate Visual & Combined Summary
                    </span>
                  </div> : (
                    <div className="flex items-center gap-2 mb-2">
                      <LoadingSpinner isSmall={true} />
                      <span
                        className={`font-medium ${theme === "light"
                          ? "text-textColor-300"
                          : "text-textColor-100"
                          }`}
                      >
                        Generating Summaries...
                      </span>
                    </div>
                  )} */}
                  <CustomSelectTwo
                    options={languageOptions}
                    onChange={(lang) =>
                      translateMetadata(lang.value, generatedResource)
                    }
                    placeholder="Select a language"
                  />
                </div>
                <>
                  {/* {(generatedResource?.combined_summary?.content !== "" && generatedResource?.combined_summary?.content !== undefined) && <>
                    <Accordion heading={generatedResource?.combined_summary?.title} isFirstOpen>
                      <p
                        className={`text-md ${theme === "light"
                          ? "text-textColor-300"
                          : "text-textColor-100"
                          }`}

                        dangerouslySetInnerHTML={{ __html: `${generatedResource?.combined_summary?.content?.replace(/\n/gi, '<br />')}` }}
                      ></p>
                    </Accordion>
                  </>} */}

                  {/* {(generatedResource?.visual_summary?.content !== "" && generatedResource?.visual_summary?.content !== undefined) && <>
                    <Accordion heading={generatedResource?.visual_summary?.title}>
                      <p
                        className={`text-md ${theme === "light"
                          ? "text-textColor-300"
                          : "text-textColor-100"
                          }`}
                        dangerouslySetInnerHTML={{ __html: `${generatedResource?.visual_summary?.content?.replace(/\n/gi, '<br />')}` }}
                      ></p>
                    </Accordion>
                  </>} */}

                  {generatedResource?.metadata?.summary?.content !== undefined &&
                    <>
                      <Accordion heading={generatedResource?.metadata?.summary?.title} isFirstOpen>
                        <p
                          className={`text-md ${theme === "light"
                            ? "text-textColor-300"
                            : "text-textColor-100"
                            }`}
                          dangerouslySetInnerHTML={{ __html: `<p>${generatedResource?.metadata?.summary?.content?.replace(/\n/gi, '<br />')}</p>` }}
                        ></p>
                      </Accordion>
                    </>}

                  {/* {generatedResource?.metadata?.topic_summaries?.content !== undefined &&
                    <>
                      <Accordion heading={generatedResource?.metadata?.topic_summaries?.title}>
                        <p
                          className={`text-md ${theme === "light"
                            ? "text-textColor-300"
                            : "text-textColor-100"
                            }`}
                          dangerouslySetInnerHTML={{ __html: `${generatedResource?.metadata?.topic_summaries?.content?.replace(/\n/gi, '<br />')}` }}
                        ></p>
                      </Accordion>
                    </>} */}
                </>

                {/* {currentResource.source_path != "Sacred_Valley___PERU.mp4" && ( */}
                {/* {generatedResource?.metadata?.transcript?.content !== undefined && <>
                  <Accordion heading={generatedResource?.metadata?.transcript?.title}>
                    <p
                      className={`text-md ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}

                      dangerouslySetInnerHTML={{ __html: `${generatedResource?.metadata?.transcript?.content?.replace(/\n/gi, '<br />')}` }}
                    >
                    </p>
                  </Accordion>
                </>} */}
                {generatedResource?.metadata?.keywords?.content !== undefined && <>
                  <Accordion heading={generatedResource?.metadata?.keywords?.title}>
                    <p
                      className={`flex items-center gap-2 flex-wrap`}
                    >
                      {
                        generatedResource?.metadata?.keywords?.content?.map(({ id, keyword }) => <Chip key={id} content={keyword} />)
                      }
                      {/* {generatedResource?.metadata?.keywords?.content} */}
                    </p>
                  </Accordion>
                </>}
                {generatedResource?.metadata?.highlights?.content !== undefined && <Accordion heading={generatedResource?.metadata?.highlights?.title}>
                  <div>
                    {
                      generatedResource?.metadata?.highlights?.content.slice(0, visibleHighlightCount).map((highlight) => (
                        <HorizontalCard key={highlight.id} item={highlight} workspaceContainer={workspaceContainer} />
                      ))
                    }

                    {generatedResource?.metadata?.highlights?.content.slice(0, visibleHighlightCount).length < generatedResource?.metadata?.highlights?.content?.length && <p className='font-semibold cursor-pointer text-primary-300' onClick={showMoreHighlights}>View more</p>}
                  </div>
                </Accordion>}

                {generatedResource?.metadata?.chapters?.content !== undefined && <Accordion heading={generatedResource?.metadata?.chapters?.title}>
                  {isMobile ? (
                    <TimelineHorizontal workspaceContainer={workspaceContainer} theme={theme} chapters={generatedResource?.metadata?.chapters?.content} />
                  ) : (
                    <>
                      <Timeline workspaceContainer={workspaceContainer} theme={theme} chapters={generatedResource?.metadata?.chapters?.content?.slice(0, visibleChaptersCount)} />
                      {generatedResource?.metadata?.chapters?.content?.slice(0, visibleChaptersCount).length < generatedResource?.metadata?.chapters?.content?.length && <p className='flex flex-col items-center justify-center p-2 mx-auto mt-3 text-lg font-semibold text-white rounded-full cursor-pointer w-9 h-9 bg-primary-300' onClick={showMoreChapters}>+</p>}
                    </>
                  )}
                </Accordion>}

                {generatedResource?.metadata?.faqs?.content !== undefined && <div className="mt-5 mb-5">
                  <Faqs heading={generatedResource?.metadata?.faqs?.title} faqs={generatedResource?.metadata?.faqs?.content} />
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
              className="relative h-[100vh] w-[75%] mx-auto  overflow-y-auto shadow-[0px_0px_38px_-2px_rgba(82,79,79,0.6)] rounded-md overflow-x-hidden"
              ref={PdfContainer}
              style={{ height: '550px', overflow: 'auto' }}
            >
              <Document
                className="!w-full mx-auto relative"
                file={resourceURL}

                onLoadSuccess={onDocumentLoadSuccess}
              >
                <CancelIcon
                  onClick={closePDF}
                  className="sticky top-0 z-50 shadow-lg cursor-pointer left-full"
                  color='error'
                />
                {Array.from(new Array(numPages), (el, index) => (
                  <div
                    key={`page_${index + 1}`}
                    ref={(el) => {
                      pageRefs.current[index] = el;
                    }}
                  >
                    <Page
                      _className="mx-auto !w-full !min-w-0"
                      className="!w-full mx-auto"
                      pageNumber={index + 1}
                      scale={0.7}
                      width={window.innerWidth * 0.8}
                    />
                  </div>
                ))}
              </Document>
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
                <SearchSection isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <CustomSelectTwo
                    options={languageOptions}
                    onChange={(lang) =>
                      translateMetadata(lang.value, generatedResource)
                    }
                    placeholder="Select a language"
                  />
                </div>

                {generatedResource?.metadata?.summary?.content !== undefined && <>
                  <Accordion heading={generatedResource?.metadata?.summary?.title}>
                    <p
                      className={`text-md ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}

                      dangerouslySetInnerHTML={{ __html: `${generatedResource?.metadata?.summary?.content?.replace(/\n/gi, '<br />')}` }}
                    ></p>
                  </Accordion>
                </>}

                {generatedResource?.metadata?.keywords?.content !== undefined && <>
                  <Accordion heading={generatedResource?.metadata?.keywords?.title}>
                    <p
                      className={`flex items-center gap-2 flex-wrap`}
                    >
                      {
                        generatedResource?.metadata?.keywords?.content?.map(({ id, keyword }) => <Chip key={id} content={keyword} />)
                      }
                      {/* {generatedResource?.metadata?.keywords?.content} */}
                    </p>
                  </Accordion>
                </>}
                {generatedResource?.metadata?.highlights?.content !== undefined && <Accordion heading={generatedResource?.metadata?.highlights?.title}>
                  <div>
                    {
                      generatedResource?.metadata?.highlights?.content.slice(0, visibleHighlightCount).map((highlight) => (
                        <HorizontalCard key={highlight.id} item={highlight} workspaceContainer={workspaceContainer} />
                      ))
                    }

                    {generatedResource?.metadata?.highlights?.content.slice(0, visibleHighlightCount).length < generatedResource?.metadata?.highlights?.content?.length && <p className='font-semibold cursor-pointer text-primary-300' onClick={showMoreHighlights}>View more</p>}
                  </div>
                </Accordion>}

                {generatedResource?.metadata?.chapters?.content !== undefined && <Accordion heading={generatedResource?.metadata?.chapters?.title}>
                  {isMobile ? (
                    <TimelineHorizontal workspaceContainer={workspaceContainer} theme={theme} chapters={generatedResource?.metadata?.chapters?.content} />
                  ) : (
                    <>
                      <Timeline workspaceContainer={workspaceContainer} theme={theme} chapters={generatedResource?.metadata?.chapters?.content?.slice(0, visibleChaptersCount)} />
                      {generatedResource?.metadata?.chapters?.content?.slice(0, visibleChaptersCount).length < generatedResource?.metadata?.chapters?.content?.length && <p className='flex flex-col items-center justify-center p-2 mx-auto mt-3 text-lg font-semibold text-white rounded-full cursor-pointer w-9 h-9 bg-primary-300' onClick={showMoreChapters}>+</p>}
                    </>
                  )}
                </Accordion>}

                {generatedResource?.metadata?.faqs?.content !== undefined && <div className="mt-5 mb-5">
                  <Faqs heading={generatedResource?.metadata?.faqs?.title} faqs={generatedResource?.metadata?.faqs?.content} />
                </div>}

                {/* {generatedResource?.metadata?.topic_summaries?.content !== undefined && <>
                  <Accordion heading={generatedResource?.metadata?.topic_summaries?.title}>
                    <p
                      className={`text-md ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}

                      dangerouslySetInnerHTML={{ __html: `${generatedResource?.metadata?.topic_summaries?.content?.replace(/\n/gi, '<br />')}` }}
                    ></p>
                  </Accordion>
                </>} */}
                {/* 
                {generatedResource?.metadata?.keywords?.content !== undefined && (<>
                  <Accordion heading={generatedResource?.metadata?.keywords?.title}>
                    <p
                      className={`flex items-center gap-2 flex-wrap`}
                    >
                      {
                        generatedResource?.metadata?.keywords?.content?.map(({ id, keyword }) => <Chip key={id} content={keyword} />)
                      }
                    </p>
                  </Accordion>
                </>)} */}
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
            <div className="relative pt-[56.25%] w-full max-w-lg mx-auto h-80 shadow-[0px_0px_38px_-2px_rgba(82,79,79,0.6)] rounded-md overflow-hidden">
              <CancelIcon
                color="error"
                onClick={closeImage}
                className="absolute right-[1%] top-[15px] cursor-pointer shadow-lg "
              />
              <img
                className="absolute top-0 left-0 object-contain w-full h-full"
                src={resourceURL}
              />
            </div>
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
                <SearchSection isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <CustomSelectTwo
                    options={languageOptions}
                    onChange={(lang) =>
                      translateMetadata(lang.value, generatedResource)
                    }
                    placeholder="Select a language"
                  />
                </div>
                {generatedResource?.metadata?.caption?.content !== undefined && <>
                  <Accordion heading={generatedResource?.metadata?.caption?.title} isFirstOpen>
                    <p
                      className={`text-md ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}

                      dangerouslySetInnerHTML={{ __html: `${generatedResource?.metadata?.caption?.content?.replace(/\n/gi, '<br />')}` }}
                    >
                    </p>
                  </Accordion>
                </>}

                {generatedResource?.metadata?.keywords?.content !== undefined && <>
                  <Accordion heading={generatedResource?.metadata?.keywords?.title}>
                    <p
                      className={`flex items-center gap-2 flex-wrap`}
                    >
                      {
                        generatedResource?.metadata?.keywords?.content?.map(({ keyword, id }) => <Chip key={id} content={keyword} />)
                      }
                      {/* {generatedResource?.metadata?.keywords?.content} */}
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
