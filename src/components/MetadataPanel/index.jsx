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
import useCheckMobileScreen from '../../hooks/useCheckMobileScreen.js';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import HorizontalCard from '../HorizontalCard/index.jsx';
// import AccessTimeIcon from '@mui/icons-material/AccessTime';

const MetadataPanel = ({ workspaceContainer, leftWidth, maxWidth }) => {
  const {
    currentResource,
    setCurrentResource,
    resourceURL,
    chatLoaded,
    setResourceURL,
    sourcesWithExclusive, setSourcesWithExclusive,
    player,
    setIsSourceUncheckedOrClosed,
    languageOptions,
    isPlayerReady,
    setIsPlayerReady,
    contentPanelContainerRef,
    jumpToPage,
    selectedNote,
    setCommittedSources,
    setShowMetadata,
    sourcesTobeCommited,
    setIsFoundationLlm,
    setIsExclusiveChecked,
    displayedSources,
    committedSources,
    activeView,
    theme,
    commitSelectedSources,
    selectedStory,
    categoryOptions,
    setKnowledgeBase,
    setActiveTab,
    generatedResources,
  } = useContext(MainContext);

  const [translatedResource, setTranslatedResource] = useState(generatedResources?.find((item) => item.source_path === currentResource.source_path));
  // const [generatedResource, setGeneratedResource] = useState(null);
  const [isTranslationLoading, setIsTranslationLoading] = useState(false);
  const [numPages, setNumPages] = useState();
  const [isPdfLoaded, setIsPdfLoaded] = useState(false);
  const [chosenLanguage, setChosenLanguage] = useState("en");
  const PdfContainer = useRef();
  const metadataPanelContainer = useRef(null);

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

  const categoryValues = categoryOptions.map((option) => option.value);

  async function updateContent() {
    const data = await makeApiRequest(
      "/content",
      "post",
      JSON.stringify({ categories: categoryOptions.map((option) => option.value) })
    );
    //TODO: whenever you see `sourcesTobeCommited`, change that with selectedSourcesToGen, because we now only work with the selected sources and not all sources in the selected sources section
    let updatedKnowledgeBase = data.map(item => {
      let selected = sourcesTobeCommited.find(s => s.source_path === item.source_path);

      if (selected) {
        return { ...item, is_selected: true };
      } else {
        return item;
      }
    });

    setKnowledgeBase(updatedKnowledgeBase);
  }
  useEffect(() => {
    if (activeView === "resource") {
      // setTranslatedResource(currentResource);
      if (currentResource) {
        console.log("hehehe");
        const updatedResource = {
          ...currentResource,
          ...generatedResources?.find(item => item.source_path === currentResource.source_path)
        };

        // Update the currentResource state
        setCurrentResource(updatedResource);

        // Call translateMetadata with the updated resource

        // updateContent();
        translateMetadata("en", updatedResource);
      }
    }
  }, [currentResource?.source_path, JSON.stringify(generatedResources)]);

  function areAllItemsInSecondArray(arr1, arr2) {
    const pathsSet = new Set(arr2.map(item => item.source_path));
    console.log(pathsSet);

    return arr1.every(item => pathsSet.has(item.source_path));
  }

  const closeVideo = async (event) => {
    event.preventDefault();
    // setCurrentResource(null);
    setResourceURL(null);
    setIsPlayerReady(false);
    setShowMetadata(false);
    // setActiveView(() => {
    //   if (selectedStory.text.length > 0) {
    //     return "story";
    //   }
    //   if (selectedNote.text.length > 1) {
    //     return "note";
    //   }
    //   return null;
    // });
    if (!areSourcesSame(committedSources, sourcesTobeCommited) && committedSources?.length !== 0 &&
      !areAllItemsInSecondArray(committedSources, sourcesTobeCommited)) {
      // console.log("trueeeujl");
      commitSelectedSources(sourcesTobeCommited);
    }
    setIsSourceUncheckedOrClosed(true);
  };

  const closePDF = async (event) => {
    event.preventDefault();
    // setCurrentResource(null);
    setResourceURL(null);
    setShowMetadata(false);
    // setActiveView(() => {
    //   if (selectedStory.text.length > 0) {
    //     return "story";
    //   }
    //   if (selectedNote.text.length > 1) {
    //     return "note";
    //   }
    //   return null;
    // });
    if (!areSourcesSame(committedSources, sourcesTobeCommited) && committedSources?.length !== 0 &&
      !areAllItemsInSecondArray(committedSources, sourcesTobeCommited)) {
      // console.log("trueeeujl");
      commitSelectedSources(sourcesTobeCommited);
    }
    setIsSourceUncheckedOrClosed(true);
  };

  const closeImage = async (event) => {
    event.preventDefault();
    // setCurrentResource(null);
    setResourceURL(null);
    setShowMetadata(false);
    // setActiveView(() => {
    //   if (selectedStory.text.length > 0) {
    //     return "story";
    //   }
    //   if (selectedNote.text.length > 1) {
    //     return "note";
    //   }
    //   return null;
    // });
    if (!areSourcesSame(committedSources, sourcesTobeCommited) && committedSources?.length !== 0 &&
      !areAllItemsInSecondArray(committedSources, sourcesTobeCommited)) {
      // console.log("trueeeujl");
      commitSelectedSources(sourcesTobeCommited);
    }
    setIsSourceUncheckedOrClosed(true);
  };

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsPdfLoaded(true);
  };

  const pageRefs = useRef({});

  async function translateMetadata(_chosenLanguage, object) {
    updateContent();
    let prevLang = chosenLanguage;
    setChosenLanguage(_chosenLanguage);
    setIsTranslationLoading(true);
    // make sure response body is also like httpRequestBody (w/o lang)
    // the response body object must contain keys in English
    let httpRequestBody = {
      lang: _chosenLanguage,
      prevLang,
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

    // console.log("jsldfjkdf");
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
      // console.log("httpResponseBody: ", httpResponseBody);
      setTranslatedResource({ ...httpResponseBody, lang: _chosenLanguage, prevLang });
      // console.log(knowledgeBase?.find(item => item.source_path === currentResource.source_path));

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
  const showMoreChapters = () => {
    setVisibleChaptersCount((prevCount) => prevCount + 3);
  };

  useEffect(() => {
    return () => {
      setSourcesWithExclusive(prev => prev?.filter(item => item !== currentResource?.source_path));
    };
  }, [currentResource]);

  const isMobile = useCheckMobileScreen();


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

  async function handleToggle(checked) {
    setIsChecked(checked);
    // setCurrentResource(prev => ({ ...prev, is_selected: !prev.is_selected }));
    // handleCheckboxChange(checked, currentResource);
    if (checked) {
      // console.log("checked 1");
      setActiveTab('genInsights');
      commitSelectedSources([currentResource]);
      // setCommittedSources([currentResource]);
      setIsExclusiveChecked(true);
      setSourcesWithExclusive(prev => [...prev, currentResource?.source_path]);
      // setIsSourceUncheckedOrClosed(false)
    } else {
      // console.log("checked 2");
      // commitSelectedSources(sourcesTobeCommited.filter(source => source?.metadata?.embeddings_generated));
      setSourcesWithExclusive(prev => prev?.filter(item => item !== currentResource?.source_path));
      if (!areSourcesSame(committedSources, sourcesTobeCommited) && committedSources?.length !== 0 &&
        !areAllItemsInSecondArray(committedSources, sourcesTobeCommited)) {
        // console.log("trueeeujl");
        commitSelectedSources(sourcesTobeCommited);
        setCommittedSources(sourcesTobeCommited);
      }

      if (committedSources?.length === 0 || (displayedSources?.some(item => item?.is_selected) ? false : true)) {
        setIsFoundationLlm(true);
      }

      setIsFoundationLlm(displayedSources?.some(item => item?.is_selected) ? false : true);
    }
  }

  const [parentWidth, setParentWidth] = useState(0);

  useEffect(() => {
    if (metadataPanelContainer.current) {
      setParentWidth(metadataPanelContainer.current.offsetWidth);
    }
  }, []);

  return (
    <div className="max-w-4xl pt-10 mx-auto overflow-y-auto" ref={metadataPanelContainer}>

      {/* {currentResource?.metadata?.embeddings_generated && <FormControlLabel control={<Checkbox sx={{
        color: lightBlue[800],
        '&.Mui-checked': {
          color: lightBlue[600],
        },
        borderColor: 'pink',
        borderTopColor: pink[400],
      }} />} checked={isChecked} onChange={e => handleToggle(e.target.checked)} label="Exclusive source for Crisp Wiz" />} */}


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
                playing={false}
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
                {/* {currentResource?.metadata?.embeddings_generated && <SearchSection isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />} */}
                <SearchSection fromMetadata={true} isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />
                {/* generate visual/combined summary */}
                {(currentResource?.metadata && Object.keys(currentResource?.metadata).length > 0 && Object.keys(currentResource?.metadata).some(key => key !== "embeddings_generated")) && <div className={`flex flex-wrap items-center mb-2 mt-6 !border w-fit ${theme === 'light' ? "!border !border-textColor-100/70 bg-light-hover-100/30" : "!border !border-textColor-300 bg-light-hover-200/20 text-textColor-100"} rounded-full`}>
                  <LanguageOutlinedIcon className={`${theme === 'light' ? '#333' : '#ABAEB4'} ml-1`} />
                  <CustomSelectTwo
                    withIcon
                    options={languageOptions}
                    onChange={(lang) =>
                      translateMetadata(lang.value, translatedResource)
                    }
                    placeholder="Select a language"
                    className="!border-none"
                  />
                </div>}
                <>
                  {translatedResource?.transcription?.content !== undefined && <>
                    <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.transcription?.title}>
                      <p
                        className={`text-md ${theme === "light"
                          ? "text-textColor-300"
                          : "text-textColor-100"
                          }`}

                      // dangerouslySetInnerHTML={{ __html: `${translatedResource?.transcription?.content?.replace(/\n/gi, '<br />')}` }}
                      >
                        <div className="flex flex-col gap-3">
                          {
                            Array.isArray(translatedResource?.transcription?.content) && translatedResource?.transcription?.content?.map((topic, index) => (
                              <div key={index} className="flex flex-col">
                                <div>
                                  {/* <h4 className='text-[16px] font-semibold '>{topic.speaker?.toLowerCase()}: </h4> */}
                                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                                    setCurrentResource(prev => ({ ...prev, timestamp: topic.start_time }));
                                    contentPanelContainerRef?.current.scrollTo({
                                      top: 0,
                                      behavior: "smooth", // Enables smooth scrolling
                                    });
                                  }}>
                                    {/* <AccessTimeIcon size="8px" className="text-[8px]" /> */}
                                    <h6 className='mb-0 text-xs font-semibold text-primary-200 '>{topic.start_time} - {topic.end_time}</h6>
                                  </div>
                                </div>
                                <p className="select-text">{topic.content}</p>
                              </div>
                            ))
                          }
                        </div>
                      </p>
                    </Accordion>
                  </>}
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

                  {/* {translatedResource?.topic_summaries?.content !== undefined &&
                    <>
                      <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.topic_summaries?.title}>
                        <p
                          className={`text-md ${theme === "light"
                            ? "text-textColor-300"
                            : "text-textColor-100"
                            }`}
                          dangerouslySetInnerHTML={{ __html: `${translatedResource?.topic_summaries?.content?.replace(/\n/gi, '<br />')}` }}
                        ></p>
                      </Accordion>
                    </>} */}
                </>

                {/* {currentResource.source_path != "Sacred_Valley___PERU.mp4" && ( */}
                {translatedResource?.chapters?.content !== undefined && <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.chapters?.title}>
                  {/* {isMobile ? ( */}
                  <TimelineHorizontal workspaceContainer={workspaceContainer} theme={theme} chapters={translatedResource?.chapters?.content} />
                  {/* ) : (
                    <>
                      <Timeline workspaceContainer={workspaceContainer} theme={theme} chapters={translatedResource?.chapters?.content?.slice(0, visibleChaptersCount)} />
                      {translatedResource?.chapters?.content?.slice(0, visibleChaptersCount).length < translatedResource?.chapters?.content?.length && <p className='flex flex-col items-center justify-center p-2 mx-auto mt-3 text-lg font-semibold text-white rounded-full cursor-pointer w-9 h-9 bg-primary-300' onClick={showMoreChapters}>+</p>}
                    </>
                  )} */}
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
                      {/* {translatedResource?.keywords?.content} */}
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
            <CancelIcon
              onClick={closePDF}
              className="sticky top-0 z-50 shadow-lg cursor-pointer left-full"
              color='error'
            />
            <div
              className="relative w-[90%] mx-auto  overflow-y-auto shadow-[0px_0px_38px_-2px_rgba(82,79,79,0.6)]  overflow-auto rounded-md overflow-x-auto"
              ref={contentPanelContainerRef}
              style={{ height: leftWidth === maxWidth ? parentWidth * 1.3 : parentWidth * 1.4 }}
            // style={{ height: '370px', overflow: 'auto' }}
            >
              <Document
                className="!w-full mx-auto relative"
                file={resourceURL}

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
                {/* {currentResource?.metadata?.embeddings_generated && <SearchSection isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />} */}
                <SearchSection fromMetadata={true} isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />
                {(currentResource?.metadata && Object.keys(currentResource?.metadata).length > 0 && Object.keys(currentResource?.metadata).some(key => key !== "embeddings_generated")) && <div className={`flex flex-wrap items-center mb-10 !border w-fit ${theme === 'light' ? "!border !border-textColor-100/70 bg-light-hover-100/30" : "!border !border-textColor-300 bg-light-hover-200/20 text-textColor-100"} rounded-md`}>
                  <LanguageOutlinedIcon className={`${theme === 'light' ? '#333' : '#ABAEB4'} ml-1`} />
                  <CustomSelectTwo
                    withIcon
                    options={languageOptions}
                    onChange={(lang) =>
                      translateMetadata(lang.value, translatedResource)
                    }
                    placeholder="Select a language"
                    className="!border-none"
                  />
                </div>}

                {/* {translatedResource?.transcription?.content !== undefined && <>
                  <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.transcription?.title}>
                    <p
                      className={`text-md ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}

                      dangerouslySetInnerHTML={{ __html: `${translatedResource?.transcription?.content?.replace(/\n/gi, '<br />')}` }}
                    >
                    </p>
                  </Accordion>
                </>} */}
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
                  {/* ) : (
                    <>
                      <Timeline workspaceContainer={workspaceContainer} theme={theme} chapters={translatedResource?.chapters?.content?.slice(0, visibleChaptersCount)} />
                      {translatedResource?.chapters?.content?.slice(0, visibleChaptersCount).length < translatedResource?.chapters?.content?.length && <p className='flex flex-col items-center justify-center p-2 mx-auto mt-3 text-lg font-semibold text-white rounded-full cursor-pointer w-9 h-9 bg-primary-300' onClick={showMoreChapters}>+</p>}
                    </>
                  )} */}
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
                      {/* {translatedResource?.keywords?.content} */}
                    </p>
                  </Accordion>
                </>}




                {translatedResource?.faqs?.content !== undefined && <div className="mt-5 mb-5">
                  <Faqs chosenLanguage={chosenLanguage} heading={translatedResource?.faqs?.title} faqs={translatedResource?.faqs?.content} />
                </div>}

                {/* {translatedResource?.transcription?.content !== undefined && <>
                  <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.transcription?.title}>
                    <p
                      className={`text-md ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}

                      dangerouslySetInnerHTML={{ __html: `${translatedResource?.transcription?.content?.replace(/\n/gi, '<br />')}` }}
                    ></p>
                  </Accordion>
                </>} */}
                {/* 
                {translatedResource?.keywords?.content !== undefined && (<>
                  <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.keywords?.title}>
                    <p
                      className={`flex items-center gap-2 flex-wrap`}
                    >
                      {
                        translatedResource?.keywords?.content?.map(({ id, keyword }) => <Chip key={id} content={keyword} />)
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
                className="absolute right-[1%] top-[15px] z-10 cursor-pointer shadow-lg "
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
                {/* {currentResource?.metadata?.embeddings_generated && <SearchSection isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />} */}
                <SearchSection fromMetadata={true} isGlobalSearch={false} chatLoaded={chatLoaded} className='flex-1' />
                {(currentResource?.metadata && Object.keys(currentResource?.metadata).length > 0 && Object.keys(currentResource?.metadata).some(key => key !== "embeddings_generated")) && <div className={`flex flex-wrap items-center mb-10 !border w-fit ${theme === 'light' ? "!border !border-textColor-100/70 bg-light-hover-100/30" : "!border !border-textColor-300 bg-light-hover-200/20 text-textColor-100"} rounded-md`}>
                  <LanguageOutlinedIcon className={`${theme === 'light' ? '#333' : '#ABAEB4'} ml-1`} />
                  <CustomSelectTwo
                    withIcon
                    options={languageOptions}
                    onChange={(lang) =>
                      translateMetadata(lang.value, translatedResource)
                    }
                    placeholder="Select a language"
                    className="!border-none"
                  />
                </div>}
                {translatedResource?.summary?.content !== undefined && <>
                  <Accordion chosenLanguage={chosenLanguage} heading={translatedResource?.summary?.title} >
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
                      {/* {translatedResource?.metadata?.keywords?.content} */}
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
