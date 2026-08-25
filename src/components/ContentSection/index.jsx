import AddIcon from '@mui/icons-material/Add';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import { Search } from 'lucide-react';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import PermMediaOutlinedIcon from '@mui/icons-material/PermMediaOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import { Checkbox } from "@mui/material";
import { useContext, useEffect, useRef, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import makeApiRequest from "../../api";
import socket from "../../config/socket";
import { AuthContext } from '../../contexts/authContext';
import { MainContext } from "../../contexts/mainContext";
import { ProjectContext } from '../../contexts/projectContext';
import { useToast } from "../../contexts/toastContext";
import useAuth from '../../hooks/useAuth';
import { generateRandomHash, getFileType, searchByKey, sortArrayOfObjects } from '../../utils';
import AddSourceModal from "../AddSourceModal";
import AnimatedText from '../AnimatedText';
import BaseHeading from '../BaseHeading';
import CircularProgressWithLabel from "../CircularProgressWithLabel";
import GsFile from '../GsFile';
import { IndexModal } from '../IndexModal';
import LoadingSpinner from "../LoadingSpinner";
import NoData from '../NoData';
import SearchSection from '../SearchSection';
import { SettingsModal } from "../Settings/SettingsModal";
import SourceExplorer from "../SourceExplorer";
import FileUploaderModal from "../FileUploaderModal";

import IndeterminateCheckBoxOutlinedIcon from '@mui/icons-material/IndeterminateCheckBoxOutlined';

import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const UpdateFilenameModal = ({ show, onHide, filename, setFilename, extension, sourceCategory, oldFilename, filetype }) => {
    const { theme, knowledgeBase, setKnowledgeBase } = useContext(MainContext);

    const { notify } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const isTitleValid = filename.trim().length > 0;

    async function updateFilename() {
        try {
            if (!isTitleValid) {
                notify({
                    variant: "error",
                    heading: "Oops!",
                    subheading: "Filename cannot be empty.",
                });
                return;
            }

            setIsLoading(true);

            const payload = {
                category: sourceCategory,
                oldFilename,
                newFilename: filename + "." + extension,
                filetype
            };
            const response = await makeApiRequest(`/assets/${knowledgeBase.find(item => item.source_path === oldFilename)?.source_id}`, 'PATCH', JSON.stringify(payload));

            const mediaKey = ['video_url', 'pdf_url', 'thumbnail'].find(key => response[key]);

            setKnowledgeBase(prev => {
                return prev.map(item => {
                    if (item.source_path === oldFilename) {
                        return {
                            ...item,
                            thumbnail: response.thumbnail,
                            [mediaKey]: response[mediaKey],
                            source_path: `${filename}.${extension}`
                        };
                    }
                    return item;
                });
            });
            onHide();
            notify({
                variant: "success",
                heading: "Source renamed successfully!",
            });
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "Something bad happened",
            });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
        >
            <Modal.Header className={`border-0 pb-0 ${theme === 'dark' ? '!bg-textColor-300 !text-white' : ''}`}>
                <div className="flex flex-col gap-1">
                    <Modal.Title id="contained-modal-title-vcenter" className={`text-lg font-semibold ${theme === 'dark' ? 'text-textColor-100' : 'text-gray-900'}`}>
                        Rename source
                    </Modal.Title>
                    <p className={`text-sm m-0 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
                        Choose a clear filename for this source before saving.
                    </p>
                </div>
            </Modal.Header>

            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className="flex flex-col">
                    <label htmlFor="indexName" className={`block text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                        Source filename
                    </label>
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            name="indexName"
                            placeholder='Type a new source name here'
                            id='indexName'
                            value={filename}
                            onChange={(e) => setFilename(e.target.value)}
                            className={`flex-1 block w-full p-2 mt-1  rounded-xl outline-none transition ${theme === 'dark'
                                ? '!border !border-textColor-200 bg-textColor-300 text-white placeholder:text-gray-400'
                                : '!border !border-gray-300 bg-white text-gray-900'}`}
                            required
                            onKeyDown={(e) => e.key === 'Enter' && isTitleValid && updateFilename()}
                        />
                        <span className={`${theme === 'light' ? 'text-textColor-100' : 'text-textColor-200'}`}>.{extension}</span>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center justify-end gap-3 ${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <button
                    type="button"
                    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Cancel
                    </span>
                </button>

                <button
                    type="button"
                    className={`flex items-center justify-center gap-2 rounded-md px-3 py-2 w-fit transition ${!isTitleValid || isLoading
                        ? 'cursor-not-allowed text-gray-400'
                        : theme === 'dark'
                            ? 'hover:bg-purple-500/20 text-purple-300'
                            : 'hover:bg-purple-50 text-purple-600'}`}
                    onClick={isTitleValid ? updateFilename : undefined}
                    disabled={!isTitleValid || isLoading}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium`}>
                        Save title
                    </span>}
                </button>
            </Modal.Footer>
        </Modal>
    );
};

const ContentSection = ({
    onThumbnailClick,
    handleCheckboxChange,
    setKnowledgeBase,
    setUploadedSources,


}) => {
    const {
        isFileUploading, setIsFileUploading,
        setDisplayedSources,
        setShowMetadata,
        categoryOptions,
        formatOptions,
        currentResource,
        setCurrentResource,
        frameExtractionRate,
        displayedSources,
        knowledgeBase,
        setGeneratedResources,
        selectedCategory,
        setActiveView,
        setCheckedAll,
        theme,
        chatLoaded,
        setPersistedUploadedFiles,
        isDetailedMode,
        videoCaptionContext,
    } = useContext(MainContext);

    const { notify } = useToast();

    const { isSettingsModalOpen, setIsSettingsModalOpen, isProjectReadOnly } = useContext(ProjectContext);

    const { user } = useContext(AuthContext);

    const { logout } = useAuth();

    async function log() {
        localStorage.setItem('current_project', null);
        await logout();
    }

    const openUploadModal = (category = "all") => {
        setUploadModalCategory(category);
        setShowSourceExplorer(false);
        setShowUploadModal(true);
    };

    const closeUploadModal = () => {
        setShowUploadModal(false);
    };



    const [isSearching, setIsSearching] = useState(false);
    const [showSourceExplorer, setShowSourceExplorer] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadModalCategory, setUploadModalCategory] = useState("all");
    const [isDeleting, setIsDeleting] = useState(false); // True when a resource is being deleted
    const [clickedIndex, setClickedIndex] = useState(null);
    const [isOpenedFromSourceExplorerBtn, setIsOpenedFromSourceExplorerBtn] =
        useState();

    useEffect(() => {
        // Check if every item in knowledgeBase is selected
        const allSelected = knowledgeBase.every((item) => item.is_checked);

        // Update checkedAll state based on the check
        setCheckedAll(allSelected);
    }, [knowledgeBase]);

    function removeSourceFromMetadataPanel(sources) {
        // 1: retrieve all source paths from sources
        const removedSourcePaths = sources.map(source => source.source_path);

        // 2: check if source's filename exists in the array
        const sourceExists = removedSourcePaths.includes(currentResource?.source_path);

        // 3: clear currentResource if exist
        if (sourceExists) {
            setCurrentResource(null);
            setShowMetadata(false);
        }
    }

    const deleteResource = async (event, items) => {
        // console.log("deleting source...", items);
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

            // remove source from metadata panel if it's active
            removeSourceFromMetadataPanel(items);

            await makeApiRequest(`/assets/${items[0].asset_id}`, "DELETE");
            setDisplayedSources(prev => prev.filter(item => item.source_path !== items[0].source_path));

            notify({
                variant: "success",
                heading: "Source deleted successfully!",
            });
            if (items.find(i => i?.source_path === currentResource?.source_path)) {
                setCurrentResource(null);
            }

            // reflect changes to knowledgeBase
            setKnowledgeBase(prev => {
                let deletedSourcePaths = payload.map(item => item.fileName);
                return prev.filter(item => !deletedSourcePaths.includes(item.source_path));
            });

            // setCurrentResource(null);
            setActiveView(null);
        } catch (error) {
            setIsDeleting(false);
            console.log(error);
        } finally {
            setIsDeleting(false);
            setGeneratedResources(prev => prev?.filter(item => item.source_path !== items[0].source_path));
        }
    };


    const handleExploreSources = () => {
        setShowSourceExplorer(true);
        setIsOpenedFromSourceExplorerBtn(true);
    };
    const onHideSourceExplorer = () => {
        setShowSourceExplorer(false);
    };

    const handleSelectAllCheckboxChange = (sourcesToToggle, isChecked) => {
        if (Array.isArray(sourcesToToggle)) {
            const sourcePathsToToggle = new Set(sourcesToToggle.map((source) => source.source_path));

            setKnowledgeBase((prev) => {
                return prev.map((item) => {
                    if (sourcePathsToToggle.has(item.source_path)) {
                        return { ...item, is_selected: true, is_checked: isChecked };
                    }

                    return item;
                });
            });

            setCheckedAll(isChecked && sourcesToToggle.length > 0);
            return;
        }

        const pathSegments = sourcesToToggle?.split("/").filter(Boolean) || []; // Removes empty strings from array
        const category = pathSegments[0];
        const format = pathSegments[1];

        let updatedKnowledgeBase;

        if (category === undefined) {
            setCheckedAll(isChecked);
            updatedKnowledgeBase = knowledgeBase.map((item) => {
                return { ...item, is_selected: true, is_checked: isChecked };
            });
        }

        else if (category !== undefined && format === undefined) {
            updatedKnowledgeBase = knowledgeBase.map((item) => {
                if (item.category.includes(category) || category === 'all') {
                    item.is_checked = isChecked;
                    item.is_selected = true;
                }
                return item;
            });
        }
        else if (category !== undefined && format !== undefined) {
            updatedKnowledgeBase = knowledgeBase.map((item) => {
                if ((category === 'all' || item.category.includes(category)) && (item.file_type === format || format === "all")) {
                    item.is_checked = isChecked;
                    item.is_selected = true;
                }
                return item;

            });
        }

        setKnowledgeBase(updatedKnowledgeBase);
    };

    const [isIndexModalOpen, setIsIndexModalOpen] = useState(false);
    function openIndexModal() {
        setIsIndexModalOpen(true);
        setShowSourceExplorer(false);
    }

    function hideIndexModal() {
        setIsIndexModalOpen(false);
    }

    function handleToggleCheckSources(isChecked) {
        setKnowledgeBase(prev => {
            return prev.map(item => {
                // Only update if the item exists in displayedSources
                const existsInDisplayed = displayedSources.some(ds => ds.source_path === item.source_path);
                if (existsInDisplayed) {
                    return {
                        ...item,
                        is_checked: item.is_selected ? isChecked : item.is_checked,
                    };
                }
                return item;
            });
        });
    }

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
    const [shouldOpenCategoriesModal, setShouldOpenCategoriesModal] = useState(false);

    function handleAddModal(state) {
        setShowAddModal(state);
    }

    const handleOpenCategoriesModal = () => {
        setShowSourceExplorer(false);
        setShowAddModal(true);
        setShouldOpenCategoriesModal(true);
    };

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

    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
    function handleToggleSettingsMenu() {
        setIsSettingsMenuOpen((prev) => !prev);
    }

    const settingsMenuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
                setIsSettingsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const [results, setResults] = useState(displayedSources);
    const [searchValue, setSearchValue] = useState("");

    // Update results whenever displayedSources or searchValue changes
    useEffect(() => {
        let filtered = displayedSources;

        if (searchValue.trim() !== "") {
            filtered = searchByKey(displayedSources, "source_path", searchValue);
        }

        setResults(sortArrayOfObjects(filtered, "source_path"));
    }, [displayedSources, searchValue]);

    // search input handler
    const handleSearch = (e) => {
        setSearchValue(e.target.value);
    };

    // const [isUploading, setIsUploading] = useState(false);
    const [isUploadFailed, setIsUploadFailed] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("idle"); // 'idle' | 'uploading' | 'success' | 'error'
    const [uploadErrorMessage, setuploadErrorMessage] = useState("");
    /**
    * video compression
    video upload to GCP (cloud storage)
    keyframe extraction
    creating matrices
    thumbnail extraction
    audio extraction
    transcription (cleaning, etc.)
    matrices description
    summary gen
    embeddings gen
    vs initialization
    upload to DB and GCP
    */
    const [fileThumbnails, setFileThumbnails] = useState([]);

    const extractThumbnail = (file) => {
        // const thumbnails = files.map((file) => {
        const type = file.type;
        const preview =
            type.startsWith('image/') || type.startsWith('video/')
                ? URL.createObjectURL(file)
                : type.startsWith('application/pdf')
                    ? (import.meta.env.VITE_APP_ENV === "production" ? import.meta.env.VITE_STAGING_FRONTEND_URL + '/PDF-file-thumbnail.png' : "http://localhost:3000" + '/PDF-file-thumbnail.png')
                    : null;
        return preview;
        // });
        // setFileThumbnails((prev) => [...prev, ...thumbnails]);
    };
    // Utility function to clear session ID (call this when user logs out or wants fresh session)
    const clearSessionId = () => {
        localStorage.removeItem("sessionId");
        console.log('🗑️ Session ID cleared from localStorage');
    };

    // Utility function to get current session ID
    const getCurrentSessionId = () => {
        return localStorage.getItem("sessionId");
    };

    function addHashToFilename(filename, hash) {
        const lastDotIndex = filename.lastIndexOf(".");

        // If no extension
        if (lastDotIndex === -1) {
            return `${filename}_${hash}`;
        }

        const name = filename.slice(0, lastDotIndex);
        const extension = filename.slice(lastDotIndex);

        return `${name}_${hash}${extension}`;
    }

    /**
     * +++++++++++++ UPLOAD +++++++++++++++
     */

    const [isProgressStarted, setIsProgressStarted] = useState(false);
    const [progressUpdateCount, setProgressUpdateCount] = useState(0);
    const isUploadingRef = useRef(false);

    function handleConnectToUploadSocket() {

    }

    function handleProgressUpdate(data) {
        setProgressUpdateCount(prev => prev + 1);
        const currentIndex = Number(data?.currentIndex ?? -1);

        // Update knowledgeBase (source of truth); displayedSources is derived from it
        setKnowledgeBase((prev) => {
            return prev.map((source) => {
                const sourceIndex = Number(source?.index ?? -1);

                if (source.progress !== undefined && data.progress_percentage <= 100) {
                    if (currentIndex === sourceIndex) {
                        // if current progress is 100 => current source finished uploading => remove progress and step from current source
                        if (data.progress_percentage === 100) {
                            const { progress, step, ...rest } = source;
                            return {
                                ...rest,
                                ...data,
                                is_checked: true
                            };
                        }
                        if (data?.step_name === "Summarizing...") {
                            return {
                                ...source,
                                ...data,
                                progress: data.progress_percentage,
                                step: data.step_name,
                                metadata: {
                                    ...source.metadata,
                                    transcription: {
                                        content: data.content,
                                        title: "Transcription"
                                    }
                                }
                            };
                        }
                        if (data?.step_name === "Generating embeddings...") {
                            return {
                                ...source,
                                ...data,
                                progress: data.progress_percentage,
                                step: data.step_name,
                                metadata: {
                                    ...source.metadata,
                                    summary: {
                                        content: data.content,
                                        title: data.title,
                                        verbosity: data.verbosity,
                                        temperature: data.temperature
                                    }
                                }
                            };
                        }
                        const newProgress = Number(data.progress_percentage) || 0;
                        const currentProgress = Number(source.progress) || 0;

                        return {
                            ...source,
                            ...data,
                            progress: Math.max(currentProgress, newProgress),
                            step: data.step_name || source.step
                        };
                    } else if (currentIndex > sourceIndex) {
                        const { progress, step, ...rest } = source;
                        return {
                            ...rest,
                            is_checked: true
                        };
                    }
                }
                return { ...source };
            });
        });
    }


    const sessionIdRef = useRef(null);

    function startSocket() {
        if (!socket.connected) {
            socket.connect();
        }
        console.log("connecting to socket");

        socket.off('connect');
        socket.off('connected');
        socket.off('progress_update');
        socket.off('upload_error');
        socket.off('upload_complete');
        socket.off('session_joined');
        socket.off('error');

        socket.on('connect', () => {
            console.log('🔌 Socket connected with ID:', socket.id);
            const sessionId = sessionIdRef.current;
            if (sessionId) {
                console.log('🔄 Joining session after connect:', sessionId);
                socket.emit('join_upload_session', { session_id: sessionId });
            }
        });

        socket.on('connected', (data) => {
            console.log('Server confirmation:', data);
        });

        socket.io.on('reconnect_attempt', () => {
            console.log('reconnect_attempt...');
        });

        socket.io.on('reconnect', () => {
            console.log('reconnect...');
        });

        socket.on('progress_update', handleProgressUpdate);

        socket.on('upload_error', (data) => {
            console.log('Upload error:', data);
            setIsUploadFailed(true);
            setUploadStatus('error');
            setuploadErrorMessage(data.error_message || 'Upload failed. Please try again.');
        });

        socket.on('upload_complete', (data) => {
            console.log('*****************************Upload complete:*********************', data);
            if (data.success) {
                setUploadStatus('success');
                setIsFileUploading(false);
                setIsProgressStarted(false);
                setKnowledgeBase((prev) => prev.map((source) => {
                    const sourceIndex = Number(source?.index ?? -1);
                    const completedIndex = Number(data?.currentIndex ?? -1);
                    if (completedIndex >= 0 && sourceIndex === completedIndex) {
                        const { progress, step, ...rest } = source;
                        return { ...rest, is_checked: true };
                    }
                    return source;
                }));
            } else {
                setIsUploadFailed(true);
                setUploadStatus('error');
            }
        });

        socket.on('session_joined', (data) => {
            if (data.session_id && data.session_id === sessionIdRef.current) {
                localStorage.setItem('sessionId', data.session_id);
                console.log('💾 Session ID saved to localStorage:', data.session_id);
            }
        });

        socket.on('error', (data) => {
            console.log('General error:', data);
        });
    }

    function disconnectSocket() {
        console.log("disconnecting from socket");
        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
        });

        socket.off('connect');
        socket.off('disconnect');
        socket.off('connect_error');
        socket.off('connected');
        socket.off('progress_update');
        socket.off('upload_error');
        socket.off('upload_complete');
        socket.off('session_joined');
        socket.off('error');
        socket.disconnect();
    }

    const handleUpload = async (event, fileFormat, _files, isFineGrained = false) => {
        console.log("Starting upload...");

        const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        sessionIdRef.current = sessionId;
        localStorage.setItem("sessionId", sessionId);
        console.log("🆕 Created new session_id for this upload batch:", sessionId);

        startSocket();
        try {
            setUploadStatus("uploading");
            setIsUploadFailed(false);
            setIsFileUploading(true);
            setIsProgressStarted(true);
            setShowAddModal(false);
            setFileThumbnails([]);
            setProgressUpdateCount(0); // Reset progress update counter

            const files = _files || Array.from(event.target.files);
            const processedFiles = files.map(file => file.name);

            setUploadedSources(processedFiles);

            const formData = new FormData();

            console.log("Joining session room before upload:", sessionId);
            console.log("Current socket ID:", socket.id);
            socket.emit("join_upload_session", { session_id: sessionId });

            await new Promise(resolve => setTimeout(resolve, 500));

            files.forEach((file, index) => {
                formData.append("file", file);
                formData.append("index_id", categoryOptions.find(item => item.value === selectedCategory)?.id);
                formData.append("fileType", file.type);
                formData.append("session_id", sessionId);
                formData.append("isDetailedMode", isDetailedMode);
                formData.append("videoCaptionContext", videoCaptionContext);
                formData.append("fileIndex", String(index));
            });
            formData.append("isFineGrained", isFineGrained);
            if (frameExtractionRate) {
                formData.append("frameExtractionRate", JSON.stringify(frameExtractionRate));
            }

            //TODO: loop throught files and populate the "initialSources" with the initial properties


            const fileSources = files.map((file, index) => {
                const totalSourcesWithSameFilename = knowledgeBase.filter(item => item.source_path === file.name).length;

                return {
                    category: [selectedCategory],
                    index_id: categoryOptions.find(item => item.value === selectedCategory)?.id,
                    file_type: getFileType(file.type),
                    source_path:
                        totalSourcesWithSameFilename > 0
                            ? addHashToFilename(file.name, generateRandomHash(3))
                            : file.name,
                    thumbnail: extractThumbnail(file) || null,
                    is_checked: false,
                    is_selected: true,
                    progress: 0,
                    originalSourceLanguage: "en",
                    step: "Initialize ingestion...",
                    metadata: {
                        chapters: {},
                        embeddings_generated: false,
                        faqs: [],
                        highlights: {},
                        keywords: [],
                        summary: {},
                        transcription: {}
                    },
                    index
                };
            });

            // count files to be uploaded
            const totalFiles = files.length;

            setPersistedUploadedFiles(fileSources);
            setKnowledgeBase((prev) => {
                // Merge existing knowledgeBase with new fileSources, avoiding duplicates
                const existingPaths = new Set(prev.map(item => item.source_path));
                const newSources = fileSources.filter(item => !existingPaths.has(item.source_path));
                return [...newSources, ...prev];
            });

            // If real progress is still < 3% after 10s, show a 3% pre-processing cue
            setTimeout(() => {
                setKnowledgeBase(prev => prev.map(item => {
                    if (!('progress' in item)) return item;

                    const currentProgress = Number(item.progress) || 0;
                    if (currentProgress < 3) {
                        return {
                            ...item,
                            progress: 3,
                            step: "Source pre-processing..."
                        };
                    }

                    return item;
                }));
            }, 10000);

            // await delay(3000);
            const { uploaded_data } = await makeApiRequest("/assets", "POST", formData, { 'Content-type': "multipart/form-data" });

            // ----------  Update knowledge base ----------
            setKnowledgeBase(prev => [...uploaded_data, ...prev.slice(totalFiles)]);

            // show success message
            notify({
                variant: "success",
                heading: "Source uploaded successfully!",
            });

            setCurrentResource(prev => prev && uploaded_data[0]);

            if (uploaded_data.length > 0) {
                setActiveView('resource');
            }


        } catch (error) {
            setIsUploadFailed(true);
            setUploadStatus("error");
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "Failed to upload new source. Please try again.",
            });
            setuploadErrorMessage(error?.response?.data?.error || 'Upload failed. Please try again.');
            setKnowledgeBase(prev => prev.filter(item => !('progress' in item)));
        } finally {
            disconnectSocket();
            setIsFileUploading(false);
            setIsProgressStarted(false);
        }
    };

    useEffect(() => {
        if (uploadStatus === "success" || uploadStatus === "error") {
            const timer = setTimeout(() => {
                setUploadStatus("idle"); // unmount toast
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [uploadStatus]);


    function handleClearAllSources() {
        setKnowledgeBase(prev => {
            return prev.map(item => ({ ...item, is_selected: false, is_checked: false }));
        });
    }

    function handleClearSource(sourceId) {
        setKnowledgeBase(prev => {
            return prev.map(item => {
                if (item.source_id === sourceId) {
                    return { ...item, is_selected: false, is_checked: false };
                }
                return item;
            });
        });
    }

    return (
        <>
            {/* this is where i show the list of displayedSources */}
            <section className={`relative flex flex-col items-start h-full`}>
                <div className="w-full">
                    <div className="w-full max-w-4xl pr-3">
                        <div className="flex flex-col gap-0">

                            <div
                                data-tooltip-variant={theme}
                                data-tooltip-class-name={theme === "light" && "border font-semibold"}
                                data-tooltip-id="add-sources-tooltip"
                                data-tooltip-content="Upload sources or create new indexes."
                                id="upload_sources"
                                className={`source-explorer flex items-center justify-center gap-2 px-1 py-1 rounded-md w-fit ${theme === 'light' ? 'hover:bg-textColor-100/25' : 'hover:bg-light-hover-200/20'} ${isProjectReadOnly ? "cursor-default opacity-50" : "cursor-pointer opacity-100"}`}
                                onClick={() => !isProjectReadOnly && handleAddModal(true)}
                            >
                                <AddIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                                    Add sources
                                </span>

                                <Tooltip id="add-sources-tooltip" />
                            </div>

                            <div
                                data-tooltip-variant={theme}
                                data-tooltip-class-name={theme === "light" && "border font-semibold"}
                                data-tooltip-id="source-explorer-tooltip"
                                data-tooltip-content="Explore and manage your sources."
                                id="source_explorer"
                                className={`source-explorer flex items-center justify-center gap-2 px-1 py-1 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-textColor-100/25' : 'hover:bg-light-hover-200/20'}`}
                                onClick={handleExploreSources}
                            >
                                <PermMediaOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Collection</span>

                                <Tooltip id="source-explorer-tooltip" />
                            </div>

                            <div
                                data-tooltip-variant={theme}
                                data-tooltip-class-name={theme === "light" && "border font-semibold"}
                                data-tooltip-id="discovery-tooltip"
                                data-tooltip-content="Search across your knowledge base."
                                id="discovery"
                                className={`flex items-center justify-center gap-2 px-1 py-1 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-textColor-100/25' : 'hover:bg-light-hover-200/20'}`}
                                onClick={() => setIsSearching(!isSearching)}
                            >
                                <SearchOutlinedIcon className={`${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'}`} />
                                <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} onClick={() => setIsSearching(false)}>Discovery</span>

                                <Tooltip id="discovery-tooltip" />
                            </div>
                            {
                                isSearching && (
                                    <div className="flex items-center mt-2 gap-2">
                                        <SearchSection
                                            chatLoaded={chatLoaded}
                                            className='flex-1' />
                                    </div>
                                )
                            }
                        </div>
                    </div>
                    <IndexModal show={isIndexModalOpen} onHide={hideIndexModal} handleUpload={handleUpload} />
                    <AddSourceModal
                        show={showAddModal}
                        setShowAddModal={setShowAddModal}
                        isUploading={isFileUploading}
                        setIsUploading={setIsFileUploading}
                        openCategoriesModal={shouldOpenCategoriesModal}
                        onHide={() => {
                            handleAddModal(false);
                            setShouldOpenCategoriesModal(false);
                        }}
                        handleUpload={handleUpload}
                    />
                    {showSourceExplorer && (
                        <SourceExplorer
                            show={showSourceExplorer}
                            setShowSourceExplorer={setShowSourceExplorer}
                            onHide={onHideSourceExplorer}
                            showIndexModal={openIndexModal}
                            handleUpload={handleUpload}
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
                            onOpenUploadModal={openUploadModal}
                            onOpenCategoriesModal={handleOpenCategoriesModal}
                            className="modal"
                        />
                    )}
                    {showUploadModal && (
                        <FileUploaderModal
                            show={showUploadModal}
                            onHide={closeUploadModal}
                            hideIndexModal={closeUploadModal}
                            indexName={uploadModalCategory}
                            handleUpload={handleUpload}
                        />
                    )}
                </div>

                <div className="flex flex-col flex-1 w-full h-full max-h-full overflow-y-auto">

                    <BaseHeading text={`Workspace sources (${results?.length} selected & ${results?.filter(i => i?.is_checked)?.length} checked.)`} className={` mt-4`} />

                    {displayedSources.length > 0 && (
                        <div className={`mt-2 max-w-96 flex items-center pl-2 bg-transparent rounded-lg overflow-hidden ${theme === "light" ? "!border !border-gray-300  text-black" : "!border !border-textColor-200/40 text-white"}`}>
                            <Search size={18} className={`pr-0 mr-0 ${theme === 'light' ? 'text-textColor-200' : 'text-textColor-100'}`} />
                            <input
                                type="text"
                                placeholder="Search in workspace sources..."
                                value={searchValue}
                                onChange={handleSearch}
                                className={`flex-1 mt-2 mb-2 py-1 text-sm bg-transparent outline-none ${theme === 'light' && ' text-textColor-100'} w-full lg:w-[75%] rounded-lg !pl-[10px]`}
                            />
                            {/* <input className={`mt-2 mb-2 py-1 text-sm bg-transparent outline-none ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200 text-textColor-100'} w-full lg:w-[75%] rounded-lg !pl-[10px]`} placeholder={"Search in workspace sources..."} value={searchValue} onChange={handleSearch} /> */}
                        </div>
                    )}

                    {results?.length > 0 && (
                        <div className="flex items-center mt-2">
                            <span
                                className={`flex-1 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                    }`}
                            >
                                check all sources
                            </span>
                            <Checkbox
                                className={`p-0 !ml-1 !border-primary-300 !text-primary-300`}
                                checked={results?.every(item => item?.is_checked)}
                                onChange={(e) => handleToggleCheckSources(e.target.checked)}
                                inputProps={{ "aria-label": "Check all sources" }}
                                label="Check All Sources"
                            />
                            {
                                !isProjectReadOnly && (
                                    <IndeterminateCheckBoxOutlinedIcon
                                        className={`${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} cursor-pointer`}
                                        title="Clear all sources"
                                        onClick={handleClearAllSources}
                                        titleAccess='clear all sources'
                                    />
                                )
                            }
                        </div>
                    )}

                    <div className="flex flex-col flex-1 w-full h-full overflow-y-hidden selected-sources-container">
                        {
                            results?.length > 0 && (
                                <div className={`h-full gap-2 w-full max-w-full mt-2 overflow-y-auto ${theme === 'dark' ? '!border !border-textColor-300' : 'border'} rounded-xl empty:!border-none`}>
                                    {
                                        results?.map((option) => <div key={option?.source_path} className={`flex w-full max-w-full cursor-pointer rounded-xl py-2 px-1 ${showSourceContextMenu === null && (theme === 'light' ? 'hover:bg-textColor-100/25' : 'hover:bg-light-hover-200/10')}`} onMouseEnter={() => handleMouseEnter(option?.source_path)} onMouseLeave={handleMouseLeave} onClick={(event) => onThumbnailClick(event, option)}>

                                            <div className="relative flex items-center flex-1 w-full max-w-full gap-2">
                                                {
                                                    (showSourceContextMenu === option?.source_path && !('progress' in option)) && (

                                                        <div ref={dropdownRef} className={` absolute left-0 top-full z-10 flex flex-col p-1 rounded-md shadow-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>

                                                            <div className={`flex gap-2 py-2 pr-10 pl-1 font-medium text-left ${theme === "light" ? 'hover:bg-textColor-100/15' : 'text-textColor-100 hover:bg-slate-800/50'}`}
                                                                onClick={(event) => handleOpenFilenameUpdateModal(event, option)}>
                                                                <EditOutlinedIcon
                                                                    className={`cursor-pointer ${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'}`}
                                                                />
                                                                <span>Rename</span>
                                                            </div>

                                                            <hr className="m-0" />

                                                            <div className={`flex gap-2 py-2 pr-10 pl-1 font-medium text-left ${theme === "light" ? 'hover:bg-textColor-100/15' : ' hover:bg-slate-800/40'} text-red-400`} onClick={(event) => { event.stopPropagation(); deleteResource(event, [option]); }}>
                                                                <DeleteOutlineOutlinedIcon
                                                                    className={`cursor-pointer`}
                                                                />
                                                                <span>Delete</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                {
                                                    !isProjectReadOnly && (
                                                        !('progress' in option) ? (
                                                            (option?.source_path === hoveredSource || showSourceContextMenu === option?.source_path) && (
                                                                <MoreVertOutlinedIcon className={`${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'} cursor-pointer`} onClick={e => handleOpenSourceContextMenu(e, option?.source_path)} />
                                                            )
                                                        ) : (
                                                            <CircularProgressWithLabel value={option.progress} variant="determinate" isUploadFiled={false} />
                                                        )
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
                                                <div className="relative flex-shrink-0 w-12 h-12">
                                                    {(isDeleting && clickedIndex?.source_path === option?.source_path) && (
                                                        <div className="thumbnail-loader absolute left-1/2 top-1/2 z-[5] translate-x-[-50%] translate-y-[-50%] transform">
                                                            <LoadingSpinner isSmall />
                                                        </div>
                                                    )}
                                                    {(option?.thumbnail?.startsWith('blob') && option.file_type === "video") ? (
                                                        <video
                                                            src={option.thumbnail}
                                                            className="object-cover w-full h-full rounded-md"
                                                            alt="video thumbnail"
                                                            controls={false}
                                                        />
                                                    )
                                                        : <GsFile
                                                            className="object-cover w-full h-full rounded-xl"
                                                            gsUrl={option.thumbnail}
                                                            alt="Video Thumbnail"
                                                            isPrivate
                                                        />}
                                                </div>
                                                <div className="flex flex-col ">
                                                    {
                                                        (option.step && option.step !== "") && <AnimatedText cssClasses='text-xs break-keep' text={option?.step} />
                                                    }
                                                    <span className={`text-md font-medium break-keep ${theme === 'dark' && 'text-textColor-100'}`} style={{ overflowWrap: 'anywhere' }}>{option.source_path.replace(/\.[^/.]+$/, '')}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center">
                                                <Checkbox
                                                    className={`p-0 !ml-1 !border-primary-300 !text-primary-300`}
                                                    checked={option.is_checked}
                                                    onChange={(e) => handleCheckboxChange(e?.target?.checked, option)}
                                                    onClick={(event) => event.stopPropagation()}
                                                    inputProps={{ "aria-label": "Select source" }}
                                                    disabled={'progress' in option}
                                                />

                                                {
                                                    !isProjectReadOnly && (
                                                        <IndeterminateCheckBoxOutlinedIcon
                                                            className={`${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'} cursor-pointer`}
                                                            title="Clear all sources"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleClearSource(option.source_id);
                                                            }}
                                                            titleAccess='clear'
                                                        />
                                                    )
                                                }

                                            </div>
                                        </div>)
                                    }
                                </div>
                            )}
                        {

                            displayedSources.length === 0
                            &&
                            <NoData message="No sources selected" classes="mt-4" />
                        }
                        {
                            (results.length === 0 && displayedSources.length > 0) && (
                                <BaseHeading text='No sources found' className='mt-4 text-center' />
                            )
                        }
                    </div>
                </div>
                {/* update file name modal */}
                {isUpdateFilenameModalOpen && <UpdateFilenameModal show={isUpdateFilenameModalOpen} onHide={() => setIsUpdateFilenameModalOpen(false)} filename={filename} extension={updatingSource?.source_path?.split('.')?.at(-1)} setFilename={setFilename} oldFilename={updatingSource?.source_path} sourceCategory={updatingSource?.category} filetype={updatingSource?.file_type} />}

                {/* settings & profile button */}
                <div className="relative mt-2" ref={settingsMenuRef}>
                    <button
                        onClick={handleToggleSettingsMenu}
                        className={`flex items-center gap-2
                        px-3 py-1.5
                        rounded-xl
                        ${theme === 'light' ? 'bg-gray-100/70 hover:bg-gray-200/70' : 'bg-gray-800/40 hover:bg-gray-700/50 '}
                        transition`}
                    >
                        {/* Avatar */}
                        <div className={`flex items-center justify-center text-sm font-semibold text-white rounded-full w-7 h-7 ${theme === "light" ? "bg-[linear-gradient(90deg,#a99df2,#d992b1)]" : "bg-[linear-gradient(90deg,#755bea,#b76894)]"}`}>
                            {user?.firstName[0]?.toUpperCase()}{user?.lastName[0]?.toUpperCase()}
                        </div>

                        {/* Name */}
                        <span className={`text-sm font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white/80'}`}>
                            {user?.firstName} {user?.lastName}
                        </span>

                        {/* Caret */}
                        <svg
                            className={`w-4 h-4 ${theme === 'light' ? 'text-gray-800' : 'text-white/80'} transition-transform ${!isSettingsMenuOpen && "rotate-180"
                                }`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>

                    {/* Dropdown */}
                    {
                        isSettingsMenuOpen && (
                            <div
                                className={`absolute left-0 bottom-full z-10 flex flex-col py-1 rounded-md shadow-lg ${theme === "dark" ? "bg-gray-900" : "bg-white"
                                    }`}
                            >
                                <div
                                    className={`flex  px-3 items-center cursor-pointer gap-2 py-2 pl-1
 ${theme === "light"
                                            ? "hover:bg-textColor-100/20"
                                            : "text-textColor-100 hover:bg-slate-800/50"
                                        }`}
                                    onClick={() => {
                                        setIsSettingsModalOpen(true);
                                        setIsSettingsMenuOpen(false);
                                        setIsSearching(false);
                                    }}
                                >
                                    <SettingsOutlinedIcon
                                        className={`cursor-pointer ${theme === "light" ? "text-[#333]" : "text-[#ABAEB4]"
                                            }`}
                                    />
                                    <span>Settings</span>
                                </div>

                                <div
                                    className={`flex  px-3 text-red-600 items-center cursor-pointer gap-2 py-2 pl-1
 ${theme === "light"
                                            ? "hover:bg-textColor-100/20"
                                            : "hover:bg-slate-800/50"
                                        }`}
                                    onClick={log}
                                >
                                    <LogoutOutlinedIcon
                                        className="cursor-pointer"
                                    />
                                    <span>Log out</span>
                                </div>
                            </div>
                        )
                    }
                </div>

                {isSettingsModalOpen && (
                    <SettingsModal
                        show={isSettingsModalOpen}
                        onHide={() => setIsSettingsModalOpen(false)}
                    />
                )}
            </section>
        </>
    );
};

export default ContentSection;