import { useContext, useRef, useState, useEffect } from "react";
import CopilotSection from "../CopilotSection";
import { MainContext } from "../../contexts/mainContext.js";
import makeApiRequest from "../../api/index.js";
import ReactPlayer from "react-player";
import CancelIcon from "@mui/icons-material/Cancel";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import CustomSelectTwo from "../CustomSelectTwo/index.jsx";
import { flattenMetadata, timeToSeconds } from '../../utils.js';
import Chip from '../Chip/index.jsx';
import MetadataSkeleton from '../Skeletons/MetadataSkeleton/index.jsx';
import SearchSection from '../SearchSection/index.jsx';
import Faqs from '../Faqs/index.jsx';
import Accordion from '../Accordion/index.jsx';
import TimelineHorizontal from '../TimelineHorizontal/index.jsx';
import Timeline from '../Timeline/index.jsx';
import useCheckMobileScreen from '../../hooks/useCheckMobileScreen.js';
import HorizontalCard from '../HorizontalCard/index.jsx';
// import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { Checkbox, FormControlLabel } from '@mui/material';
import { lightBlue, pink } from '@mui/material/colors';
import { useResizableSidebar } from '../../hooks/useResizableSidebar.js';
import TextSkeleton from '../Skeletons/Base/TextSkeleton.jsx';

const MetadataPanel = ({ workspaceContainer }) => {
    const {
        currentResource,
        setCurrentResource,
        resourceURL,
        chatLoaded, setChatLoaded,
        setResourceURL,
        sourcesWithExclusive, setSourcesWithExclusive,
        player,
        setIsSourceUncheckedOrClosed,
        languageOptions,
        isPlayerReady,
        setIsPlayerReady,
        setActiveView,
        jumpToPage,
        selectedNote,
        setCommittedSources,
        sourcesTobeCommited,
        setIsFoundationLlm,
        setIsExclusiveChecked,
        displayedSources,
        committedSources,
        activeView,
        theme,
        commitSelectedSources,
        selectedStory,
        setActiveTab,
        generatedResources,
    } = useContext(MainContext);

    const { sidebarWidth } = useResizableSidebar(200, false);

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
        if (!areSourcesSame(committedSources, sourcesTobeCommited) && committedSources?.length !== 0 &&
            !areAllItemsInSecondArray(committedSources, sourcesTobeCommited)) {
            // console.log("trueeeujl");
            commitSelectedSources(sourcesTobeCommited);
        }
        setIsSourceUncheckedOrClosed(true);
    };

    const closePDF = async (event) => {
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
        if (!areSourcesSame(committedSources, sourcesTobeCommited) && committedSources?.length !== 0 &&
            !areAllItemsInSecondArray(committedSources, sourcesTobeCommited)) {
            // console.log("trueeeujl");
            commitSelectedSources(sourcesTobeCommited);
        }
        setIsSourceUncheckedOrClosed(true);
    };

    const closeImage = async (event) => {
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
        console.log(obj);
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
            console.log(object);
            const httpResponseBody = await makeApiRequest(
                "/translate-metadata",
                "post",
                httpRequestBody
            );
            // console.log("httpResponseBody: ", httpResponseBody);
            setTranslatedResource({ ...httpResponseBody, lang: chosenLanguage });
            // console.log(knowledgeBase?.find(item => item.source_path === currentResource.source_path));

        } catch (error) {
            console.log(error);
        } finally {
            setIsTranslationLoading(false);
            console.log(translatedResource);
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
        // handleCheckboxChange(currentResource);
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

    return (
        <div className="flex flex-col max-w-4xl pt-10 mx-auto overflow-y-auto" ref={metadataPanelContainer}>
            <div>
                <div className={`mb-4 ${theme === "light"
                    ? "text-textColor-300"
                    : "text-textColor-100"
                    }`}>
                    <h2 className="text-3xl font-semibold break-words">
                        {/* {currentResource?.source_path.replace(/\.[^/.]+$/, '')} */}
                        Source Summary
                    </h2>
                    <span>{displayedSources?.length} Source{displayedSources?.length > 1 ? "s" : ""}</span>
                </div>
                {translatedResource?.summary?.content !== undefined ? <p
                    className={`text-md ${theme === "light"
                        ? "text-textColor-300"
                        : "text-textColor-100"
                        }`}
                    dangerouslySetInnerHTML={{ __html: `<p>${translatedResource?.summary?.content?.replace(/\n/gi, '<br />')}</p>` }}
                ></p> : (
                    <div className="animate-pulse">
                        {new Array(10).fill(null).map((_, index) => (
                            <TextSkeleton key={index} className='h-3 mb-2' />
                        ))}
                    </div>
                )}
            </div>

            <div className="flex-1 mt-10 overflow-y-auto">
                <CopilotSection chatLoaded={chatLoaded} setChatLoaded={setChatLoaded} sidebarWidth={sidebarWidth} key={0} name="genInsights" />
            </div>
        </div >
    );
};
export default MetadataPanel;
