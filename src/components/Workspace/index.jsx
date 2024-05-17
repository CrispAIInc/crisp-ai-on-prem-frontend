import { createRef, useState, useContext, useRef, useEffect } from "react";
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

const Workspace = () => {
    const {
        currentResource,
        setCurrentResource,
        resourceURL,
        setResourceURL,
        player,
        setIsPlayerReady,
        activeView, setActiveView,
        showNoteDetails,
        theme,
        setIsLeftSidebarOpen,
        setIsRightSidebarOpen,
        isRightSidebarOpen,
        isLeftSidebarOpen,
        jumpToPage,
        selectedNote,
    } = useContext(MainContext);

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
    // function onDocumentLoadSuccess({ numPages }) {
    //     setNumPages(numPages);
    //     setIsPdfLoaded(true);
    // }
    const pageRefs = useRef({});
    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
        setIsPdfLoaded(true);
        // Initialize refs for each page
        // pageRefs.current = Array.from({ length: numPages }, (_, i) => pageRefs.current[i] || createRef());
    };

    // const onItemClick = ({ pageNumber }) =>
    //     pageRefs.current[pageNumber].scrollIntoView({ behavior: 'smooth' });
    useEffect(() => {
        if (isPdfLoaded && jumpToPage.page > 0 && jumpToPage.page <= numPages) {
            // pageRefs.current[jumpToPage - 1].scrollIntoView({ behavior: 'smooth' });
            setTimeout(() => {
                const targetRef = pageRefs.current[jumpToPage.page - 1];
                if (targetRef && targetRef.scrollIntoView) {
                    targetRef.scrollIntoView({ behavior: 'smooth' });
                }
            }, 1500);
        }
    }, [jumpToPage, numPages, isPdfLoaded]);

    // useEffect(() => {
    //     // Scroll to the specific page
    //     if (PdfContainer.current && jumpToPage > 0) {
    //         const container = PdfContainer.current;
    //         const pageHeight = container.scrollHeight / numPages;
    //         const scrollToPosition = (jumpToPage - 1) * pageHeight;

    //         container.scrollTo({
    //             top: scrollToPosition,
    //             behavior: 'smooth', // Smooth scrolling for better user experience
    //         });
    //     }
    // }, [jumpToPage, numPages]);

    return (
        <div className="relative flex-1 h-full px-10 overflow-y-auto media-container bg-background_workspace">
            {/* <div className={`flex items-center justify-between ${currentResource ? 'mb-5' : 'absolute top-0 left-0 w-full'}`}> */}
            {/* left sidebar collapser */}
            <div
                className={`px-2 py-2 rounded-md w-fit absolute left-0 h-full flex flex-col justify-center items-center z-50`}
            >
                <SwapHorizOutlinedIcon className={`cursor-pointer ${theme === 'dark' && 'text-textColor-100'}`} onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
            </div>
            {/* <span className="ml-3">expand</span>
                <span className="mr-3">expand</span> */}
            {/* </div> */}
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
                            <div className='metadata-container'>
                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Summary</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.summary}</p>

                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Topic by Topic Summary</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.topic_summaries}</p>
                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Video Transcript</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.transcript}</p>

                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Key Topics</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.keywords}</p>
                            </div>
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
                                                    // ref={el => { pageRefs.current[index + 1] = el; }}
                                                    // inputRef={el => pageRefs.current[index] = el}
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
                            <div className='metadata-container'>
                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Summary</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.summary}</p>

                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Topic by Topic Summary</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.topic_summaries}</p>
                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>PDF Transcript</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.transcript}</p>

                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Key Topics</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.keywords}</p>
                            </div>
                        </>
                    )}
                    {currentResource.file_type === "img" && (
                        <div className="">
                            <div className="relative w-[70%] h-72 w-full h-full max-w-lg mx-auto">
                                <CancelIcon onClick={closeImage} className="absolute right-[1%] top-[15px] cursor-pointer" />
                                <img className="w-full h-full pt-2 rounded-lg source-img" src={resourceURL} />
                            </div>
                            {/* Image Caption */}
                            <div className='metadata-container'>
                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Caption</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.caption}</p>

                                <h3 className={`mt-4 text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Key Topics</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource.keywords}</p>
                            </div>
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
