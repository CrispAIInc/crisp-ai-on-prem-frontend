import { useContext, useRef, useState, useEffect } from "react";
import { MainContext } from "../../contexts/mainContext.js";
import makeApiRequest from "../../api";
import ReactPlayer from "react-player";
import CancelIcon from "@mui/icons-material/Cancel";
import { Document, Page } from "react-pdf";
import CustomSelect from "../CustomSelect";
import LoadingSpinner from "../LoadingSpinner";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import CustomSelectTwo from '../CustomSelectTwo';

const MetadataPanel = () => {
    const {
        currentResource,
        setCurrentResource,
        resourceURL,
        setResourceURL,
        player,
        languageOptions,
        setIsPlayerReady,
        setActiveView,
        jumpToPage,
        selectedNote,
        activeView,
        theme,
    } = useContext(MainContext);
    const [translatedResource, setTranslatedResource] = useState(currentResource);
    const [isTranslationLoading, setIsTranslationLoading] = useState(false);
    const [numPages, setNumPages] = useState();
    const [isPdfLoaded, setIsPdfLoaded] = useState(false);
    const [chosenLanguage, setChosenLanguage] = useState('en');
    const PdfContainer = useRef();

    let currentResourceType = currentResource.file_type;

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
    }, [currentResource]);

    const closeVideo = (event) => {
        event.preventDefault();
        setCurrentResource(null);
        setResourceURL(null);
        setIsPlayerReady(false);
        setActiveView(() => {
            if (selectedNote.note_id !== "") {
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
            if (selectedNote.note_id !== "") {
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
            if (selectedNote.note_id !== "") {
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
            "topic_summaries",
            "transcript",
            "caption",
            "keywords",
        ];
        // extract keys/values from object (summary, topic_summaries, keywords, transcript and caption)
        for (const [key, value] of Object.entries(object)) {
            if (TRANSLATABLE_KEYS.includes(key) && (key !== 'transcript' || currentResourceType !== 'pdf')) {
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

    return (
        <div className="max-w-4xl pt-10 mx-auto">
            {currentResource.file_type === "video" && (
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
                        <div className={`mt-10 metadata-container ${chosenLanguage === 'ar' || chosenLanguage === 'ku' || chosenLanguage === 'ckb' || chosenLanguage === 'iw' || chosenLanguage === "ur" && 'text-right'}`}>
                            <CustomSelectTwo
                                options={languageOptions}
                                onChange={(lang) => translateMetadata(lang.value, translatedResource)}
                                placeholder="Select a language"
                            />
                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.summary?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.summary?.content}
                            </p>

                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.topic_summaries?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.topic_summaries?.content}
                            </p>

                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.transcript?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.transcript?.content}
                            </p>

                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.keywords?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.keywords?.content}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 mt-10">
                            <LoadingSpinner isSmall={true} />
                            <span
                                className={`font-medium ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                Loading translated metadata...
                            </span>
                        </div>
                    )}
                </div>
            )}
            {currentResource.file_type === "pdf" && (
                <>
                    <div
                        className="relative h-[60vh] w-full mx-auto overflow-x-hidden overflow-y-auto"
                        ref={PdfContainer}
                    >
                        <CancelIcon
                            onClick={closePDF}
                            className="absolute right-1 top-[15px] cursor-pointer z-50"
                        />
                        <Document
                            className="!w-full mx-auto"
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
                                        _className="mx-auto !w-full !min-w-0"
                                        className="!w-full mx-auto"
                                        pageNumber={index + 1}
                                    />
                                </div>
                            ))}
                        </Document>
                    </div>
                    {/* PDF summary */}
                    {!isTranslationLoading ? (
                        <div className={`mt-10 metadata-container ${chosenLanguage === 'ar' || chosenLanguage === 'ku' || chosenLanguage === 'ckb' || chosenLanguage === 'iw' || chosenLanguage === "ur" && 'text-right'}`}>
                            <CustomSelectTwo
                                options={languageOptions}
                                onChange={(lang) => translateMetadata(lang.value, translatedResource)}
                                placeholder="Select a language"
                            />
                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.summary?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.summary?.content}
                            </p>

                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.topic_summaries?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.topic_summaries?.content}
                            </p>

                            {/* <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.transcript?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.transcript?.content}
                            </p> */}

                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.keywords?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.keywords?.content}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 mt-10">
                            <LoadingSpinner isSmall={true} />
                            <span
                                className={`font-medium ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                Loading translated metadata...
                            </span>
                        </div>
                    )}
                </>
            )}
            {currentResource.file_type === "img" && (
                <div>
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
                        <div className={`mt-10 metadata-container ${chosenLanguage === 'ar' || chosenLanguage === 'ku' || chosenLanguage === 'ckb' || chosenLanguage === 'iw' || chosenLanguage === "ur" && 'text-right'}`}>
                            <CustomSelectTwo
                                options={languageOptions}
                                onChange={(lang) => translateMetadata(lang.value, translatedResource)}
                                placeholder="Select a language"
                            />
                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.caption?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.caption?.content}
                            </p>

                            <h3
                                className={`mt-4 text-md font-semiBold ${theme === "light" ? "text-textColor-300" : "text-white"
                                    }`}
                            >
                                {translatedResource?.keywords?.title}
                            </h3>
                            <p
                                className={`text-sm ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                {translatedResource?.keywords?.content}
                            </p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 mt-10">
                            <LoadingSpinner isSmall={true} />
                            <span
                                className={`font-medium ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                Loading translated metadata...
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
export default MetadataPanel;
