import { useState, useContext } from "react";
import ReactPlayer from "react-player";
import CancelIcon from "@mui/icons-material/Cancel";
import { MainContext } from "../../contexts/mainContext";

import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';

import NoData from "../NoData";

import './workspace.css';

function calculateDivWidth() {
    // Get the screen width
    var screenWidth = window.innerWidth;

    // Calculate the width of the div based on the screen size
    var calculatedWidth = screenWidth * 0.9; // Adjust this percentage as needed

    // Ensure the width doesn't exceed the maximum width
    var maxWidth = 800;
    var finalWidth = Math.min(calculatedWidth, maxWidth);

    return finalWidth;
}

const Workspace = () => {
    const {
        currentResource,
        setCurrentResource,
        resourceURL,
        setResourceURL,
        player,
        setIsPlayerReady,
        summary,
        theme,
        setIsLeftSidebarOpen,
        setIsRightSidebarOpen,
        isRightSidebarOpen,
        isLeftSidebarOpen,
    } = useContext(MainContext);

    const [numPages, setNumPages] = useState();

    const closeVideo = (event) => {
        event.preventDefault();
        setCurrentResource(null);
        setResourceURL(null);
        setIsPlayerReady(false);
    };

    const closePDF = (event) => {
        event.preventDefault();
        setCurrentResource(null);
        setResourceURL(null);
    };

    const closeImage = (event) => {
        event.preventDefault();
        setCurrentResource(null);
        setResourceURL(null);
    };

    function onDocumentLoadSuccess({ numPages }) {
        setNumPages(numPages);
    }

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
            {!currentResource ? (
                <div className="mt-10">
                    <NoData />
                </div>
            ) : (
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
                            <div className='flex flex-col gap-2 px-2 pt-6'>
                                <h3 className={`text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Summary</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{summary}</p>
                            </div>
                        </div>
                    )}
                    {currentResource.file_type === "pdf" && (
                        <div>
                            <div className="relative h-[80vh] w-full mx-auto overflow-x-hidden overflow-y-auto">
                                <CancelIcon onClick={closePDF} className="absolute right-1 top-[15px] cursor-pointer z-50" />
                                <Document className='!w-full mx-auto' file={resourceURL} onLoadSuccess={onDocumentLoadSuccess}>
                                    {Array.from(new Array(numPages), (el, index) => (
                                        <Page
                                            _className='mx-auto !w-full !min-w-0'
                                            className="!w-full mx-auto"
                                            key={`page_${index + 1}`}
                                            pageNumber={index + 1}
                                        />
                                    ))}
                                </Document>

                            </div>
                            {/* PDF summary */}
                            <div className='flex flex-col gap-2 px-2 pt-6'>
                                <h3 className={`text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Summary</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{summary}</p>
                            </div>
                        </div>
                    )}
                    {currentResource.file_type === "img" && (
                        <div className="">
                            <div className="relative w-[70%] h-72 w-full h-full max-w-lg mx-auto">
                                <CancelIcon onClick={closeImage} className="absolute right-[1%] top-[15px] cursor-pointer" />
                                <img className="w-full h-full pt-2 rounded-lg source-img" src={resourceURL} />
                            </div>
                            {/* Image Caption */}
                            <div className='flex flex-col gap-2 px-2 pt-6'>
                                <h3 className={`text-md font-semiBold ${theme === 'light' ? 'text-textColor-300' : 'text-white'}`}>Caption</h3>
                                <p className={`text-sm ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>{currentResource?.caption ?? 'no caption!'}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

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
