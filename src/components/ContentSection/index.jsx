
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddIcon from '@mui/icons-material/Add';
import { useContext, useEffect, useRef, useState } from "react";
import makeApiRequest from "../../api";
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SourceExplorer from "../SourceExplorer";
import Modal from 'react-bootstrap/Modal';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { Checkbox } from "@mui/material";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { MainContext } from "../../contexts/mainContext";
import LoadingSpinner from "../LoadingSpinner";
import BaseHeading from '../BaseHeading';
import NoData from '../NoData';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import SearchSection from '../SearchSection';
import { timeToSeconds } from '../../utils';
import MetadataPanel from "../MetadataPanel";
import toast from 'react-simple-toasts';
import AddSourceModal from "../AddSourceModal";

const UpdateFilenameModal = ({ show, onHide, filename, setFilename, extension, sourceCategory, oldFilename, filetype }) => {
    const { theme, setDisplayedSources, categoryOptions, setKnowledgeBase } = useContext(MainContext);
    const [isLoading, setIsLoading] = useState(false);

    async function updateFilename() {
        try {
            if (filename === "") {
                toast('filename cannot be empty', { className: `p-2 rounded-md !bg-red-600 text-white`, theme });
                return;
            }

            const payload = {
                category: sourceCategory,
                oldFilename,
                newFilename: filename + "." + extension,
                filetype
            };
            await makeApiRequest('/rename', 'PATCH', JSON.stringify(payload));
            const data = await makeApiRequest(
                "/content",
                "post",
                JSON.stringify(categoryOptions.map((option) => option.value))
            );
            setKnowledgeBase(data.map(item => {
                if (item?.source_path === filename + "." + extension) {
                    return { ...item, is_selected: true };
                }
                return item;
            }));
            setDisplayedSources(prev => {
                return prev?.map(item => {
                    if (item.source_path === oldFilename) {
                        console.log(true);
                        return { ...item, source_path: filename + "." + extension };
                    }
                    return item;
                });
            });
            onHide();
            toast('Source renamed successfully', { className: `p-2 rounded-md bg-green-600 text-white`, theme });
        } catch (error) {
            console.log(error);
            toast('Something bad happened', { className: `p-2 rounded-md bg-red-600 text-white`, theme });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
        >

            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className="flex flex-col">
                    <label htmlFor="indexName" className={`block text-sm font-medium ${theme === 'dark' && 'text-gray-300'}`}>
                        Rename source
                    </label>
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            name="indexName"
                            placeholder='Type index name here'
                            id='indexName'
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            className={`flex-1 block w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' && 'bg-textColor-300'}`}
                            required
                            onKeyDown={(e) => e.key === 'Enter' && updateFilename()}
                        />
                        <span className={`${theme === 'light' ? 'text-textColor-100' : 'text-textColor-200'}`}>.{extension}</span>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center gap-3 ${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2  rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Cancel
                    </span>}
                </div>

                <div
                    className={`flex items-center justify-center gap-2  rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={updateFilename}
                >
                    <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Save
                    </span>
                </div>
            </Modal.Footer>
        </Modal>
    );
};

const ContentSection = ({
    onThumbnailClick,
    handleCheckboxChange,
    setKnowledgeBase,
    setUploadedSources,
    leftWidth, maxWidth

}) => {
    const {
        isPlayerReady,
        resourceURL,
        isFileUploading, setIsFileUploading,
        setDisplayedSources,
        showMetadata,
        categoryOptions,
        currentResource,
        setCurrentResource,
        workspaceContainer,
        player,
        displayedSources,
        knowledgeBase,
        setGeneratedResources,
        selectedCategory,
        setActiveView,
        setChatLoaded,
        sourcesTobeCommited, setSourcesTobeCommited,
        selectedSources,
        selectedAll,
        setSelectedAll,
        theme,
        chatLoaded
    } = useContext(MainContext);

    const categoryValues = categoryOptions.map((option) => option.value);

    const formatOptions = [
        { value: "all", label: "All" },
        { value: "video", label: "Videos" },
        { value: "pdf", label: "PDFs" },
        { value: "img", label: "Images" },
    ];

    const [isSearching, setIsSearching] = useState(false);
    const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
    const [showSourceExplorer, setShowSourceExplorer] = useState(false);
    const [showFileFormatsModal, setShowFileFormatsModal] = useState(false);
    const [showCategoriesModal, setShowCategoriesModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // True when a resource is being deleted
    const [clickedIndex, setClickedIndex] = useState(null);
    // const [isUploading, setIsUploading] = useState(false);
    // Flag indicating weather source Explorer modal was opened by clicking the "Source Explorer" button
    // or not
    const [isOpenedFromSourceExplorerBtn, setIsOpenedFromSourceExplorerBtn] =
        useState();

    useEffect(() => {
        const makeRequest = async () => {
            try {
                const data = await makeApiRequest(
                    "/content",
                    "post",
                    JSON.stringify(categoryValues)
                );
                setKnowledgeBase(data);
            } catch (error) {
                console.warn(error);
            }
        };

        makeRequest();
    }, [categoryOptions]);

    useEffect(() => {
        if (isPlayerReady && resourceURL && currentResource?.file_type === "video") {
            const timestamp = currentResource?.timestamp; // Make sure you have the timestamp here
            if (timestamp && Number.isInteger(+timestamp))
                player.current.seekTo(typeof timestamp === "number" ? timestamp : timeToSeconds(timestamp));
            else;
        }
    }, [isPlayerReady, currentResource, currentResource?.timestamp]);

    useEffect(() => {
        // Check if every item in knowledgeBase is selected
        const allSelected = knowledgeBase.every((item) => item.is_selected);

        // Update selectedAll state based on the check
        setSelectedAll(allSelected);
    }, [knowledgeBase]);

    const deleteResource = async (event, items) => {
        try {
            setIsDeleting(true);
            setClickedIndex(items[0]);

            const payload = items.map((item) => {
                return {
                    category: item.category,
                    fileName: item.source_path,
                    fileType: item.file_type,
                };
            });

            await makeApiRequest(`/delete`, "post", { sources: payload });
            setDisplayedSources(prev => prev.filter(item => item.source_path !== items[0].source_path));
            toast('Source deleted successfully', { className: `p-2 rounded-md`, theme });
            if (items.find(i => i?.source_path === currentResource?.source_path)) {
                setCurrentResource(null);
                // setActiveView(() => {
                //     if (selectedStory.text.length > 0) {
                //         return "story";
                //     }
                //     if (selectedNote.text.length > 1) {
                //         return "note";
                //     }
                //     return null;
                // });
            }

            // remove all items in the items array from knowledgebase
            // item.source_path !== items[0].source_path
            setKnowledgeBase((prev) => prev.filter(item => {
                return !items.some(i => i.source_path === item.source_path);
            }));

            setChatLoaded(false);
            const { chat_is_initialized } = await makeApiRequest(
                `/chat/${selectedCategory}`,
                "post",
                JSON.stringify({
                    sources: selectedSources,
                    category: selectedCategory,
                    selectedAll,
                    reinitialize: true,
                })
            );
            setChatLoaded(chat_is_initialized);
            const data = await makeApiRequest(
                `/content`,
                "post",
                JSON.stringify(categoryValues)
            );
            // setKnowledgeBase(data);
            // update knowledgebase so that it gets populated with the data value and also update the is_selected value to either true or false depending if an item in data exists in the sourcesTobeCommitted array
            let updatedKnowledgeBase = data.map(item => {
                let selected = sourcesTobeCommited.find(s => s.source_path === item.source_path);

                if (selected) {
                    return { ...item, is_selected: true };
                } else {
                    return item;
                }
            });

            setKnowledgeBase(updatedKnowledgeBase);

            setCurrentResource(null);
            // prev.pop();
            // setActiveView(prev => prev?.length > 1 ? prev?.filter(item => item !== "resource") : []);
            // setActiveView(() => {
            //     if (selectedStory.text.length > 0) {
            //         return "story";
            //     }
            //     if (selectedNote.text.length > 1) {
            //         return "note";
            //     }
            //     return null;
            // });
        } catch (error) {
            setIsDeleting(false);
            console.log(error);
        } finally {
            setIsDeleting(false);
            setGeneratedResources(prev => prev?.filter(item => item.source_path !== items[0].source_path));
        }
    };

    // const [isUploading, setIsUploading] = useState(false);
    const handleUpload = async (event, fileFormat, _files) => {
        try {
            setIsFileUploading(true);
            const files = _files || Array.from(event.target.files);
            const processedFiles = files.map(file => file.name);

            setUploadedSources(processedFiles); // Updates state but is asynchronous

            const formData = new FormData();
            files.forEach(file => {
                formData.append("file", file);
                formData.append("category", selectedCategory);
                formData.append("fileType", file.type);
            });

            await makeApiRequest("/upload", "post", formData, { 'Content-type': "multipart/form-data" });

            toast('Upload complete. Generate metadata from the right panel', { className: "p-2 rounded-md", theme });
            // setActiveTab('genMetadata');

            // Fetch updated content
            const data = await makeApiRequest("/content", "post", JSON.stringify(categoryValues));

            // Filter sources that match the uploaded files
            const sourcesToAdd = data.filter(item => processedFiles.includes(item.source_path));

            // setSourcesTobeCommited(prev => [...new Set([...prev, ...sourcesToAdd.map(item => ({ ...item, is_selected: true }))])]); // Ensure uniqueness

            // Update knowledge base
            setKnowledgeBase(data.map(item => ({
                ...item,
                is_selected: sourcesToAdd.some(s => s.source_path === item.source_path) || sourcesTobeCommited.find(i => i.source_path === item.source_path)?.is_selected,
            })));

            // add new uploaded sources to displayedSources
            setDisplayedSources(prev => {
                const newSources = sourcesToAdd.filter(item => !prev.some(i => i.source_path === item.source_path));
                return [...prev, ...newSources.map(item => ({ ...item, is_selected: true }))];
            });

            setCurrentResource(sourcesToAdd[0]);

            if (sourcesToAdd.length > 0) {
                setActiveView('resource');
            }

        } catch (error) {
            console.error(error);
            toast(error?.response?.data?.error, { className: 'p-2 rounded-md z-20', theme });
            setIsFileUploading(false);
        } finally {
            setIsFileUploading(false);
            setShowAddModal(false);
        }
    };

    const handleExploreSources = () => {
        setShowSourceExplorer(true);
        setIsOpenedFromSourceExplorerBtn(true);
    };
    const onHideSourceExplorer = () => {
        setShowSourceExplorer(false);
    };
    /**
     * Function to open a modal showing all categories
     */
    const handleAddNewResource = () => {
        setShowCategoriesModal(true);
    };

    const handleSelectAllCheckboxChange = (path, isChecked) => {
        const pathSegments = path.split("/").filter(Boolean); // Removes empty strings from array
        const category = pathSegments[0];
        const format = pathSegments[1];

        // if (isChecked) {
        if (category === undefined) {
            setSelectedAll(isChecked);
            setKnowledgeBase((prev) => {
                return prev.map((item) => {
                    return { ...item, is_selected: isChecked };
                });
            });
            setSourcesTobeCommited(isChecked ? knowledgeBase : []);
            setDisplayedSources(knowledgeBase.map((item) => {
                return { ...item, is_selected: isChecked };
            }));
        }

        else if (category !== undefined && format === undefined) {
            const updatedKnowledgeBase = knowledgeBase.map((item) => {
                //! what about if all the sources in KB have "all" by default?
                if (item.category.includes(category)) {
                    item.is_selected = isChecked;
                }
                return item;
            });
            setKnowledgeBase(updatedKnowledgeBase);
            setSourcesTobeCommited(updatedKnowledgeBase.filter((item) => item.is_selected));
        }
        else if (category !== undefined && format !== undefined) {
            const updatedKnowledgeBase = knowledgeBase.map((item) => {
                if ((category === 'all' || item.category.includes(category)) && (item.file_type === format || format === "all")) {
                    item.is_selected = isChecked;
                }
                return item;

            });
            setKnowledgeBase(updatedKnowledgeBase);
            setSourcesTobeCommited(updatedKnowledgeBase.filter((item) => item.is_selected));
            // setDisplayedSources(updatedKnowledgeBase.filter((item) => item.is_selected));
        }
        // } else {
        //     if (category === undefined) {
        //         setSelectedAll(false);
        //         setKnowledgeBase((prev) => {
        //             return prev.map((item) => {
        //                 return { ...item, is_selected: false };
        //             });
        //         });
        //         setSourcesTobeCommited([]);
        //         setDisplayedSources(knowledgeBase.map((item) => {
        //             return { ...item, is_selected: false };
        //         }));
        //     } else if (category !== undefined && format === undefined) {
        //         const updatedKnowledgeBase = knowledgeBase.map((item) => {
        //             if (item.category.includes(category)) {
        //                 item.is_selected = false;
        //             }
        //             return item;
        //         });
        //         setKnowledgeBase(updatedKnowledgeBase);
        //         setSourcesTobeCommited(updatedKnowledgeBase.filter((item) => item.is_selected));
        //     } else if (category !== undefined && format !== undefined) {
        //         const updatedKnowledgeBase = knowledgeBase.map((item) => {
        //             if ((category === 'all' || item.category.includes(category)) && (item.file_type === format || format === "all")) {
        //                 item.is_selected = false;
        //             }
        //             return item;
        //         });
        //         setKnowledgeBase(updatedKnowledgeBase);
        //         setSourcesTobeCommited(updatedKnowledgeBase.filter((item) => item.is_selected));
        //         setDisplayedSources(updatedKnowledgeBase.filter((item) => item.is_selected));
        //     }
        // }
    };

    // const handleUnselectAllCheckboxChange = () => {
    //     const updatedKnowledgeBase = knowledgeBase.map((item) => {
    //         return { ...item, is_selected: false };
    //     });
    //     setKnowledgeBase(updatedKnowledgeBase);
    //     setSelectedSources([]);
    //     setSourcesTobeCommited([]);
    //     setDisplayedSources(prev => prev.map(item => ({ ...item, is_selected: false })));
    //     // setDisplayedSources([]);
    //     // setActiveView(null);
    //     // setSourcesAfterUncheckCrispWiz(sourcesTobeCommited);
    // };

    // const handleSelectAllSources = () => {
    //     setDisplayedSources(prev => prev.map(item => ({ ...item, is_selected: true })));
    //     // update knowledgebase depending on the items selected in displayedSources
    //     setKnowledgeBase(prev => {
    //         console.log(prev?.source_path);
    //         let itemExist = displayedSources?.find(i => i?.source_path === prev?.source_path);
    //         console.log(itemExist);
    //         if (itemExist) {
    //             return { ...prev, is_selected: true };
    //         }
    //         return prev;
    //     });
    // };

    const [isIndexModalOpen, setIsIndexModalOpen] = useState(false);
    function openIndexModal() {
        setIsIndexModalOpen(true);
    }

    function hideIndexModal() {
        setIsIndexModalOpen(false);
    }

    function handleToggleCheckSources(isChecked) {
        if (isChecked) {
            setDisplayedSources(prev => prev.map(item => ({ ...item, is_selected: true })));
            // update knowledgebase depending on the items selected in displayedSources
            const updatedKnowledgeBase = knowledgeBase.map((prev) => {
                let itemExist = displayedSources?.find(i => i?.source_path === prev?.source_path);
                if (itemExist) {
                    return { ...prev, is_selected: true };
                }
                return prev;
            });
            setKnowledgeBase(updatedKnowledgeBase);
        } else {
            const updatedKnowledgeBase = knowledgeBase.map((item) => {
                return { ...item, is_selected: false };
            });
            setKnowledgeBase(updatedKnowledgeBase);
            // setSelectedSources([]);
            setSourcesTobeCommited([]);
            setDisplayedSources(prev => prev.map(item => ({ ...item, is_selected: false })));
        }
    }

    // function handleToggleSelectedSources(isChecked) {
    //     if (isChecked) {

    //     } else {

    //     }
    // }

    const [isMetadataVisible, setIsMetadataVisible] = useState(false);
    const [hoveredSource, setHoveredSource] = useState(null);
    const handleMouseEnter = (sourcePath) => {
        setHoveredSource(sourcePath);
    };
    const handleMouseLeave = () => {
        if (showSourceContextMenu === null) {
            setHoveredSource(null);
        }
    };

    const [showAddModal, setShowAddModal] = useState(false);
    function handleAddModal(state) {
        setShowAddModal(state);
    }

    const [showSourceContextMenu, setShowSourceContextMenu] = useState(null);
    function handleOpenSourceContextMenu(e, sourcePath) {
        e.stopPropagation();
        setShowSourceContextMenu(sourcePath);
    }

    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                // setIsUpdateFilenameModalOpen(false);
                setShowSourceContextMenu(null);
                setHoveredSource(null);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const [filename, setFilename] = useState('');
    const [isUpdateFilenameModalOpen, setIsUpdateFilenameModalOpen] = useState(false);
    const [updatingSource, setUpdatingSource] = useState(null);
    function handleOpenFilenameUpdateModal(event, source) {
        event.stopPropagation();
        setFilename(source?.source_path.split('.')?.slice(0, -1).join('.') || '');
        setUpdatingSource(source);
        setIsUpdateFilenameModalOpen(true);
    }



    return (
        <>
            {!showMetadata && <section className={`relative flex flex-col items-start h-full`}>



                <div className="w-full">
                    <div className="w-full max-w-4xl pr-3">
                        {/* home */}
                        {/* <div
                            className={`source-explorer flex mb-1 items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                        >
                            <HomeIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                            <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Home</span>
                        </div> */}
                        {/* Ingestion */}
                        <div className="flex flex-col justify-start gap-2 mb-1">
                            {/* <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Understanding</span> */}
                            <div className="flex flex-wrap items-center gap-0">
                                <div
                                    className={`source-explorer flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                                    onClick={() => handleAddModal(true)}
                                >
                                    <AddIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                    <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Add sources</span>

                                </div>

                            </div>
                        </div>
                        {/* mrag */}
                        {/* <div className="flex flex-col justify-start gap-2 mb-2"> */}
                        {/* <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Story Generation</span> */}
                        {/* <div className="flex flex-wrap items-center"> */}
                        <div
                            className={`source-explorer flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                            onClick={handleExploreSources}
                        >
                            <FolderOpenIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                            <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Existing sources</span>
                        </div>
                        <div className="global-search">
                            <div
                                className={`flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                                onClick={() => setIsSearching(!isSearching)}
                            >
                                <SearchOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} onClick={() => setIsSearching(false)}>Discovery</span>
                            </div>
                        </div>
                        {
                            isSearching && (
                                <div className="flex items-center gap-2">
                                    <SearchSection chatLoaded={chatLoaded} className='flex-1' />
                                </div>
                            )
                        }
                    </div>
                    {/* </div> */}
                    {/* Settings */}
                    {/* <div
                            className={`source-explorer flex items-center justify-center gap-2 px-2 py-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                        >
                            <SettingsIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                            <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Settings</span>
                        </div> */}
                    {/* </div> */}
                    {/* <IndexModal show={isIndexModalOpen} onHide={hideIndexModal} handleUpload={handleUpload} /> */}
                    <AddSourceModal show={showAddModal} setShowAddModal={setShowAddModal} isUploading={isFileUploading} setIsUploading={setIsFileUploading} onHide={() => handleAddModal(false)} handleUpload={handleUpload} />
                    {showSourceExplorer && (
                        <SourceExplorer
                            show={showSourceExplorer}
                            onHide={onHideSourceExplorer}
                            knowledgeBase={knowledgeBase}
                            setKnowledgeBase={setKnowledgeBase}
                            categories={categoryOptions}
                            formats={formatOptions}
                            isDeleting={isDeleting}
                            clickedIndex={clickedIndex}
                            onThumbnailClick={onThumbnailClick}
                            deleteResource={deleteResource}
                            handleCheckboxChange={handleCheckboxChange}
                            handleSelectAllCheckboxChange={handleSelectAllCheckboxChange}
                            isOpenedFromSourceExplorerBtn={isOpenedFromSourceExplorerBtn}
                            className="modal"
                        />
                    )}

                    {/* <CategoriesModal
                        show={showCategoriesModal}
                        onHide={() => setShowCategoriesModal(false)}
                        categoryOptions={categoryOptions}
                        setShowFileFormatsModal={setShowFileFormatsModal}
                        handleUpload={handleUpload}
                    /> */}
                </div>

                <div className="flex flex-col flex-1 w-full h-full max-h-full overflow-y-auto">
                    <BaseHeading text={`Sources (${displayedSources?.length} selected & ${displayedSources?.filter(i => i?.is_selected)?.length} checked.)`} className="mt-4" />

                    {/* <div className="w-fit">
                        <CustomButton onClick={handleSelectAllSources} className="my-0 text-primary-300">Check all sources</CustomButton>
                    </div> */}
                    {displayedSources?.length > 0 && <div className="flex items-center mt-4 ">
                        <span
                            className={`flex-1 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                }`}
                        >
                            check all sources
                        </span>
                        <Checkbox
                            className={`select-all-checkbox p-0 "
                                }`}
                            checked={displayedSources?.every(item => item?.is_selected)}
                            onChange={(e) => handleToggleCheckSources(e.target.checked)}
                            inputProps={{ "aria-label": "Select All Sources" }}
                            label="Check All Sources"
                        />
                    </div>}

                    {/* <div className="flex items-center mt-4 ">
                        <span
                            className={`flex-1 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                }`}
                        >
                            select all sources
                        </span>
                        <Checkbox
                            className={`select-all-checkbox p-0 "
                                }`}
                            checked={displayedSources?.every(item => item?.is_selected)}
                            onChange={(e) => handleToggleSelectedSources(e.target.checked)}
                            inputProps={{ "aria-label": "Select All Sources" }}
                            label="Select All Sources"
                        />
                    </div> */}

                    <div className="flex flex-col flex-1 w-full h-full overflow-y-hidden selected-sources-container">
                        {
                            displayedSources?.length > 0 && <div className={` h-full gap-2  w-full max-w-full mt-4 overflow-y-auto ${theme === 'dark' ? '!border !border-textColor-300' : 'border'} empty:!border-none`}>
                                {/* {displayedSources?.slice(0).reverse().map((item, index) => {
                                    // if (canRenderSourceThumbnail(item)) {
                                    return (<ContentPanelThumbnail
                                        key={index}
                                        index={index}
                                        isDeleting={isDeleting}
                                        clickedIndex={clickedIndex}
                                        item={item}
                                        handleCheckboxChange={handleCheckboxChange}
                                        onThumbnailClick={onThumbnailClick}
                                        deleteResource={deleteResource}
                                    />);
                                    // }
                                })} */}
                                {
                                    displayedSources?.slice(0).reverse().map((option) => <div key={option?.source_path} className={`flex w-full max-w-full cursor-pointer py-2 px-1 ${showSourceContextMenu === null && (theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20')}`} onMouseEnter={() => handleMouseEnter(option?.source_path)} onMouseLeave={handleMouseLeave} onClick={(event) => onThumbnailClick(event, option)}>

                                        <div className="relative flex items-center flex-1 w-full max-w-full gap-2">
                                            {showSourceContextMenu === option?.source_path && <div ref={dropdownRef} className={` absolute left-0 top-full z-10 flex flex-col items-center gap-2 p-1 rounded-md shadow-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                                                <div className={`flex items-center gap-2 p-2 ${theme === "light" ? 'hover:bg-textColor-100/40' : 'text-textColor-100 hover:bg-slate-800/40'}`} onClick={(event) => { event.stopPropagation(); deleteResource(event, [option]); }}>
                                                    <DeleteOutlineOutlinedIcon
                                                        className={`cursor-pointer ${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'}`}
                                                    />
                                                    <span>Remove source</span>
                                                </div>
                                                <div className={`flex items-center gap-2 p-2 ${theme === "light" ? 'hover:bg-textColor-100/40' : 'text-textColor-100 hover:bg-slate-800/50'}`}
                                                    onClick={(event) => handleOpenFilenameUpdateModal(event, option)}>
                                                    <EditOutlinedIcon
                                                        className={`cursor-pointer ${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'}`}
                                                    />
                                                    <span>Rename source</span>
                                                </div>

                                            </div>}
                                            {
                                                hoveredSource === option?.source_path && (
                                                    // <DeleteOutlineOutlinedIcon
                                                    //     onClick={(event) => { event.stopPropagation(); deleteResource(event, [option]); }}
                                                    //     style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }}
                                                    //     className="cursor-pointermr-1"
                                                    // />
                                                    <MoreHorizIcon className={`${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'} cursor-pointer`} onClick={e => handleOpenSourceContextMenu(e, option?.source_path)} />

                                                )
                                            }
                                            {
                                                option.file_type === "video" ? (
                                                    <PlayCircleOutlineOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                                ) : option.file_type === "pdf" ? (
                                                    <ArticleOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                                ) : option.file_type === "img" ? (
                                                    <ImageOutlinedIcon style={{ fontSize: "20px", color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                                ) : null
                                            }
                                            <div className="relative flex-shrink-0 w-10 h-10">
                                                {(isDeleting && clickedIndex?.source_path === option?.source_path) && (
                                                    <div className="thumbnail-loader absolute left-1/2 top-1/2 z-[5] translate-x-[-50%] translate-y-[-50%] transform">
                                                        <LoadingSpinner isSmall />
                                                    </div>
                                                )}
                                                <img className="object-cover w-full h-full rounded-md" src={`${API_ENDPOINT}/${option?.file_type === 'video' ? 'thumbnails' : option?.file_type === 'pdf' ? 'pdf-thumbnails' : 'img-thumbnails'}/${encodeURIComponent(option?.category[0])}/${encodeURIComponent(option?.thumbnail)}`}
                                                    alt="Video Thumbnail" />
                                            </div>
                                            <span className={`text-md font-medium break-all ${theme === 'dark' && 'text-textColor-100'}`}>{option.source_path.replace(/\.[^/.]+$/, '')}</span>
                                        </div>
                                        <div className="flex items-center ">
                                            <Checkbox
                                                className="p-0 !ml-1"
                                                checked={option.is_selected}
                                                onChange={(e) => handleCheckboxChange(e?.target?.checked, option)}
                                                onClick={(event) => event.stopPropagation()}
                                                inputProps={{ "aria-label": "Select source" }}
                                            />

                                        </div>
                                    </div>)
                                }
                            </div>
                        }
                        {

                            displayedSources.length > 0
                                ?
                                <>
                                    {/* {sourcesTobeCommited.some(source => source?.metadata?.embeddings_generated === true) && <div className="mx-auto w-fit">
                                        <CustomButton onClick={() => commitSelectedSources(sourcesTobeCommited.filter(source => source?.metadata?.embeddings_generated))} className="my-1 text-white bg-primary-300">{!chatLoaded ? <div className="flex items-center gap-1"><LoadingSpinner isSmall /><span>Updating...</span></div> : 'Update sources'}</CustomButton>
                                    </div>} */}
                                    {/* <div className="mx-auto w-fit">
                                        <CustomButton onClick={handleSelectAllSources} className="my-0 text-primary-300">Check all sources</CustomButton>
                                    </div>
                                    <div className="mx-auto w-fit">
                                        <CustomButton onClick={handleUnselectAllCheckboxChange} className="my-0 text-primary-300">Uncheck all sources</CustomButton>
                                    </div> */}
                                </>
                                :
                                <NoData message="No sources selected" />
                        }
                    </div>
                </div>
                {/* update file name modal */}
                {isUpdateFilenameModalOpen && <UpdateFilenameModal show={isUpdateFilenameModalOpen} onHide={() => setIsUpdateFilenameModalOpen(false)} filename={filename} extension={updatingSource?.source_path?.split('.')?.at(-1)} setFilename={setFilename} oldFilename={updatingSource?.source_path} sourceCategory={updatingSource?.category} filetype={updatingSource?.file_type} />}
            </section>}
            {/* metadata and source section */}
            {showMetadata && (
                <MetadataPanel leftWidth={leftWidth}
                    maxWidth={maxWidth} workspaceContainer={workspaceContainer} />
            )}
        </>
    );
};

export default ContentSection;
