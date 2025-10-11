import { useContext, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
// import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PDFThumbnail from "../PDFThumbnail";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoadingSpinner from "../LoadingSpinner";
import Checkbox from "@mui/material/Checkbox";
import { MainContext } from "../../contexts/mainContext.jsx";
import "./source_explorer.css";
import StagedVideoThumbnail from '../StagedVideoThumbnail';
import StagedImageThumbnail from '../StagedImageThumbnail';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import RemoveIndexModal from '../RemoveIndexModal';
import { searchByKey, sortBySourcePath } from '../../utils';
import { IndexModal } from '../IndexModal/index.jsx';

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
        setKnowledgeBase,
        categoryOptions
    } = useContext(MainContext);

    // const [currentPath, setCurrentPath] = useState('/');
    const [viewModes, setViewModes] = useState(["categories"]); // 'categories' or 'formats'
    const [results, setResults] = useState(knowledgeBase);
    const [history, setHistory] = useState(["/"]);
    const [currentPath, setCurrentPath] = useState(history[history.length - 1] || "/");

    function ge() {
        let filteredItems;
        const pathSegments = currentPath.split("/").filter(Boolean); // Removes empty strings from array
        const category = pathSegments[0];
        const format = pathSegments[1];

        if (!category && !format) {
            filteredItems = knowledgeBase; // Root `/` case: Select all items
        } else if (category && !format) {
            filteredItems = knowledgeBase.filter((item) => {
                return item.category.includes(category) || category === 'all';
            }
            ); // Category only
        } else {
            filteredItems = knowledgeBase.filter(item =>
                (item.category.includes(category) || category === 'all') && (item.file_type === format || format === 'all')
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
        setCurrentPath(newPath);
        setViewModes((prevViewModes) => [...prevViewModes, "formats"]);
        setHistory((prevHistory) => [...prevHistory, newPath]);
    };

    const openFormatFolder = (format) => {
        setSelectedFormat(format);
        const newPath = currentPath + format + "/";
        setCurrentPath(newPath);
        setViewModes((prevViewModes) => [...prevViewModes, "files"]);
        setHistory((prevHistory) => [...prevHistory, newPath]);
    };

    useEffect(() => {
        setCurrentPath(history[history.length - 1] || "/");
    }, [JSON.stringify(history)]);

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

    const [searchValue, setSearchValue] = useState("");
    useEffect(() => {
        let base = [...knowledgeBase];

        if (searchValue.trim() !== "") {
            base = searchByKey(base, "source_path", searchValue);
        }

        setResults(sortBySourcePath(base));

        // view modes handling
        viewModes[viewModes.length - 1] !== "files"
            ? renderFolders()
            : renderFiles();
    }, [knowledgeBase, searchValue]);

    const [showRemoveIndexModal, setShowRemoveIndexModal] = useState(false);
    function removeIndex(e) {
        e.stopPropagation();
        setShowRemoveIndexModal(true);
    }
    // const [showRemoveXItem, setShowRemoveXItem] = useState(null);
    const [hoveredItemToRemove, setHoveredItemToRemove] = useState('');
    const [itemToRemove, setItemToRemove] = useState("");
    const [itemsFoundInsideCategoryOrFormat, setItemsFoundInsideCategoryOrFormat] = useState(knowledgeBase.length > 0);
    const renderFolders = () => {
        if (viewModes[viewModes.length - 1] === "categories" && categoryOptions?.filter(cat => cat.value !== "all").length === 0) {
            return (
                <>
                    <div>
                        <p>No index found!</p>
                        <p onClick={() => props.showIndexModal()} className="mb-1 text-primary-300 hover:border-b hover:border-b-primary-300 w-fit hover:cursor-pointer">Create new index</p>
                    </div>
                    {/* <IndexModal show={isIndexModalOpen} onHide={hideIndexModal} handleUpload={props?.handleUpload} /> */}
                </>
            );
        }
        return <>
            {props[viewModes[viewModes.length - 1]].map((item, index) => (
                <div
                    className="relative select-none transition-transform folder group hover:scale-110 hover:font-medium hover:bg-gradient-to-r hover:from-[#755bea] hover:to-[#b76894] hover:bg-clip-text hover:text-transparent"
                    onClick={() => (viewModes[viewModes.length - 1] === "categories" ? openCategoryFolder(item.value) : openFormatFolder(item.value))}
                    key={index}
                    onMouseOver={() => { setHoveredItemToRemove(item.value); setItemToRemove(item.value); }}
                    onMouseLeave={() => { setHoveredItemToRemove(""); }}
                >
                    {(hoveredItemToRemove === item.value && viewModes[viewModes.length - 1] === "categories" && item.value !== "all") && <DeleteIcon color='error' onClick={(e) => removeIndex(e)} className='absolute top-0 right-3' />}
                    {/* <FolderIcon sx={{ fontSize: 60 }} /> */}
                    <FolderOpenIcon sx={{ fontSize: 50 }} className={`${theme === 'light' ? 'text-textColor-300' : "text-[#ABAEB4]"} `} />
                    <p>{item.label}</p>
                </div>
            ))}
            <RemoveIndexModal deleteResource={props.deleteResource} index={itemToRemove} show={showRemoveIndexModal} onHide={() => setShowRemoveIndexModal(false)} />
        </>;
    };

    // useEffect(() => {
    //     console.log(currentPath);
    // }, [currentPath]);

    // function test() {
    //     setItemsFoundInsideCategoryOrFormat(false);
    // }

    useEffect(() => {
        if (viewModes[viewModes.length - 1] === "files") {
            // Extracts category and format from the currentPath
            const pathSegments = currentPath.split("/").filter(Boolean); // Removes empty strings from array
            const category = pathSegments[0];
            const format = pathSegments[1];

            const items = props.knowledgeBase
                .filter(
                    (file) =>
                        (file.file_type === format || format === "all") &&
                        (file.category[1] === category || category === "all")
                );

            setItemsFoundInsideCategoryOrFormat(items.length > 0);
        }
    }, [JSON.stringify(currentPath), JSON.stringify(history)]);

    const renderFiles = () => {
        if (viewModes[viewModes.length - 1] === "files") {
            // Extracts category and format from the currentPath
            const pathSegments = currentPath.split("/").filter(Boolean); // Removes empty strings from array
            const category = pathSegments[0];
            const format = pathSegments[1];



            if (category === "all") {
                const items = results
                    .filter((file) => file.file_type === format || format === "all");

                if (items.length > 0 && results.length > 0) {
                    return items.map((file, index) => (
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
                }
                else {
                    // setItemsFoundInsideCategoryOrFormat(false);
                    return (
                        <p className={`no-files-found ${theme === "dark" ? "text-textColor-100" : "text-textColor-200"}`}>
                            No files found in this category.
                        </p>
                    );
                }


            } else {
                const items = results
                    .filter(
                        (file) =>
                            (file.file_type === format || format === "all") &&
                            file.category[0] === category
                    );

                if ((items.length > 0 && results.length > 0)) {
                    return items.map((file, index) => (
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
                } else {
                    // setItemsFoundInsideCategoryOrFormat(false);
                    return (
                        <p className={`no-files-found ${theme === "dark" ? "text-textColor-100" : "text-textColor-200"}`}>
                            No files found in this category.
                        </p>
                    );
                }
            }
        }
    };



    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchValue(value);

        if (value.trim() === "") {
            setResults(sortBySourcePath(knowledgeBase));
        } else {
            const filtered = searchByKey(knowledgeBase, "source_path", value);
            setResults(sortBySourcePath(filtered));
        }
    };
    // const handleSearch = (e) => {
    //     const value = e.target.value;
    //     setSearchValue(value);

    //     const filtered = searchByKey(knowledgeBase, "source_path", value);
    //     setKnowledgeBase(sortBySourcePath(filtered));
    // };
    return (
        <Modal
            show={props.show}
            onHide={handleClose}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            className="relative"
        >
            <div className="w-56 h-56 bg-pink-400 rounded-full absolute left-1/2 top-10 z-10 blur-[180px]"></div>
            <div className="w-56 h-56 bg-purple-400 rounded-full absolute left-0 top-80 z-10 blur-[180px]"></div>
            <Modal.Header
                closeButton
                className={`${theme === "dark" && "bg-textColor-300 text-textColor-100 !border-b-textColor-200"} z-20`}
            >
                <Modal.Title id="contained-modal-title-vcenter" className="flex flex-col gap-0">
                    <h3 className="mb-0 text-xl">Source Explorer</h3>
                    <p className="font-normal">Select sources to add to your workspace, enabling metadata extraction and deeper insights.</p>
                </Modal.Title>
            </Modal.Header>
            <Modal.Body
                className={`${theme === "light" ? "" : "bg-textColor-300 text-white"} z-20`}
            >
                <div className="flex justify-between itms-center">
                    {categoryOptions?.filter(cat => cat?.value !== "all").length > 0 && <div
                        className={`current-path-wrapper select-none ${theme === "dark" && "text-textColor-100"
                            }`}
                    >
                        <BackButton className={`back-btn`} />
                        <h3 className="current-path">{currentPath}</h3>
                    </div>}

                    {viewModes[viewModes.length - 1] === "files" && <input className={`py-1 text-sm bg-transparent outline-none ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200'} w-ful lg:w-[30%] rounded-full !pl-[10px]`} placeholder={"Search..."} value={searchValue} onChange={handleSearch} />}


                </div>
                <div className="flex flex-wrap items-start gap-10 folders-wrapper">
                    {viewModes[viewModes.length - 1] !== "files"
                        ? renderFolders()
                        : renderFiles()}
                    {/* <RemoveIndexModal show={showRemoveIndexModal} onHide={() => setShowRemoveIndexModal(false)} /> */}
                </div>
            </Modal.Body>
            <Modal.Footer className={`${itemsFoundInsideCategoryOrFormat && 'flex !items-center !justify-between'}  ${theme === "dark" && "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"} z-20`}>
                {itemsFoundInsideCategoryOrFormat && <div className="flex">
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
                </div>}
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
