import { useContext, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import DeleteIcon from "@mui/icons-material/Delete";
import FolderIcon from "@mui/icons-material/Folder";
import VideoThumbnail from "../VideoThumbnail";
import PDFThumbnail from "../PDFThumbnail";
import ImageThumbnail from "../ImageThumbnail";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoadingSpinner from "../LoadingSpinner";
import Checkbox from "@mui/material/Checkbox";
import { MainContext } from "../../contexts/mainContext";
import "./source_explorer.css";
import StagedVideoThumbnail from '../StagedVideoThumbnail';
import StagedImageThumbnail from '../StagedImageThumbnail';

export function SourceExplorer(props) {
    const {
        selectedAll,
        setSelectedFormat,
        selectedCategory,
        setSelectedCategory,
        theme,
    } = useContext(MainContext);

    // const [currentPath, setCurrentPath] = useState('/');
    const [viewModes, setViewModes] = useState(["categories"]); // 'categories' or 'formats'

    const [history, setHistory] = useState(["/"]);
    const currentPath = history[history.length - 1] || "/";

    useEffect(() => {
        // update current path whenever selectedCategory changes in Parent component
        if (selectedCategory !== null && !props.isOpenedFromSourceExplorerBtn) {
            setViewModes((prevViewModes) => [...prevViewModes, "formats"]);
            setHistory([`/${selectedCategory}/`]);
        }
    }, [selectedCategory]);

    const handleClose = () => {
        setHistory(["/"]);
        setViewModes(["categories"]);
        props.onHide();
    };

    const openCategoryFolder = (category) => {
        setSelectedCategory(category);
        const newPath = currentPath + category + "/";
        setViewModes((prevViewModes) => [...prevViewModes, "formats"]);
        setHistory((prevHistory) => [...prevHistory, newPath]);
    };

    const openFormatFolder = (format) => {
        setSelectedFormat(format);
        const newPath = currentPath + format + "/";
        setViewModes((prevViewModes) => [...prevViewModes, "files"]);
        setHistory((prevHistory) => [...prevHistory, newPath]);
    };

    const goBack = () => {
        setHistory((prevHistory) => {
            const newHistory = [...prevHistory];
            newHistory.pop();
            return newHistory;
        });
        setViewModes((prevViewModes) => {
            const newViewModes = [...prevViewModes];
            newViewModes.pop();
            return newViewModes;
        });
    };

    const BackButton = () =>
        currentPath !== "/" && (
            <button onClick={goBack} className="back-btn">
                <ArrowBackIcon />
            </button>
        );

    const renderFolders = () => {
        return props[viewModes[viewModes.length - 1]].map((item, index) => (
            <div
                className="folder"
                onClick={() => (viewModes[viewModes.length - 1] === "categories" ? openCategoryFolder(item.value) : openFormatFolder(item.value))}
                key={index}
            >
                <FolderIcon sx={{ fontSize: 60 }} />
                <p>{item.label}</p>
            </div>
        ));
        // if (viewModes[viewModes.length - 1] === "categories") {
        //     return props.categories.map((item, index) => (
        //         <div
        //             className="folder"
        //             onClick={() => openCategoryFolder(item.value)}
        //             key={index}
        //         >
        //             <FolderIcon sx={{ fontSize: 60 }} />
        //             <p>{item.label}</p>
        //         </div>
        //     ));
        // } else if (viewModes[viewModes.length - 1] === "formats") {
        //     return props.formats.map((item, index) => (
        //         <div
        //             className="folder"
        //             onClick={() => openFormatFolder(item.value)}
        //             key={index}
        //         >
        //             <FolderIcon sx={{ fontSize: 60 }} />
        //             <p>{item.label}</p>
        //         </div>
        //     ));
        // }
    };

    const renderFiles = () => {
        if (viewModes[viewModes.length - 1] === "files") {
            // Extracts category and format from the currentPath
            const pathSegments = currentPath.split("/").filter(Boolean); // Removes empty strings from array
            const category = pathSegments[0];
            const format = pathSegments[1];

            if (category === "all") {
                return props.knowledgeBase
                    .filter((file) => file.file_type === format || format === "all")
                    .map((file, index) => (
                        <div
                            className={`!border rounded-md thumbnail-container file ${theme === "dark" && "!border-textColor-200 "
                                } !w-28`}
                            key={index}
                        >
                            {props.isDeleting && props.clickedIndex === index && (
                                <div className="thumbnail-loader">
                                    <LoadingSpinner />
                                </div>
                            )}
                            <div className="relative">
                                <Checkbox
                                    className={`select-all-checkbox ${theme === "dark" && "border-white text-white"
                                        } absolute p-0`}
                                    checked={file.is_selected}
                                    onChange={() => props.handleCheckboxChange(file)}
                                    inputProps={{ "aria-label": "Select source" }}
                                />
                                <div onClick={(event) => props.onThumbnailClick(event, file)}>
                                    {file.file_type === "video" && <StagedVideoThumbnail item={file} />}
                                    {file.file_type === "pdf" && <PDFThumbnail item={file} />}
                                    {file.file_type === "img" && <StagedImageThumbnail item={file} />}
                                </div>
                                <DeleteIcon
                                    color="error"
                                    onClick={(event) => props.deleteResource(event, file)}
                                    className="absolute top-0 right-0 delete-icon"
                                />
                            </div>
                        </div>
                    ));
            } else {
                return props.knowledgeBase
                    .filter(
                        (file) =>
                            (file.file_type === format || format === "all") &&
                            file.category[1] === category
                    )
                    .map((file, index) => (
                        <div
                            className={`border rounded-md thumbnail-container file ${theme === "dark" && "!border-textColor-300"
                                }`}
                            key={index}
                        >
                            {props.isDeleting && props.clickedIndex === index && (
                                <div className="thumbnail-loader">
                                    <LoadingSpinner />
                                </div>
                            )}
                            <div className="relative">
                                <Checkbox
                                    className={`select-all-checkbox ${theme === "dark" && "border-white text-white"
                                        } absolute p-0`}
                                    checked={file.is_selected}
                                    onChange={() => props.handleCheckboxChange(file)}
                                    inputProps={{ "aria-label": "Select source" }}
                                />
                                <div onClick={(event) => props.onThumbnailClick(event, file)}>
                                    {file.file_type === "video" && <VideoThumbnail item={file} />}
                                    {file.file_type === "pdf" && <PDFThumbnail item={file} />}
                                    {file.file_type === "img" && <ImageThumbnail item={file} />}
                                </div>
                                <DeleteIcon
                                    color="error"
                                    onClick={(event) => props.deleteResource(event, file)}
                                    className="absolute top-0 right-0 delete-icon"
                                />
                            </div>
                        </div>
                    ));
            }
        }
    };

    return (
        <Modal
            show={props.show}
            onHide={handleClose}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
        >
            <Modal.Header
                closeButton
                className={`${theme === "light"
                    ? ""
                    : "bg-textColor-300 text-white !border-b-textColor-200"
                    }`}
            >
                <Modal.Title id="contained-modal-title-vcenter">
                    Source Explorer
                </Modal.Title>
            </Modal.Header>
            <Modal.Body
                className={`${theme === "light" ? "" : "bg-textColor-300 text-white"}`}
            >
                <div
                    className={`current-path-wrapper ${theme === "dark" && "text-textColor-100"
                        }`}
                >
                    <BackButton className={`back-btn`} />
                    <h3 className="current-path">{currentPath}</h3>
                </div>
                <div className="flex flex-wrap items-start gap-10 folders-wrapper">
                    {viewModes[viewModes.length - 1] !== "files"
                        ? renderFolders()
                        : renderFiles()}
                </div>
                <div className="flex items-center mt-4 ">
                    <Checkbox
                        className={`select-all-checkbox p-0 ${theme === "dark" && "border-white text-white"
                            }`}
                        checked={selectedAll}
                        onChange={() => props.handleSelectAllCheckboxChange()}
                        inputProps={{ "aria-label": "Select All Sources" }}
                        label="Select All Sources"
                    />
                    <span
                        className={`${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                            }`}
                    >
                        Select all sources
                    </span>
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
        </Modal>
    );
}

export default SourceExplorer;
