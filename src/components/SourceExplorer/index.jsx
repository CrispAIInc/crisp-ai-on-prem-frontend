import { useContext, useEffect, useState } from "react";
import Modal from "react-bootstrap/Modal";
import DeleteIcon from "@mui/icons-material/Delete";
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import PDFThumbnail from "../PDFThumbnail";
import LoadingSpinner from "../LoadingSpinner";
import Checkbox from "@mui/material/Checkbox";
import { MainContext } from "../../contexts/mainContext.jsx";
import "./source_explorer.css";
import StagedVideoThumbnail from '../StagedVideoThumbnail';
import StagedImageThumbnail from '../StagedImageThumbnail';
import { searchByKey, sortBySourcePath } from '../../utils';
import makeApiRequest from '../../api/index.js';
import UploadIcon from '@mui/icons-material/Upload';
import useResources from '../../hooks/useResources.js';
import { useToast } from "../../contexts/toastContext";
import ConfirmationModal from '../ConfirmationModal/index.jsx';
import { ProjectContext } from '../../contexts/projectContext.jsx';
import BaseHeading from '../BaseHeading/index.jsx';
import SourceExplorerBody from '../SourceExplorerBody/index.jsx';

export function SourceExplorer(props) {
    const {
        selectedAll,
        selectedFormat,
        setSelectedFormat,
        selectedCategory,
        setSelectedCategory,
        theme,
        sourcesTobeCommited,
        knowledgeBase,
        setCategoryOptions,
        categoryOptions
    } = useContext(MainContext);

    const { isProjectReadOnly } = useContext(ProjectContext);

    const { notify } = useToast();

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

        return filteredItems.length > 0 && filteredItems.every(item => item.is_checked);
    }


    const [isCheckedAll, setisCheckedAll] = useState(false);

    useEffect(() => {
        setisCheckedAll(ge());
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

    const handleOpenUploadCategoriesModal = () => {
        props.onHide();
        props.onOpenCategoriesModal?.();
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

    const getBreadcrumbLabel = (value) => {
        const normalizedValue = String(value || "").toLowerCase();

        const categoryLabel = (props.categories || categoryOptions || []).find((item) => String(item?.value || "").toLowerCase() === normalizedValue)?.label;
        if (categoryLabel) return categoryLabel;

        const formatLabel = (props.formats || []).find((item) => String(item?.value || "").toLowerCase() === normalizedValue)?.label;
        return formatLabel || value;
    };

    const navigateToBreadcrumb = (level) => {
        const pathSegments = currentPath.split("/").filter(Boolean);

        if (level === 0) {
            setCurrentPath("/");
            setHistory(["/"]);
            setViewModes(["categories"]);
            setSelectedCategory(null);
            setSelectedFormat(null);
            return;
        }

        const targetPathSegments = pathSegments.slice(0, level);
        const targetPath = `/${targetPathSegments.join("/")}/`;

        setCurrentPath(targetPath);
        setSelectedCategory(targetPathSegments[0] || null);
        setSelectedFormat(targetPathSegments[1] || null);
        setViewModes(
            targetPathSegments.length === 0
                ? ["categories"]
                : targetPathSegments.length === 1
                    ? ["categories", "formats"]
                    : ["categories", "formats", "files"]
        );
        setHistory(["/", ...targetPathSegments.map((_, index) => `/${targetPathSegments.slice(0, index + 1).join("/")}/`)]);
    };

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

    const [isIndexDeleting, setIsIndexDeleting] = useState(false);
    const { getIndexes } = useResources({ setCategoryOptions });
    async function deleteIndex() {
        try {
            // remove sources before index
            setIsIndexDeleting(true);
            const itemsToBeDeleted = knowledgeBase.filter((item) => item.category.includes(itemToRemove));
            if (itemsToBeDeleted.length > 0) await props.deleteResource(null, itemsToBeDeleted);
            await makeApiRequest(`/remove-index`, 'post', { index: itemToRemove });
            getIndexes();
            notify({
                variant: "success",
                heading: "Index deleted!",
            });
            setShowRemoveIndexModal(false);
        } catch (error) {
            console.log(error.response.data.error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: error?.response?.data?.error || 'Error deleting index',
            });
        } finally {
            setIsIndexDeleting(false);
        }
    }

    const renderFolders = () => {
        if (viewModes[viewModes.length - 1] === "categories" && categoryOptions?.filter(cat => cat.value !== "all").length === 0) {
            return (
                <>
                    <div>
                        <p>No index found!</p>
                        <p onClick={() => props.showIndexModal?.()} className="mb-1 text-primary-300 hover:border-b hover:border-b-primary-300 w-fit hover:cursor-pointer">Create new index</p>
                    </div>
                    {/* <IndexModal show={isIndexModalOpen} onHide={hideIndexModal} handleUpload={props?.handleUpload} /> */}
                </>
            );
        }
        return <>
            <div
                className="relative select-none transition-transform folder group hover:scale-110 hover:font-medium hover:bg-gradient-to-r hover:from-[#755bea] hover:to-[#b76894] hover:bg-clip-text hover:text-transparent"
                onClick={() => (viewModes[viewModes.length - 1] === "categories" ? openCategoryFolder('all') : openFormatFolder('all'))}
            >
                <FolderOpenIcon sx={{ fontSize: 50 }} className={`${theme === 'light' ? 'text-textColor-300' : "text-[#ABAEB4]"} `} />
                <p>All</p>
            </div>
            {props[viewModes[viewModes.length - 1]].filter(item => item.value !== "all").map((item, index) => (
                <div
                    className="relative select-none transition-transform folder group hover:scale-110 hover:font-medium hover:bg-gradient-to-r hover:from-[#755bea] hover:to-[#b76894] hover:bg-clip-text hover:text-transparent"
                    onClick={() => (viewModes[viewModes.length - 1] === "categories" ? openCategoryFolder(item.value) : openFormatFolder(item.value))}
                    key={index}
                    onMouseOver={() => { setHoveredItemToRemove(item.value); setItemToRemove(item.value); }}
                    onMouseLeave={() => { setHoveredItemToRemove(""); }}
                >
                    {(hoveredItemToRemove === item.value && viewModes[viewModes.length - 1] === "categories" && item.value !== "all" && !isProjectReadOnly) && <DeleteIcon color='error' onClick={(e) => removeIndex(e)} className='absolute top-0 right-3' />}
                    {
                        (itemToRemove === item.value && viewModes[viewModes.length - 1] === "categories" && isIndexDeleting) && <LoadingSpinner isSmall />
                    }
                    {/* <FolderIcon sx={{ fontSize: 60 }} /> */}
                    <FolderOpenIcon sx={{ fontSize: 50 }} className={`${theme === 'light' ? 'text-textColor-300' : "text-[#ABAEB4]"} `} />
                    <p>{item.label}</p>
                </div>
            ))}
            <ConfirmationModal show={showRemoveIndexModal} onHide={() => setShowRemoveIndexModal(false)} heading="Are you sure you want to delete this index?" subheading="CAUTION: all sources from this category will be permanently deleted." confirmedFn={deleteIndex} isDeleting={isIndexDeleting} />
        </>;
    };

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
                        (file.category.includes(category) || category === "all")
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
                                    <div className="thumbnail-loader absolute z-[2] pointer-events-none flex w-full h-full flex-col items-center justify-center bg-white/40">
                                        <LoadingSpinner />
                                    </div>
                                )}
                                <div className="flex items-center justify-between">
                                    <Checkbox
                                        className={`select-all-checkbox ${theme === "dark" && "border-white text-white"
                                            } p-0`}
                                        checked={file.is_checked}
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

                                    {
                                        !isProjectReadOnly && <DeleteIcon
                                            style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }}
                                            onClick={(event) => (!props.isDeleting || props.clickedIndex.source_path !== file.source_path) && props.deleteResource(event, [file])}
                                            className="delete-icon"
                                        />
                                    }
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
                            file.category.includes(category)
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
                                        checked={file.is_checked}
                                        onChange={(e) => props.handleCheckboxChange(e.target?.checked, file)}
                                        inputProps={{ "aria-label": "Select source" }}
                                    />

                                    {
                                        file.file_type === "video" ? (
                                            <PlayCircleOutlineOutlinedIcon className={`text-[20px] ${theme === 'light' ? 'text-[#333' : 'text-[#ABAEB4'}`} />
                                        ) : file.file_type === "pdf" ? (
                                            <ArticleOutlinedIcon className={`text-[20px] ${theme === 'light' ? 'text-[#333' : 'text-[#ABAEB4'}`} />
                                        ) : file.file_type === "img" ? (
                                            <ImageOutlinedIcon className={`text-[20px] ${theme === 'light' ? 'text-[#333' : 'text-[#ABAEB4'}`} />
                                        ) : null
                                    }

                                    {!isProjectReadOnly && <DeleteIcon
                                        style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }}
                                        onClick={(event) => props.deleteResource(event, [file])}
                                        className="delete-icon"
                                    />}
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
                className={`${theme === "dark" && "bg-textColor-300 text-textColor-100 !border-b-textColor-200"} z-20`}
            >
                <div className="flex w-full items-center justify-between gap-3">
                    <Modal.Title id="contained-modal-title-vcenter" className="flex flex-col gap-0">
                        <BaseHeading text="Source Explorer" className="text-xl" />
                        <p className="text-slate-400 text-sm mt-0.5">Select sources to add to your workspace, enabling metadata extraction and deeper insights.</p>
                    </Modal.Title>
                    {!isProjectReadOnly && (
                        <button
                            type="button"
                            onClick={handleOpenUploadCategoriesModal}
                            className={`inline-flex items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold shadow-sm transition ${theme === "dark" ? "!border !border-textColor-200 bg-textColor-300 text-textColor-100 hover:bg-background_workspace" : "!border !border-slate-300/80 bg-white text-textColor-300 hover:bg-light-hover-100"}`}
                        >
                            <UploadIcon className={`text-[10px] ${theme === "light" ? "text-textColor-200" : "text-textColor-100"}`} />
                            <span className="text-sm">Upload new source</span>
                        </button>
                    )}
                </div>
            </Modal.Header>

            <Modal.Body
                className={`${theme === "light" ? "" : "bg-textColor-300 text-white"} z-20 overflow-hidden flex flex-col`}
            >
                {/* <div className="flex justify-between items-center gap-4">
                    {categoryOptions?.filter(cat => cat?.value !== "all").length > 0 && <div
                        className={`current-path-wrapper select-none ${theme === "dark" && "text-textColor-100"}`}
                    >
                        <div className="flex flex-wrap items-center gap-1 text-xl font-semibold">
                            {currentPath !== "/" && (
                                <button
                                    type="button"
                                    onClick={() => navigateToBreadcrumb(0)}
                                    className={`breadcrumb-link ${theme === "dark" ? "text-textColor-200 hover:text-textColor-100" : "text-textColor-200 hover:text-textColor-300"}`}
                                >
                                    ..
                                </button>
                            )}
                            {currentPath
                                .split("/")
                                .filter(Boolean)
                                .map((segment, index) => (
                                    <span key={`${segment}-${index}`} className="flex items-start gap-1">
                                        <span className="breadcrumb-separator">&gt;</span>
                                        <button
                                            type="button"
                                            onClick={() => navigateToBreadcrumb(index + 1)}
                                            className={`breadcrumb-link ${theme === "dark" ? "text-textColor-200 hover:text-textColor-100" : "text-textColor-200 hover:text-textColor-300"}`}
                                        >
                                            {getBreadcrumbLabel(segment)}
                                        </button>
                                    </span>
                                ))}
                        </div>
                    </div>}

                    {viewModes[viewModes.length - 1] === "files" && (
                        <div className="flex items-center gap-2">
                            {!isProjectReadOnly && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        const pathSegments = currentPath.split("/").filter(Boolean);
                                        setSelectedCategory(pathSegments[0] || "all");
                                        props.onHide();
                                        props.onOpenUploadModal?.(pathSegments[0] || "all");
                                    }}
                                    className={`inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold shadow-sm transition ${theme === "dark" ? "!border !border-textColor-200 bg-textColor-300 text-textColor-100 hover:bg-background_workspace" : "!border !border-slate-300/80 bg-white text-textColor-300 hover:bg-light-hover-100"}`}
                                >
                                    <UploadIcon className={`${theme === "light" ? 'text-textColor-200' : 'text-textColor-100'}`} />
                                    <BaseHeading text="Upload new source" className="text-md" />
                                </button>
                            )}
                        </div>
                    )}
                </div>
                {viewModes[viewModes.length - 1] === "categories" && (
                    <div className="mt-4 flex justify-start">
                        <button
                            type="button"
                            onClick={openCreateCategoryModal}
                            className={`inline-flex items-center gap-1 rounded-xl px-2 py-2 text-sm font-semibold shadow-sm transition ${theme === "dark" ? "!border !border-textColor-200 bg-textColor-300 text-textColor-100 hover:bg-background_workspace" : "!border !border-slate-300/80 bg-white text-textColor-300 hover:bg-light-hover-100"}`}
                        >
                            <AddIcon className={`${theme === "light" ? 'text-textColor-200' : 'text-textColor-100'}`} />
                            <BaseHeading text="New index" className="text-md" />
                        </button>
                    </div>
                )}
                <div className="flex flex-wrap items-start gap-10 folders-wrapper">
                    {viewModes[viewModes.length - 1] !== "files"
                        ? renderFolders()
                        : renderFiles()}
                </div> */}
                <SourceExplorerBody
                    onHide={props.onHide}
                    showIndexModal={props.showIndexModal}
                    isDeleting={props.isDeleting}
                    clickedIndex={props.clickedIndex}
                    deleteResource={props.deleteResource}
                />
            </Modal.Body>

            <Modal.Footer className={`${itemsFoundInsideCategoryOrFormat && 'flex !items-center !justify-between'}  ${theme === "dark" && "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"} z-20`}>
                {itemsFoundInsideCategoryOrFormat && <div className="flex items-center">
                    <Checkbox
                        className={`select-all-checkbox p-0 ${theme === "dark" && "border-white text-white"
                            }`}
                        checked={selectedAll || isCheckedAll}
                        onChange={(e) => props.handleSelectAllCheckboxChange(currentPath, e.target.checked)}
                        inputProps={{ "aria-label": "Select All Sources" }}
                        label="Select All Sources"
                    />
                    <BaseHeading text="Select all sources" />
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
