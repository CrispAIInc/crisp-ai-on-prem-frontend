import { useContext, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import LoadingSpinner from "../LoadingSpinner";
import Checkbox from "@mui/material/Checkbox";

import { MainContext } from "../../contexts/mainContext.jsx";

import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import GsFile from '../GsFile/index.jsx';
import Chip from '../Chip';
import BaseHeading from '../BaseHeading/index.jsx';
import useReferenceLinkClick from '../../hooks/useReferenceLinkClick.js';

export function SearchModal(props) {
    const { discoveredSources, knowledgeBase, theme, handleCheckboxChange, onThumbnailClick } = useContext(MainContext);
    const { handleSourceLinkClick } = useReferenceLinkClick();

    const handleClose = () => {
        props.onHide();
    };

    /**
     * {
            mainSource: {
               source_path,
               timestamp | page,
               file_type,
               ...
            },
            additionalSources: [
              {
                source_path,
                timestamp | page
              }
            ]
     * }
     */

    // console.log(discoveredSources);

    // Function to filter knowledgeBase items whose source paths exist in additionalSources and add timestamp or page to the item
    // const additionalSourcesSourcePaths = discoveredSources?.additionalSources?.map(source => source.source_path) || [];

    const [filteredKnowledgeBase, setFilteredKnowledgeBase] = useState([
        discoveredSources.mainSource,
        ...discoveredSources.additionalSources.map(source => {
            const s = knowledgeBase.find(item => item.source_path === source.source_path);
            if (!s) return null;
            return {
                ...s,
                timestamp: source?.timestamp,
                page: Number(source?.page)
            };
        })]);

    useEffect(() => {
        setFilteredKnowledgeBase([
            discoveredSources.mainSource,
            ...discoveredSources.additionalSources.map(source => {
                const s = knowledgeBase.find(item => item.source_path === source.source_path);
                if (!s) return null;
                return {
                    ...s,
                    timestamp: source?.timestamp,
                    page: Number(source?.page)
                };
            })
        ]);

        handleSourceLinkClick(event, { ...discoveredSources.mainSource });
    }, [discoveredSources, knowledgeBase]);

    // const filteredKnowledgeBase = [
    //     discoveredSources.mainSource,
    //     ...discoveredSources.additionalSources.map(source => {
    //         const s = knowledgeBase.find(item => item.source_path === source.source_path);
    //         if (!s) return null;
    //         return {
    //             ...s,
    //             timestamp: source?.timestamp,
    //             page: Number(source?.page)
    //         };
    //     })
    // ...additionalSourcesSourcePaths.flatMap(sourcePath => {
    //     const item = knowledgeBase.find(
    //         kb => kb.source_path === sourcePath
    //     );

    //     if (!item) return [];

    //     const additionalSource = discoveredSources.additionalSources.find(
    //         source => source.source_path === sourcePath
    //     );

    //     return [{
    //         ...item,
    //         timestamp: additionalSource?.timestamp,
    //         page: additionalSource?.page
    //     }];
    // })
    // ];

    // console.log("filteredKb: ", filteredKnowledgeBase);


    return (
        <>
            <Modal
                show={props.show}
                onHide={handleClose}
                size="md"
                aria-labelledby="contained-modal-title-vcenter"
                scrollable={true}
                centered
                className="search-results-modal"
            >
                <Modal.Header closeButton className={`${theme === "light"
                    ? ""
                    : "bg-textColor-300 text-white !border-b-textColor-200"
                    }`}>
                    <Modal.Title id="contained-modal-title-vcenter">
                        Search Results
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={`${theme === "light" ? "" : "bg-textColor-300 text-white"}`}>
                    <div className="flex flex-col gap-1">

                        {/* main source */}
                        <BaseHeading text="Main results" cssClasses="text-lg" />
                        {/* {filteredKnowledgeBase[0].map((item, index) => ( */}
                        <div className={`flex items-center gap-2 w-full max-w-full cursor-pointer p-2 ${theme === 'light' ? 'hover:bg-light-hover-100/70' : 'hover:bg-light-hover-200/20'} hover:rounded-lg`} onClick={(event) => onThumbnailClick(event, discoveredSources.mainSource)}>
                            {
                                discoveredSources.mainSource?.file_type === "video" ? (
                                    <PlayCircleOutlineOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                ) : discoveredSources.mainSource?.file_type === "pdf" ? (
                                    <ArticleOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                ) : discoveredSources.mainSource?.file_type === "img" ? (
                                    <ImageOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                ) : null
                            }
                            <div className="relative flex-shrink-0 w-10 h-10">
                                {(props.isDeleting && props.clickedIndex === 0) && (
                                    <div>
                                        <LoadingSpinner />
                                    </div>
                                )}
                                {(discoveredSources.mainSource?.thumbnail?.startsWith('blob') && discoveredSources.mainSource?.file_type === "video") ? (
                                    <video
                                        src={discoveredSources.mainSource?.thumbnail}
                                        className="object-cover w-full h-full rounded-md"
                                        alt="video thumbnail"
                                        controls={false}
                                    />
                                )
                                    :
                                    <GsFile
                                        className="object-cover w-full h-full rounded-md"
                                        gsUrl={discoveredSources.mainSource?.thumbnail}
                                        alt="Video Thumbnail"
                                    />

                                }
                            </div>
                            <div className="flex flex-col self-start flex-1">
                                <p className={`text-md font-medium break-all m-0 ${theme === 'dark' && 'text-textColor-100'}`}> {discoveredSources.mainSource?.source_path?.replace(/\.[^/.]+$/, '')}
                                </p>
                                <div className="flex items-center gap-1">
                                    {
                                        discoveredSources.mainSource?.category?.map((cat, index) => (
                                            <Chip key={`${cat}-${index}`} className="italic" content={cat} />
                                        ))
                                    }
                                    {
                                        (discoveredSources.mainSource?.file_type !== 'img') && (
                                            <FiberManualRecordIcon className="!text-[6px]" />
                                        )
                                    }
                                    <p className={`text-sm m-0 ${theme === 'dark' && 'text-textColor-100'}`}>{discoveredSources.mainSource?.file_type === 'img' ? '' : discoveredSources.mainSource?.timestamp ? discoveredSources.mainSource?.timestamp : discoveredSources.mainSource?.page ? discoveredSources.mainSource?.page : ''}</p>
                                    {
                                        discoveredSources.mainSource?.score && (
                                            <>
                                                <FiberManualRecordIcon className="!text-[6px]" />
                                                <BaseHeading text={`${discoveredSources.mainSource?.score * 100}% score`} />
                                            </>
                                        )
                                    }
                                </div>
                            </div>
                            <div className="flex items-center ">
                                <Checkbox
                                    className={`p-0 !ml-1 !border-primary-300 !text-primary-300`}
                                    checked={discoveredSources.mainSource?.is_checked}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => { e.stopPropagation(); handleCheckboxChange(e?.target?.checked, discoveredSources.mainSource); }}
                                    inputProps={{ "aria-label": "Select source" }}
                                />
                            </div>
                        </div>
                        {/* ))} */}

                        {/* additional sources */}
                        <BaseHeading text="Additional results" cssClasses="text-lg" />
                        {filteredKnowledgeBase.slice(1).map((item, index) => (
                            <div key={item?.source_path} className={`flex items-center gap-2 w-full max-w-full cursor-pointer p-2 ${theme === 'light' ? 'hover:bg-light-hover-100/70' : 'hover:bg-light-hover-200/20'} hover:rounded-lg`} onClick={(event) => onThumbnailClick(event, item)}>
                                {
                                    item?.file_type === "video" ? (
                                        <PlayCircleOutlineOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                    ) : item?.file_type === "pdf" ? (
                                        <ArticleOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                    ) : item?.file_type === "img" ? (
                                        <ImageOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                    ) : null
                                }
                                <div className="relative flex-shrink-0 w-10 h-10">
                                    {(props.isDeleting && props.clickedIndex === index) && (
                                        <div>
                                            <LoadingSpinner />
                                        </div>
                                    )}
                                    {(item?.thumbnail?.startsWith('blob') && item?.file_type === "video") ? (
                                        <video
                                            src={item?.thumbnail}
                                            className="object-cover w-full h-full rounded-md"
                                            alt="video thumbnail"
                                            controls={false}
                                        />
                                    )
                                        :
                                        <GsFile
                                            className="object-cover w-full h-full rounded-md"
                                            gsUrl={item?.thumbnail}
                                            alt="Video Thumbnail"
                                        />

                                    }
                                </div>
                                <div className="flex flex-col self-start flex-1">
                                    <p className={`text-md font-medium break-all m-0 ${theme === 'dark' && 'text-textColor-100'}`}>{item?.source_path?.replace(/\.[^/.]+$/, '')}</p>
                                    <div className="flex items-center gap-1">
                                        {
                                            item?.category?.map((cat, index) => (
                                                <Chip key={`${cat}-${index}`} className="italic" content={cat} />
                                            ))
                                        }
                                        {
                                            (item?.file_type !== 'img') && (
                                                <FiberManualRecordIcon className="!text-[6px]" />
                                            )
                                        }
                                        <p className={`text-sm m-0 ${theme === 'dark' && 'text-textColor-100'}`}>{item?.file_type === 'img' ? '' : item?.timestamp ? item?.timestamp : item?.page ? item?.page : ''}</p>
                                        {
                                            item?.score && (
                                                <>
                                                    <FiberManualRecordIcon className="!text-[6px]" />
                                                    <BaseHeading text={`${item?.score * 100}% score`} />
                                                </>
                                            )
                                        }
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Checkbox
                                        className={`p-0 !ml-1 !border-primary-300 !text-primary-300`}
                                        checked={item?.is_checked}
                                        onClick={(e) => e.stopPropagation()}
                                        onChange={(e) => { e.stopPropagation(); handleCheckboxChange(e?.target?.checked, item); }}
                                        inputProps={{ "aria-label": "Select source" }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Modal.Body>
                <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                    <div
                        className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                        onClick={props.onHide}
                    >
                        <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Ok</span>
                    </div>
                </Modal.Footer>
            </Modal >
        </>
    );
}

export default SearchModal;
