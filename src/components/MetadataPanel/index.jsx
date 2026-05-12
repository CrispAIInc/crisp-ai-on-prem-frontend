import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import { useContext, useEffect, useRef, useState } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import ReactPlayer from "react-player";
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
// import AccessTimeIcon from '@mui/icons-material/AccessTime';

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
    contentPanelContainerRef,
    jumpToPage,
    committedSources,
    activeView,
    theme,
    generatedResources,
    metadataPanelContainer
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

        setTimeout(() => {
          player.current?.seekTo(redirectedTimestamp, "seconds");
        }, 2550); // small delay fixes race condition
      }
    }
  }, [isPlayerReady, currentResource?.timestamp]);

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

  const pageRefs = useRef({});

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

  return (
    <div className="max-w-4xl mx-auto overflow-y-auto" ref={metadataPanelContainer}>

      {currentResource?.file_type === "video" && (
        <>
          <div className="relative ">
            <div className="relative aspect-video w-full overflow-hidden rounded-md !border">
              <ReactPlayer
                id="react-player"
                className="absolute top-0 left-0" // <-- 1. ADD THIS
                width="100%"
                height="100%"                     // <-- 2. CHANGE THIS to 100%
                playing={video_autoplay}
                loop={video_loop}
                url={sourcePublicUrl || resourceURL}
                onReady={() => setIsPlayerReady(true)}
                onDuration={() => setHasDuration(true)}
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
                {/* {currentResource?.metadata?.embeddings_generated && <SearchSection isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />} */}
                <SearchSection fromMetadata={true} isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />
                {/* generate visual/combined summary */}
                {(currentResource?.metadata && Object.keys(currentResource?.metadata).length > 0 && Object.keys(currentResource?.metadata).some(key => key !== "embeddings_generated")) && <div className={`flex flex-wrap items-center mb-2 mt-6 !border w-fit ${theme === 'light' ? "!border !border-textColor-100/70 bg-light-hover-100/30" : "!border !border-textColor-300 bg-light-hover-200/20 text-textColor-100"} rounded-full`}>
                  <LanguageOutlinedIcon className={`${theme === 'light' ? '#333' : '#ABAEB4'} ml-1`} />
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
              className={`relative w-[90%] h-[430px] mx-auto  overflow-y-auto ${theme === " light" ? "!border" : "!border !border-textColor-300"}  overflow-auto rounded-md overflow-x-auto`}
              // ref={workspaceContainer}
              style={{ height: leftWidth === maxWidth ? parentWidth * 1.3 : parentWidth * 1.4 }}
            >
              <Document
                className="!w-full mx-auto relative"
                file={sourcePublicUrl || resourceURL}
                onLoadSuccess={onDocumentLoadSuccess}
              >

                {Array.from(new Array(numPages), (el, index) => (
                  <div
                    key={`page_${index + 1}`}
                    ref={(el) => {
                      pageRefs.current[index] = el;
                    }}
                  >
                    <Page
                      className="mx-auto"
                      pageNumber={index + 1}
                      renderTextLayer={true}
                      renderAnnotationLayer={true}
                      scale={1}
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
                <SearchSection fromMetadata={true} isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />
                {(currentResource?.metadata && Object.keys(currentResource?.metadata).length > 0 && Object.keys(currentResource?.metadata).some(key => key !== "embeddings_generated")) && <div className={`flex flex-wrap items-center mb-10 !border w-fit ${theme === 'light' ? "!border !border-textColor-100/70 bg-light-hover-100/30" : "!border !border-textColor-300 bg-light-hover-200/20 text-textColor-100"} rounded-md`}>
                  <LanguageOutlinedIcon className={`${theme === 'light' ? '#333' : '#ABAEB4'} ml-1`} />
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
            <div className={`relative pt-[56.25%] w-full max-w-lg mx-auto h-80 ${theme === " light" ? "!border" : "!border !border-textColor-300"} rounded-md overflow-hidden`}>
              <GsFile
                className="absolute top-0 left-0 object-contain w-full h-full"
                gsUrl={currentResource?.thumbnail || resourceURL}
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
                {(currentResource?.metadata && Object.keys(currentResource?.metadata).length > 0 && Object.keys(currentResource?.metadata).some(key => key !== "embeddings_generated")) && <div className={`flex flex-wrap items-center mb-10 !border w-fit ${theme === 'light' ? "!border !border-textColor-100/70 bg-light-hover-100/30" : "!border !border-textColor-300 bg-light-hover-200/20 text-textColor-100"} rounded-md`}>
                  <LanguageOutlinedIcon className={`${theme === 'light' ? '#333' : '#ABAEB4'} ml-1`} />
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
