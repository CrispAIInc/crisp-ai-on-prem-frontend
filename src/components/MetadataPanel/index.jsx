import { useContext, useRef, useState, useEffect } from "react";
import { MainContext } from "../../contexts/mainContext.js";
import makeApiRequest from "../../api";
import ReactPlayer from "react-player";
import CancelIcon from "@mui/icons-material/Cancel";
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { Document, Page } from "react-pdf";
import LoadingSpinner from "../LoadingSpinner";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import CustomSelectTwo from "../CustomSelectTwo";
import { timeToSeconds } from '../../utils.js';
import Chip from '../Chip/index.jsx';
import MetadataSkeleton from '../Skeletons/MetadataSkeleton';
import SearchSection from '../SearchSection/index.jsx';

const MetadataPanel = () => {
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
  } = useContext(MainContext);
  const [translatedResource, setTranslatedResource] = useState(currentResource);
  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  const [numPages, setNumPages] = useState();
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);
  const [chosenLanguage, setChosenLanguage] = useState("en");
  const PdfContainer = useRef();

  let currentResourceType = currentResource.file_type;

  useEffect(() => {
    if (isPlayerReady && resourceURL && currentResource.file_type === "video") {
      const timestamp = currentResource?.timestamp; // Make sure you have the timestamp here
      if (timestamp !== undefined && timestamp !== null) player.current.seekTo(typeof timestamp === "number" ? timestamp : timeToSeconds(timestamp));
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
      setTranslatedResource(currentResource);
      if (currentResource) translateMetadata("en", currentResource);
    }
  }, [currentResource.source_path]);

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
        content: "",
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
    ];
    // extract keys/values from object (summary, topic_summaries, keywords, transcript and caption)
    for (const [key, value] of Object.entries(object)) {
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
      const { visual_summary, combined_summary } = await makeApiRequest('/generate-combined-summary', 'post', { video_filename: currentResource.source_path });
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

  return (
    <div className="max-w-4xl pt-10 mx-auto">
      {currentResource.file_type === "video" && (
        <>
          <div className="relative">
            <CancelIcon
              onClick={closeVideo}
              color="error"
              className="absolute z-50 cursor-pointer right-4 top-2"
            />
            <ReactPlayer
              id="react-player"
              width={"100%"}
              height={"100%"}
              playing={true}
              url={resourceURL}
              onReady={() => setIsPlayerReady(true)}
              ref={player}
              controls
            />
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
                {!isGeneratingCombinedSummary ? <div
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
                )}
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <CustomSelectTwo
                    options={languageOptions}
                    onChange={(lang) =>
                      translateMetadata(lang.value, translatedResource)
                    }
                    placeholder="Select a language"
                  />
                </div>
                {/* {currentResource.source_path != "Sacred_Valley___PERU.mp4" &&
                  currentResource.source_path != "videoplayback.mp4" && ( */}
                <>
                  {(translatedResource?.combined_summary?.content !== "" && translatedResource?.combined_summary?.content !== undefined) && <>
                    <h3
                      className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                        }`}
                    >
                      {translatedResource?.combined_summary?.title}
                    </h3>
                    <p
                      className={`text-sm ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}

                      dangerouslySetInnerHTML={{ __html: `${translatedResource?.combined_summary?.content?.replace(/\n/gi, '<br />')}` }}
                    >
                      {/* {translatedResource?.combined_summary?.content} */}
                    </p>
                  </>}

                  {(translatedResource?.visual_summary?.content !== "" && translatedResource?.visual_summary?.content !== undefined) && <>
                    <h3
                      className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                        }`}
                    >
                      {translatedResource?.visual_summary?.title}
                    </h3>
                    <p
                      className={`text-sm ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}
                      dangerouslySetInnerHTML={{ __html: `${translatedResource?.visual_summary?.content?.replace(/\n/gi, '<br />')}` }}
                    >
                      {/* {translatedResource?.visual_summary?.content} */}
                    </p>
                  </>}

                  {translatedResource?.summary?.content !== undefined && <><h3
                    className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                      }`}
                  >
                    {translatedResource?.summary?.title}
                  </h3>
                    <p
                      className={`text-sm ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}
                      dangerouslySetInnerHTML={{ __html: `<p>${translatedResource?.summary?.content?.replace(/\n/gi, '<br />')}</p>` }}
                    >
                      {/* {translatedResource?.summary?.content} */}
                    </p></>}

                  {translatedResource?.topic_summaries?.content !== undefined && <><h3
                    className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                      }`}
                  >
                    {translatedResource?.topic_summaries?.title}
                  </h3>
                    <p
                      className={`text-sm ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}

                      dangerouslySetInnerHTML={{ __html: `${translatedResource?.topic_summaries?.content?.replace(/\n/gi, '<br />')}` }}
                    >
                      {/* {translatedResource?.topic_summaries?.content} */}
                    </p></>}
                </>

                {/* {currentResource.source_path != "Sacred_Valley___PERU.mp4" && ( */}
                <>
                  {translatedResource?.transcript?.content !== undefined && <><h3
                    className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                      }`}
                  >
                    {translatedResource?.transcript?.title}
                  </h3>
                    <p
                      className={`text-sm ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}

                      dangerouslySetInnerHTML={{ __html: `${translatedResource?.transcript?.content?.replace(/\n/gi, '<br />')}` }}
                    >
                      {/* {translatedResource?.transcript?.content} */}
                    </p></>}
                  {translatedResource?.keywords?.content !== undefined && <><h3
                    className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                      }`}
                  >
                    {translatedResource?.keywords?.title}
                  </h3>
                    <p
                      className={`flex items-center gap-2 flex-wrap`}

                    // dangerouslySetInnerHTML={{ __html: `${translatedResource?.keywords?.content?.replace(/\n/gi, '<br />')}` }}
                    >
                      {
                        translatedResource?.keywords?.content?.split(', ').map((keyword, index) => <Chip key={index} content={keyword} />)
                      }
                      {/* {translatedResource?.keywords?.content} */}
                    </p></>}
                </>
                {/* )} */}
              </div>
            ) : (
              <div className="flex items-center gap-3 mt-10">
                <MetadataSkeleton className="w-full" />
              </div>
            )}
          </div>
        </>
      )}
      {currentResource.file_type === "pdf" && (
        <>
          <div
            className="relative h-[70vh] w-full mx-auto overflow-x-hidden overflow-y-auto"
            ref={PdfContainer}
          >
            <Document
              className="!w-full mx-auto relative"
              file={resourceURL}
              onLoadSuccess={onDocumentLoadSuccess}
            >
              <CancelIcon
                onClick={closePDF}
                className="sticky top-0 z-50 cursor-pointer left-full"
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
                    scale={2.0}
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
                    translateMetadata(lang.value, translatedResource)
                  }
                  placeholder="Select a language"
                />
                <SearchSection isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />
              </div>

              {translatedResource?.summary?.content !== undefined && <><h3
                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                  }`}
              >
                {translatedResource?.summary?.title}
              </h3>
                <p
                  className={`text-sm ${theme === "light"
                    ? "text-textColor-300"
                    : "text-textColor-100"
                    }`}

                  dangerouslySetInnerHTML={{ __html: `${translatedResource?.summary?.content?.replace(/\n/gi, '<br />')}` }}
                >
                  {/* {translatedResource?.summary?.content} */}
                </p></>}

              {translatedResource?.topic_summaries?.content !== undefined && <><h3
                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                  }`}
              >
                {translatedResource?.topic_summaries?.title}
              </h3>
                <p
                  className={`text-sm ${theme === "light"
                    ? "text-textColor-300"
                    : "text-textColor-100"
                    }`}

                  dangerouslySetInnerHTML={{ __html: `${translatedResource?.topic_summaries?.content?.replace(/\n/gi, '<br />')}` }}
                >
                  {/* {translatedResource?.topic_summaries?.content} */}
                </p></>}

              {translatedResource?.keywords?.content !== undefined && (<><h3
                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                  }`}
              >
                {translatedResource?.keywords?.title}
              </h3>
                <p
                  className={`flex items-center gap-2 flex-wrap`}

                // dangerouslySetInnerHTML={{ __html: `${translatedResource?.keywords?.content?.replace(/\n/gi, '<br />')}` }}
                >
                  {
                    translatedResource?.keywords?.content?.split(', ').map((keyword, index) => <Chip key={index} content={keyword} />)
                  }
                  {/* {translatedResource?.keywords?.content} */}
                </p></>)}
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-10">
              <MetadataSkeleton className="w-full" />
            </div>
          )}
        </>
      )}
      {currentResource.file_type === "img" && (
        <div className="pb-10">
          <div className="relative w-[70%] h-72 w-full h-full max-w-lg mx-auto">
            <CancelIcon
              onClick={closeImage}
              className="absolute right-[1%] top-[15px] cursor-pointer"
            />
            <img
              className="w-full h-full pt-2 rounded-lg source-img"
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
                    translateMetadata(lang.value, translatedResource)
                  }
                  placeholder="Select a language"
                />
                <SearchSection isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />
              </div>
              {translatedResource?.caption?.content !== undefined && <><h3
                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                  }`}
              >
                {translatedResource?.caption?.title}
              </h3>
                <p
                  className={`text-sm ${theme === "light"
                    ? "text-textColor-300"
                    : "text-textColor-100"
                    }`}

                  dangerouslySetInnerHTML={{ __html: `${translatedResource?.caption?.content?.replace(/\n/gi, '<br />')}` }}
                >
                  {/* {translatedResource?.caption?.content} */}
                </p></>}

              {translatedResource?.keywords?.content !== undefined && <><h3
                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                  }`}
              >
                {translatedResource?.keywords?.title}
              </h3>
                <p
                  className={`flex items-center gap-2 flex-wrap`}

                // dangerouslySetInnerHTML={{ __html: `${translatedResource?.keywords?.content?.replace(/\n/gi, '<br />')}` }}
                >
                  {
                    translatedResource?.keywords?.content?.split(', ').map((keyword, index) => <Chip key={index} content={keyword} />)
                  }
                  {/* {translatedResource?.keywords?.content} */}
                </p></>}
            </div>
          ) : (
            <div className="flex items-center gap-3 mt-10">
              <MetadataSkeleton className="w-full" />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
export default MetadataPanel;
