import { useContext } from "react";
import Modal from "react-bootstrap/Modal";
import DeleteIcon from "@mui/icons-material/Delete";
import PDFThumbnail from "../PDFThumbnail";
import LoadingSpinner from "../LoadingSpinner";
import Checkbox from "@mui/material/Checkbox";

import { MainContext } from "../../contexts/mainContext.jsx";
import StagedVideoThumbnail from '../StagedVideoThumbnail';
import StagedImageThumbnail from '../StagedImageThumbnail';

import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import GsFile from '../GsFile/index.jsx';

export function SearchModal(props) {
    const { additionalSources, theme, handleCheckboxChange, onThumbnailClick } = useContext(MainContext);

    const handleClose = () => {
        props.onHide();
    };

    // Function to filter knowledgeBase items whose source paths exist in additionalSources
    const filteredKnowledgeBase = props.knowledgeBase.filter((kbItem) =>
        additionalSources.some((addSrc) => addSrc === kbItem.source_path)
    );

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
                        {filteredKnowledgeBase.map((item, index) => (
                            // <div className={`!border ${theme === 'dark' && '!border-textColor-200'} !h-fit w-[130px] relative cursor-pointer`} key={index}>
                            // {props.isDeleting && props.clickedIndex === index ? (
                            //     <div className="thumbnail-loader">
                            //         <LoadingSpinner />
                            //     </div>
                            // ) : null}
                            // <Checkbox
                            //     className={`absolute left-0 p-0 ${theme === 'dark' && 'text-white'}`}
                            //     checked={item.is_selected}
                            //     onChange={(e) => props.handleCheckboxChange(e?.target?.checked, item)}
                            //     inputProps={{ "aria-label": "Select source" }}
                            // />
                            //     <div onClick={(event) => props.onThumbnailClick(event, item)}>
                            //         {item.file_type === "video" && <StagedVideoThumbnail item={item} />}
                            //         {item.file_type === "pdf" && <PDFThumbnail item={item} />}
                            //         {item.file_type === "img" && <StagedImageThumbnail item={item} />}
                            //     </div>
                            //     <DeleteIcon
                            //         color='error'
                            //         onClick={(event) => props.deleteResource(event, [item])}
                            //         className="absolute top-0 right-0"
                            //     />
                            // </div>
                            <div key={item?.source_path} className={`flex items-center gap-2 w-full max-w-full cursor-pointer p-2 ${theme === 'light' ? 'hover:bg-light-hover-100/70' : 'hover:bg-light-hover-200/20'} hover:rounded-lg`} onClick={(event) => onThumbnailClick(event, item)}>
                                {
                                    item.file_type === "video" ? (
                                        <PlayCircleOutlineOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                    ) : item.file_type === "pdf" ? (
                                        <ArticleOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                    ) : item.file_type === "img" ? (
                                        <ImageOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                    ) : null
                                }
                                <div className="relative flex-shrink-0 w-10 h-10">
                                    {(props.isDeleting && props.clickedIndex === index) && (
                                        <div>
                                            <LoadingSpinner />
                                        </div>
                                    )}
                                    {(item?.thumbnail?.startsWith('blob') && item.file_type === "video") ? (
                                        <video
                                            src={item.thumbnail}
                                            className="object-cover w-full h-full rounded-md"
                                            alt="video thumbnail"
                                            controls={false}
                                        />
                                    )
                                        :
                                        <GsFile
                                            className="object-cover w-full h-full rounded-md"
                                            gsUrl={item.thumbnail}
                                            alt="Video Thumbnail"
                                        />

                                    }
                                </div>
                                <div className="flex flex-col self-start flex-1">
                                    <p className={`text-md font-medium break-all m-0 ${theme === 'dark' && 'text-textColor-100'}`}>{item.source_path.replace(/\.[^/.]+$/, '')}</p>
                                    <span className="italic">{item.category}</span>
                                </div>
                                <div className="flex items-center ">
                                    <Checkbox
                                        className="p-0 !ml-1"
                                        checked={item.is_selected}
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
