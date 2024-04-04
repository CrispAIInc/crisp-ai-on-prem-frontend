import React, { useState, useContext } from "react";
import ReactPlayer from "react-player";
import CancelIcon from "@mui/icons-material/Cancel";
import "./workspace.css";
import { MainContext } from "../../contexts/mainContext";

import { Document, Page } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

import NoData from "../NoData";

const Workspace = () => {
    const {
        currentResource,
        setCurrentResource,
        resourceURL,
        setResourceURL,
        player,
        setIsPlayerReady,
        summary
    } = useContext(MainContext);

    const [pageNumber, setPageNumber] = useState(1); // The page number where is the references. Comes from search results.
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
        <div className="h-full px-3 media-container position-relative">
            {!currentResource ? (
                <div className="pt-10">
                    <NoData />
                </div>
            ) : (
                <>
                    {currentResource.file_type === "video" && (
                        <div className="video-container">
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
                                <h3 className="text-md text-textColor-300 font-semiBold">Summary</h3>
                                <p className="text-sm text-textColor-300">{summary}</p>
                            </div>
                        </div>
                    )}
                    {currentResource.file_type === "pdf" && (
                        <div>
                            <div className="relative pdf-container h-[80vh] overflow-y-auto">
                                <CancelIcon onClick={closePDF} className="absolute right-1 top-[15px] cursor-pointer z-50" />
                                <Document className='mx-auto' file={resourceURL} onLoadSuccess={onDocumentLoadSuccess}>
                                    {Array.from(new Array(numPages), (el, index) => (
                                        <Page
                                            _className='mx-auto'
                                            className="mx-auto"
                                            key={`page_${index + 1}`}
                                            pageNumber={index + 1}
                                        />
                                    ))}
                                </Document>

                            </div>
                            {/* PDF summary */}
                            <div className='flex flex-col gap-2 px-2 pt-6'>
                                <h3 className="text-md text-textColor-300 font-semiBold">Summary</h3>
                                <p className="text-sm text-textColor-300">{summary}</p>
                            </div>
                        </div>
                    )}
                    {currentResource.file_type === "img" && (
                        <div className="relative">
                            <CancelIcon onClick={closeImage} className="absolute right-[17%] top-[15px] cursor-pointer" />
                            <img className="source-img w-[70%] h-72 mx-auto pt-2 rounded-lg" src={resourceURL} />
                            {/* Image Caption */}
                            <div className='flex flex-col gap-2 px-2 pt-6'>
                                <h3 className="text-md text-textColor-300 font-semiBold">Caption</h3>
                                <p className="text-sm text-textColor-300">{currentResource?.caption ?? 'no caption!'}</p>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default Workspace;
