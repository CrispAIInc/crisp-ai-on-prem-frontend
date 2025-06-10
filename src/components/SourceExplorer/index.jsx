import { useContext, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import PDFThumbnail from "../PDFThumbnail";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoadingSpinner from "../LoadingSpinner";
import Checkbox from "@mui/material/Checkbox";
import { MainContext } from "../../contexts/mainContext";
import "./source_explorer.css";
import StagedVideoThumbnail from '../StagedVideoThumbnail';
import StagedImageThumbnail from '../StagedImageThumbnail';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import RemoveIndexModal from '../RemoveIndexModal';

export function SourceExplorer(props) {
    const {
        selectedAll,
        setSelectedFormat,
        selectedCategory,
        setSelectedCategory,
        theme,
        sourcesTobeCommited,
        selectedFormat,
        knowledgeBase,
    } = useContext(MainContext);

    // const [currentPath, setCurrentPath] = useState('/');
    const [viewModes, setViewModes] = useState(["categories"]); // 'categories' or 'formats'

    const [history, setHistory] = useState(["/"]);
    const currentPath = history[history.length - 1] || "/";

    function ge() {
        let filteredItems;
        const pathSegments = currentPath.split("/").filter(Boolean); // Removes empty strings from array
        const category = pathSegments[0];
        const format = pathSegments[1];

        if (!category && !format) {
            filteredItems = knowledgeBase; // Root `/` case: Select all items
        } else if (category && !format) {
            filteredItems = knowledgeBase.filter((item) => {
                return item.category.includes(category);
            }
            ); // Category only
        } else {
            filteredItems = knowledgeBase.filter(item =>
                item.category.includes(category) && item.file_type === format
            ); // Category + Format
        }

        return filteredItems.length > 0 && filteredItems.every(item => item.is_selected);
    }


    const [isSelectAll, setIsSelectAll] = useState(false);

    useEffect(() => {
        setIsSelectAll(ge());
    }, [currentPath, selectedCategory, selectedFormat, sourcesTobeCommited]);


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

    useEffect(() => {
        viewModes[viewModes.length - 1] !== "files"
            ? renderFolders()
            : renderFiles();
    }, [knowledgeBase]);

    const [showRemoveIndexModal, setShowRemoveIndexModal] = useState(false);
    function removeIndex(e) {
        e.stopPropagation();
        setShowRemoveIndexModal(true);
    }
    // const [showRemoveXItem, setShowRemoveXItem] = useState(null);
    const [itemToRemove, setItemToRemove] = useState("");
    const renderFolders = () => {
        return <>
            {props[viewModes[viewModes.length - 1]].map((item, index) => (
                <div
                    className="relative folder"
                    onClick={() => (viewModes[viewModes.length - 1] === "categories" ? openCategoryFolder(item.value) : openFormatFolder(item.value))}
                    key={index}
                    onMouseOver={() => setItemToRemove(item.value)}
                // onMouseLeave={() => setItemToRemove("")}
                >
                    {(itemToRemove === item.value && viewModes[viewModes.length - 1] === "categories") && <DeleteIcon color='error' onClick={(e) => removeIndex(e)} className='absolute top-0 right-3' />}
                    <FolderIcon sx={{ fontSize: 60 }} />
                    <p>{item.label}</p>
                </div>
            ))}
            <RemoveIndexModal deleteResource={props.deleteResource} index={itemToRemove} show={showRemoveIndexModal} onHide={() => setShowRemoveIndexModal(false)} />
        </>;
    };

    // useEffect(() => {
    //     console.log(currentPath);
    // }, [currentPath]);

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
                            {/* {(props.isDeleting && props.clickedIndex.source_path === file.source_path) && (
                            <div className="thumbnail-loader">
                                <LoadingSpinner />
                            </div>
                            )} */}
                            <div className="relative">
                                {(props.isDeleting && props.clickedIndex.source_path === file.source_path) && (
                                    <div className="thumbnail-loader absolute left-1/2 top-1/2 z-[2] translate-x-[-50%] translate-y-[-50%] transform">
                                        <LoadingSpinner />
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <Checkbox
                                        className={`select-all-checkbox ${theme === "dark" && "border-white text-white"
                                            } p-0`}
                                        checked={file.is_selected}
                                        onChange={(e) => props.handleCheckboxChange(e.target?.checked, file)}
                                        inputProps={{ "aria-label": "Select source" }}
                                    />

                                    {
                                        file.file_type === "video" ? (
                                            <PlayCircleOutlineOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                        ) : file.file_type === "pdf" ? (
                                            <ArticleOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                        ) : file.file_type === "img" ? (
                                            <ImageOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                        ) : null
                                    }

                                    <DeleteIcon
                                        style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }}
                                        onClick={(event) => props.deleteResource(event, [file])}
                                        className="delete-icon"
                                    />
                                </div>
                                <div onClick={(event) => props.onThumbnailClick(event, file)}>
                                    {file.file_type === "video" && <StagedVideoThumbnail item={file} />}
                                    {file.file_type === "pdf" && <PDFThumbnail item={file} />}
                                    {file.file_type === "img" && <StagedImageThumbnail item={file} />}
                                </div>
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
                            {props.isDeleting && props.clickedIndex === file && (
                                <div className="thumbnail-loader">
                                    <LoadingSpinner />
                                </div>
                            )}
                            <div className="relative">
                                <div className="flex items-center justify-between">
                                    <Checkbox
                                        className={`select-all-checkbox ${theme === "dark" && "border-white text-white"
                                            } absolute p-0`}
                                        checked={file.is_selected}
                                        onChange={(e) => props.handleCheckboxChange(e.target?.checked, file)}
                                        inputProps={{ "aria-label": "Select source" }}
                                    />

                                    {
                                        file.file_type === "video" ? (
                                            <PlayCircleOutlineOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                        ) : file.file_type === "pdf" ? (
                                            <ArticleOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                        ) : file.file_type === "img" ? (
                                            <ImageOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                        ) : null
                                    }

                                    <DeleteIcon
                                        style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }}
                                        onClick={(event) => props.deleteResource(event, [file])}
                                        className="delete-icon"
                                    />
                                </div>
                                <div onClick={(event) => props.onThumbnailClick(event, file)}>
                                    {file.file_type === "video" && <StagedVideoThumbnail item={file} />}
                                    {file.file_type === "pdf" && <PDFThumbnail item={file} />}
                                    {file.file_type === "img" && <StagedImageThumbnail item={file} />}
                                </div>
                                {/* <DeleteIcon
                                    color="error"
                                    onClick={(event) => props.deleteResource(event, [file])}
                                    className="absolute top-0 right-0 delete-icon"
                                /> */}
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
                    {/* <RemoveIndexModal show={showRemoveIndexModal} onHide={() => setShowRemoveIndexModal(false)} /> */}
                </div>
                <div className="flex items-center mt-4 ">
                    <Checkbox
                        className={`select-all-checkbox p-0 ${theme === "dark" && "border-white text-white"
                            }`}
                        checked={selectedAll || isSelectAll}
                        onChange={(e) => props.handleSelectAllCheckboxChange(currentPath, e.target.checked)}
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
