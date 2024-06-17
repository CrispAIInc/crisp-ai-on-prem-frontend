import { useState, useContext, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import CancelIcon from "@mui/icons-material/Cancel";
import { MainContext } from "../../contexts/mainContext";

import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';

import NoData from "../NoData";
import NoteDetails from "../NoteDetails";

import './workspace.css';
import StoryDetails from '../StoryDetails';
import CustomSelect from '../CustomSelect';
import makeApiRequest from '../../api';
import LoadingSpinner from '../LoadingSpinner';

const Workspace = () => {
    const {
        currentResource,
        setCurrentResource,
        resourceURL,
        setResourceURL,
        player,
        languageOptions,
        setIsPlayerReady,
        activeView, setActiveView,
        theme,
        setIsLeftSidebarOpen,
        setIsRightSidebarOpen,
        isRightSidebarOpen,
        isLeftSidebarOpen,
        jumpToPage,
        selectedNote,
    } = useContext(MainContext);

    // const translatedResource = useRef(currentResource);
    const [translatedResource, setTranslatedResource] = useState(currentResource);
    const [isTranslationLoading, setIsTranslationLoading] = useState(false);
    const [numPages, setNumPages] = useState();
    const PdfContainer = useRef();

    const closeVideo = (event) => {
        event.preventDefault();
        setCurrentResource(null);
        setResourceURL(null);
        setIsPlayerReady(false);
        setActiveView(() => {
            if (selectedNote.note_id !== '') {
                return 'note';
            }
            return null;
        });
    };

    const closePDF = (event) => {
        event.preventDefault();
        setCurrentResource(null);
        setResourceURL(null);
        setActiveView(() => {
            if (selectedNote.note_id !== '') {
                return 'note';
            }
            return null;
        });
    };

    const closeImage = (event) => {
        event.preventDefault();
        setCurrentResource(null);
        setResourceURL(null);
        setActiveView(() => {
            if (selectedNote.note_id !== '') {
                return 'note';
            }
            return null;
        });
    };

    const [isPdfLoaded, setIsPdfLoaded] = useState(false);
    const pageRefs = useRef({});
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setIsPdfLoaded(true);
    };

    useEffect(() => {
        if (isPdfLoaded && jumpToPage.page > 0 && jumpToPage.page <= numPages) {
            setTimeout(() => {
                const targetRef = pageRefs.current[jumpToPage.page - 1];
                if (targetRef && targetRef.scrollIntoView) {
                    targetRef.scrollIntoView({ behavior: 'smooth' });
                }
            }, 1500);
        }
    }, [jumpToPage, numPages, isPdfLoaded]);

    useEffect(() => {
        if (activeView === 'resource') {
            setTranslatedResource(currentResource);
            if (currentResource) translateMetadata('en', currentResource);
        }
    }, [currentResource]);

    async function translateMetadata(chosenLanguage, object) {
        setIsTranslationLoading(true);
        // make sure response body is also like httpRequestBody (w/o lang)
        // the response body object must contain keys in English
        let httpRequestBody = {
            lang: chosenLanguage,
            summary: {
                title: '',
                content: ''
            },
            topic_summaries: {
                title: '',
                content: ''
            },
            transcript: {
                title: '',
                content: ''
            },
            caption: {
                title: '',
                content: ''
            },
            keywords: {
                title: '',
                content: ''
            },
        };
        const TRANSLATABLE_KEYS = [
            'summary',
            'topic_summaries',
            'transcript',
            'caption',
            'keywords'
        ];
        // extract keys/values from object (summary, topic_summaries, keywords, transcript and caption)
        console.log(object);
        for (const [key, value] of Object.entries(object)) {
            if (TRANSLATABLE_KEYS.includes(key)) {
                httpRequestBody[key].title = key === 'topic_summaries' ? 'Detailed summary' : key.charAt(0).toUpperCase() + key.slice(1);
                httpRequestBody[key].content = typeof value === 'object' ? value.content : value;
            }
        }
        try {
            const httpResponseBody = await makeApiRequest('/translate-metadata', 'post', httpRequestBody);
            setTranslatedResource(httpResponseBody);
        } catch (error) {
            console.log(error);
        } finally {
            setIsTranslationLoading(false);
        }
    }

    return (
        <div className="relative flex-1 h-full px-10 overflow-y-auto media-container bg-background_workspace">
            <div
                className={`px-2 py-2 rounded-md w-fit absolute left-0 h-full flex flex-col justify-center items-center z-50`}
            >
                <SwapHorizOutlinedIcon className={`cursor-pointer ${theme === 'dark' && 'text-textColor-100'}`} onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
            </div>
            {!activeView ? (
                <div className="mt-10">
                    <NoData />
                </div>
            ) : activeView === 'resource' ? (
                <div className="max-w-4xl pt-10 mx-auto">
                    {currentResource.file_type === "video" && (
                        <div className="relative">
                            <CancelIcon onClick={closeVideo} color='error' className="absolute z-50 cursor-pointer right-4 top-2" />
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
                            {!isTranslationLoading ? (<div className='mt-10 metadata-container'>
                                <CustomSelect
                                    title="Language"
                                    defaultValue={languageOptions[0]}
                                    options={languageOptions}
                                    onChange={(chosenLanguage) => translateMetadata(chosenLanguage, translatedResource)}
                                />
                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>{translatedResource?.summary?.title}</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{translatedResource?.summary?.content}</p>

                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>{translatedResource?.topic_summaries?.title}</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{translatedResource?.topic_summaries?.content}</p>

                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>{translatedResource?.transcript?.title}</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{translatedResource?.transcript?.content}</p>

                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>{translatedResource?.keywords?.title}</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{translatedResource?.keywords?.content}</p>
                            </div>) : ((
                                <div className='mt-10 flex items-center gap-3'>
                                    <LoadingSpinner isSmall={true} />
                                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Loading translated metadata...</span>
                                </div>
                            ))}
                        </div>
                    )}
                    {currentResource.file_type === "pdf" && (
                        <>
                            <div className="relative h-[80vh] w-full mx-auto overflow-x-hidden overflow-y-auto" ref={PdfContainer}>
                                <CancelIcon onClick={closePDF} className="absolute right-1 top-[15px] cursor-pointer z-50" />
                                <Document className='!w-full mx-auto' file={resourceURL} onLoadSuccess={onDocumentLoadSuccess} >
                                    {
                                        Array.from(new Array(numPages), (el, index) => (
                                            <div key={`page_${index + 1}`} ref={el => { pageRefs.current[index] = el; }}>
                                                <Page
                                                    _className='mx-auto !w-full !min-w-0'
                                                    className="!w-full mx-auto"

                                                    pageNumber={index + 1}
                                                />
                                            </div>
                                        ))
                                    }
                                </Document>

                            </div>
                            {/* PDF summary */}
                            {!isTranslationLoading ? (<div className='mt-10 metadata-container'>
                                <CustomSelect
                                    title="Language"
                                    defaultValue={languageOptions[0]}
                                    options={languageOptions}
                                    onChange={(chosenLanguage) => translateMetadata(chosenLanguage, translatedResource)}
                                />
                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>{translatedResource?.summary?.title}</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{translatedResource?.summary?.content}</p>

                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>{translatedResource?.topic_summaries?.title}</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{translatedResource?.topic_summaries?.content}</p>

                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>{translatedResource?.transcript?.title}</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{translatedResource?.transcript?.content}</p>

                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>{translatedResource?.keywords?.title}</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{translatedResource?.keywords?.content}</p>
                            </div>) : ((
                                <div className='mt-10 flex items-center gap-3'>
                                    <LoadingSpinner isSmall={true} />
                                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Loading translated metadata...</span>
                                </div>
                            ))}
                        </>
                    )}
                    {currentResource.file_type === "img" && (
                        <div>
                            <div className="relative w-[70%] h-72 w-full h-full max-w-lg mx-auto">
                                <CancelIcon onClick={closeImage} className="absolute right-[1%] top-[15px] cursor-pointer" />
                                <img className="w-full h-full pt-2 rounded-lg source-img" src={resourceURL} />
                            </div>
                            {/* Image Caption */}
                            {!isTranslationLoading
                                ?
                                (
                                    <div className='mt-10 metadata-container'>
                                        <CustomSelect
                                            title="Language"
                                            defaultValue={languageOptions[0]}
                                            options={languageOptions}
                                            onChange={(chosenLanguage) => translateMetadata(chosenLanguage, translatedResource)}
                                        />
                                        <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>{translatedResource?.caption?.title}</h3>
                                        <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{translatedResource?.caption?.content}</p>

                                        <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>{translatedResource?.keywords?.title}</h3>
                                        <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{translatedResource?.keywords?.content}</p>
                                    </div>
                                )
                                :
                                (
                                    <div className='mt-10 flex items-center gap-3'>
                                        <LoadingSpinner isSmall={true} />
                                        <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Loading translated metadata...</span>
                                    </div>
                                )
                            }
                        </div>
                    )}
                </div>
            ) : activeView === 'note' ? (
                <div>
                    <NoteDetails />
                </div>
            ) : activeView === 'story' ? (
                <StoryDetails />
            ) : null}

            {/* right sidebar collapser */}
            <div
                className={`px-2 py-2 rounded-md z-50 w-fit absolute right-0 h-full flex flex-col justify-center items-center top-0`}
            >
                <SwapHorizOutlinedIcon className={`cursor-pointer ${theme === 'dark' && 'text-textColor-100'}`} onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} />
            </div>
        </div>
    );
};

export default Workspace;
