import { useContext, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import LoadingSpinner from "../LoadingSpinner";
import Checkbox from "@mui/material/Checkbox";

import { MainContext } from "../../contexts/mainContext.jsx";

import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Search } from 'lucide-react';
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
                page: Number(source?.page),
                score: source?.score
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
                    page: Number(source?.page),
                    score: source?.score
                };
            })
        ]);

        if (discoveredSources.mainSource) {
            handleSourceLinkClick(event, { ...discoveredSources.mainSource });
        }
    }, [discoveredSources, knowledgeBase]);


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
                        <div className="flex items-center gap-2">
                            <Search size={18} />
                            <BaseHeading text="Search Results" className="text-[1.17rem]" />
                        </div>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className={`${theme === "light" ? "" : "bg-textColor-300 text-white"}`}>
                    {
                        filteredKnowledgeBase?.mainSource ? (
                            <div className="flex flex-col gap-1">

                                {/* main source */}
                                <BaseHeading text="Main results" cssClasses="text-lg" />
                                {/* {filteredKnowledgeBase[0].map((item, index) => ( */}
                                <div className={`flex items-center gap-2 w-full max-w-full cursor-pointer p-2 ${theme === 'light' ? 'hover:bg-textColor-100/5' : 'hover:bg-light-hover-200/5'} hover:rounded-lg`} onClick={(event) => onThumbnailClick(event, discoveredSources.mainSource)}>
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
                                                    <Chip key={`${cat}-${index}`} cssClasses="italic !px-2 !py-0.5 !text-xs" content={cat} />
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
                                                        <BaseHeading text={`${discoveredSources.mainSource?.score * 10}% score`} className={`rounded-md px-2 py-0.5 font-semibold  !text-primary-300 ${theme === 'light' ? 'bg-primary-100/30' : 'bg-primary-300/10'}`} />
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
                                    <div key={item?.source_path} className={`flex items-center gap-2 w-full max-w-full cursor-pointer p-2 ${theme === 'light' ? 'hover:bg-textColor-100/5' : 'hover:bg-light-hover-200/5'} hover:rounded-lg`} onClick={(event) => onThumbnailClick(event, item)}>
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
                                                        <Chip key={`${cat}-${index}`} cssClasses="italic !px-2 !py-0.5 !text-xs" content={cat} />
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
                                                            <BaseHeading text={`${item?.score * 10}% score`} className={`rounded-md px-2 py-0.5 font-semibold  !text-primary-300 ${theme === 'light' ? 'bg-primary-100/30' : 'bg-primary-300/10'}`} />
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
                        ) : (
                            <div className="flex flex-col items-center justify-center w-full mb-5">
                                <div className="flex flex-col items-center justify-center text-center gap-2">
                                    <img src="/search.svg" />
                                    <BaseHeading text="No matching sources" className={`!text-3xl mt-3 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} />
                                    <p className="text-sm">Nothing in your knowledge base matched <span className=" text-primary-300"><q>{props.searchQuestion}</q></span>.</p>
                                </div>

                                <div className={`flex flex-col items-center justify-center gap-1 mt-2 ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                                    <p className="m-0">Try:</p>
                                    <ul className="list-disc list-inside m-0 font-semibold">
                                        <li>Using fewer keywords</li>
                                        <li>Checking your selected indexes</li>
                                        <li>Searching for a broader topic</li>
                                    </ul>
                                </div>
                            </div>
                        )
                    }
                </Modal.Body>
                {filteredKnowledgeBase?.mainSource && (
                    <Modal.Footer className={`${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                        <div
                            className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                            onClick={props.onHide}
                        >
                            <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Done</span>
                        </div>
                    </Modal.Footer>
                )}
            </Modal >
        </>
    );
}

export default SearchModal;
