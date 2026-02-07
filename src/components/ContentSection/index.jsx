import AddIcon from '@mui/icons-material/Add';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
// import AppTooltip from "../AppTooltip";
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
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
import { getFileType, searchByKey, sortArrayOfObjects, timeToSeconds } from '../../utils';
import AddSourceModal from "../AddSourceModal";
import AnimatedText from '../AnimatedText';
import BaseHeading from '../BaseHeading';
import CircularProgressWithLabel from "../CircularProgressWithLabel";
import GsFile from '../GsFile';
import { IndexModal } from '../IndexModal';
import LoadingSpinner from "../LoadingSpinner";
import MetadataPanel from "../MetadataPanel";
import NoData from '../NoData';
import SearchSection from '../SearchSection';
import { SettingsModal } from "../Settings/SettingsModal";
import SourceExplorer from "../SourceExplorer";

import { Tooltip } from 'react-tooltip';
import 'react-tooltip/dist/react-tooltip.css';

const UpdateFilenameModal = ({ show, onHide, filename, setFilename, extension, sourceCategory, oldFilename, filetype }) => {
    const { theme, setDisplayedSources, setKnowledgeBase } = useContext(MainContext);

    const { notify } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    async function updateFilename() {
        try {
            if (filename === "") {
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
            const response = await makeApiRequest('/rename', 'PATCH', JSON.stringify(payload));

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
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Cancel
                    </span>
                </div>

                <div
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={updateFilename}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Save
                    </span>}
                </div>
            </Modal.Footer>
        </Modal>
    );
};

const ContentSection = ({
    setCurrentProject,
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
        setCheckedAll,
        theme,
        chatLoaded, setPersistedUploadedFiles,
        currentChat
    } = useContext(MainContext);

    const { notify } = useToast();

    const { isSettingsModalOpen, setIsSettingsModalOpen } = useContext(ProjectContext);

    const { user } = useContext(AuthContext);

    const { logout } = useAuth();

    const [isProgressStarted, setIsProgressStarted] = useState(false);
    const [progressUpdateCount, setProgressUpdateCount] = useState(0);

    useEffect(() => {
        socket.on("connect", () => {
            console.log("Connected:", socket.id);

            // Generate or reuse a session ID
            const sessionId = localStorage.getItem("sessionId") || Math.random();
            localStorage.setItem("sessionId", sessionId);
            console.log("Joining session:", sessionId);

            // Tell the backend to join this upload session
            socket.emit("join_upload_session", { session_id: sessionId });
        });

        socket.on('connect', () => {
            console.log('🔌 Socket connected with ID:', socket.id);
            console.log('🔌 Previous socket ID was:', localStorage.getItem('previousSocketId'));
            localStorage.setItem('previousSocketId', socket.id);

            // Auto-rejoin the session if we have a session ID
            const existingSessionId = localStorage.getItem('sessionId');
            if (existingSessionId) {
                console.log('🔄 Auto-rejoining session after reconnect:', existingSessionId);
                socket.emit("join_upload_session", { session_id: existingSessionId });

                // Wait a moment for the join to complete
                setTimeout(() => {
                    console.log('🔄 Rejoin completed for session:', existingSessionId);
                }, 500);
            }
        });

        socket.on('disconnect', (reason) => {
            console.log('🔌 Socket disconnected:', reason);
        });

        // Backend events (as discussed earlier)
        socket.on('connected', (data) => {
            console.log('Server confirmation:', data);
        });

        socket.io.on("reconnect_attempt", () => {
            console.log("reconnect_attempt...");
        });

        socket.io.on("reconnect", () => {
            console.log("reconnect...");
        });

        socket.on('progress_update', (data) => {
            setProgressUpdateCount(prev => prev + 1);

            // Update the displayed sources with real progress
            setDisplayedSources((prev) => {
                return prev.map((source) => {
                    // Update progress for sources that are currently being uploaded
                    // Check if this source is being uploaded (has progress property)

                    //TODO: source.source_path === data.source_path ?
                    if (source.progress !== undefined && data.progress_percentage <= 100) {
                        if (data.currentIndex === source?.index) {
                            // if current progress is 100 => current source finished uploading => remove progress and step from current source
                            if (data.progress_percentage === 100) {
                                const { progress, step, ...rest } = source;
                                return {
                                    // ...persistedUploadedFiles,
                                    ...rest,
                                    ...data,
                                    is_checked: true
                                };
                            }
                            if (data?.step_name === "Summarizing...") {
                                return {
                                    ...source,
                                    // ...persistedUploadedFiles,
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
                                    // ...persistedUploadedFiles,
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
                            return {
                                ...source,
                                // ...persistedUploadedFiles,
                                ...data,
                                progress: data.progress_percentage || 0,
                                step: data.step_name || source.step
                            };
                        } else if (data.currentIndex > source?.index) {
                            const { progress, step, ...rest } = source;
                            return {
                                ...rest,
                                // ...persistedUploadedFiles,
                                // ...data,
                                is_checked: true
                            };
                        }
                    }
                    return { ...source };
                });
                // return displayedSourcesFromProgressEvent;
            });
        });

        socket.on('upload_error', (data) => {
            console.log('Upload error:', data);
            setIsUploadFailed(true);
            setUploadStatus("error");
            setuploadErrorMessage(data.error_message || 'Upload failed. Please try again.');
        });

        socket.on('upload_complete', (data) => {
            console.log('*****************************Upload complete:*********************', data);
            if (data.success) {
                setUploadStatus("success");
                setIsFileUploading(false);
                setIsProgressStarted(false);
                // Clear the displayed sources progress
                setDisplayedSources((prev) => {
                    if (data.currentIndex === prev?.index) {
                        // remove progress and step properties from this object
                        // delete prev.progress;
                        // delete prev.step;
                        const { progress, step, ...rest } = prev;
                        return {
                            ...rest,
                            is_checked: true
                        };
                    }
                    return prev;
                });
            } else {
                setIsUploadFailed(true);
                setUploadStatus("error");
            }
        });

        socket.on('session_joined', (data) => {
            // Store the session ID for use in uploads
            if (data.session_id) {
                localStorage.setItem("sessionId", data.session_id);
                console.log('💾 Session ID saved to localStorage:', data.session_id);
            }
        });

        socket.on('error', (data) => {
            console.log('General error:', data);
        });

        // Add a generic event listener to catch any events
        socket.onAny((eventName, ...args) => {
            console.log('🔔 Received event:', eventName, args);
        });


        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
            socket.off('connected');
            socket.off('progress_update');
            socket.off('upload_error');
            socket.off('upload_complete');
            socket.off('session_joined');
            socket.off('error');
        };
    }, []);

    async function log() {
        localStorage.setItem('current_project', null);
        await logout();
    }

    const formatOptions = [
        { value: "all", label: "All" },
        { value: "video", label: "Videos" },
        { value: "pdf", label: "PDFs" },
        { value: "img", label: "Images" },
    ];

    const [isSearching, setIsSearching] = useState(false);
    const [showSourceExplorer, setShowSourceExplorer] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false); // True when a resource is being deleted
    const [clickedIndex, setClickedIndex] = useState(null);
    const [isOpenedFromSourceExplorerBtn, setIsOpenedFromSourceExplorerBtn] =
        useState();

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
        const allSelected = knowledgeBase.every((item) => item.is_checked);

        // Update selectedAll state based on the check
        setCheckedAll(allSelected);
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

            // setChatLoaded(false);
            // const { chat_is_initialized } = await makeApiRequest(
            //     `/chat/all`,
            //     "post",
            //     JSON.stringify({
            //         sources: selectedSources,
            //         category: selectedCategory,
            //         selectedAll,
            //         reinitialize: true,
            //     })
            // );
            // setChatLoaded(chat_is_initialized);

            setCurrentResource(null);
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

    const handleSelectAllCheckboxChange = (path, isChecked) => {
        const pathSegments = path.split("/").filter(Boolean); // Removes empty strings from array
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
            return prev.filter(item => item.is_selected).map(item => ({ ...item, is_checked: isChecked }));
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



    const handleUpload = async (event, fileFormat, _files) => {
        let rejoinInterval;
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
            // Always try to reuse existing session ID, only create new one if none exists
            // Generate a unique session ID for each upload batch to avoid conflicts
            // This ensures proper isolation between concurrent or sequential uploads
            const sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            console.log("🆕 Created new session_id for this upload batch:", sessionId);

            // Ensure we're joined to the session room before starting upload
            console.log("Joining session room before upload:", sessionId);
            console.log("Current socket ID:", socket.id);
            socket.emit("join_upload_session", { session_id: sessionId });

            // Wait a moment for the join to complete
            await new Promise(resolve => setTimeout(resolve, 500));

            // Set up periodic rejoin to ensure we stay in the room during long uploads
            rejoinInterval = setInterval(() => {
                if (socket.connected) {
                    console.log("🔄 Periodic rejoin to session:", sessionId);
                    socket.emit("join_upload_session", { session_id: sessionId });
                }
            }, 5000); // Rejoin every 30 seconds

            files.forEach((file, index) => {
                formData.append("file", file);
                formData.append("category", selectedCategory);
                formData.append("fileType", file.type);
                formData.append("session_id", sessionId);
                formData.append("fileIndex", index);
            });

            //TODO: loop throught files and populate the "initialSources" with the initial properties

            const fileSources = files.map((file, index) => {
                return {
                    category: [selectedCategory],
                    file_type: getFileType(file.type),
                    source_path: file.name,
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

            // speed up the upload process by moving the progress bar to 3% after 10s-20s from uploading
            setTimeout(() => {
                setKnowledgeBase(prev => prev.map(item => {
                    if (item.progress === 0) {
                        return { ...item, progress: 3, step: "Video pre-processing..." };
                    }
                    return item;
                }));
            }, 10000);

            const { uploaded_data } = await makeApiRequest("/upload", "post", formData, { 'Content-type': "multipart/form-data" });

            // ----------  Update knowledge base ----------
            setKnowledgeBase(prev => [...uploaded_data, ...prev.slice(totalFiles)]);

            // show success message
            notify({
                variant: "success",
                heading: "Source uploaded successfully!",
            });

            // const { chat_is_initialized } = await makeApiRequest(
            //     `/chat/all`,
            //     "post",
            //     JSON.stringify({
            //         sources: [],
            //         category: "all",
            //         selectedAll: false,
            //         is_exclusive: false
            //     })
            // );
            // setChatLoaded(chat_is_initialized);

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
            clearInterval(rejoinInterval);
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

    const [isExitPending, setIsExitPending] = useState(false);
    async function handleExitProject() {
        setIsExitPending(true);
        await makeApiRequest('/exit-project', 'PUT', JSON.stringify({
            sources: {
                checked: displayedSources.filter(item => item.is_checked).map(item => item.source_path),
                unchecked: displayedSources.filter(item => !item.is_checked).map(item => item.source_path),
            },
            chat: currentChat?.sessionId
        }));
        setCurrentProject(null);
        setIsExitPending(false);
    }

    return (
        <>
            {/* this is where i show the list of displayedSources */}
            {!showMetadata && <section className={`relative flex flex-col items-start h-full`}>
                <div className="w-full">
                    <div className="w-full max-w-4xl pr-3">
                        <div className="flex flex-col gap-0">

                            <div
                                data-tooltip-variant={theme}
                                data-tooltip-class-name={theme === "light" && "border font-semibold"}
                                data-tooltip-id="add-sources-tooltip"
                                data-tooltip-content="Upload sources or create new indexes."
                                id="upload_sources"
                                className={`source-explorer flex items-center justify-center gap-2 px-1 py-1 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                                onClick={() => handleAddModal(true)}
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
                                className={`source-explorer flex items-center justify-center gap-2 px-1 py-1 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                                onClick={handleExploreSources}
                            >
                                <FolderOpenIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>Existing sources</span>

                                <Tooltip id="source-explorer-tooltip" />
                            </div>

                            <div
                                data-tooltip-variant={theme}
                                data-tooltip-class-name={theme === "light" && "border font-semibold"}
                                data-tooltip-id="discovery-tooltip"
                                data-tooltip-content="Search across your knowledge base."
                                id="discovery"
                                className={`flex items-center justify-center gap-2 px-1 py-1 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20'}`}
                                onClick={() => setIsSearching(!isSearching)}
                            >
                                <SearchOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                                <span className={`font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`} onClick={() => setIsSearching(false)}>Discovery</span>

                                <Tooltip id="discovery-tooltip" />
                            </div>
                            {
                                isSearching && (
                                    <div className="flex items-center gap-2">
                                        <SearchSection chatLoaded={chatLoaded} className='flex-1' />
                                    </div>
                                )
                            }
                        </div>
                    </div>
                    <IndexModal show={isIndexModalOpen} onHide={hideIndexModal} handleUpload={handleUpload} />
                    <AddSourceModal show={showAddModal} setShowAddModal={setShowAddModal} isUploading={isFileUploading} setIsUploading={setIsFileUploading} onHide={() => handleAddModal(false)} handleUpload={handleUpload} />
                    {showSourceExplorer && (
                        <SourceExplorer
                            show={showSourceExplorer}
                            setShowSourceExplorer={setShowSourceExplorer}
                            onHide={onHideSourceExplorer}
                            showIndexModal={openIndexModal}
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
                </div>

                <div className="flex flex-col flex-1 w-full h-full max-h-full overflow-y-auto">

                    <BaseHeading text={`Workspace sources (${results?.length} selected & ${results?.filter(i => i?.is_checked)?.length} checked.)`} className={` mt-4`} />

                    {displayedSources.length > 0 && <input className={`mt-2 mb-2 py-1 text-sm bg-transparent outline-none ${theme === 'light' ? '!border !border-textColor-100' : '!border !border-textColor-200 text-textColor-100'} w-full lg:w-[75%] rounded-full !pl-[10px]`} placeholder={"Search in workspace sources..."} value={searchValue} onChange={handleSearch} />}

                    {results?.length > 0 && <div className="flex items-center mt-2">
                        <span
                            className={`flex-1 ${theme === "light" ? "text-textColor-300" : "text-textColor-100"
                                }`}
                        >
                            check all sources
                        </span>
                        <Checkbox
                            className={`select-all-checkbox p-0 "
 }`}
                            checked={results?.every(item => item?.is_checked)}
                            onChange={(e) => handleToggleCheckSources(e.target.checked)}
                            inputProps={{ "aria-label": "Select All Sources" }}
                            label="Check All Sources"
                        />
                    </div>}

                    <div className="flex flex-col flex-1 w-full h-full overflow-y-hidden selected-sources-container">
                        {
                            results?.length > 0 && <div className={` h-full gap-2 w-full max-w-full mt-2 overflow-y-auto ${theme === 'dark' ? '!border !border-textColor-300' : 'border'} empty:!border-none`}>
                                {
                                    results?.map((option) => <div key={option?.source_path} className={`flex w-full max-w-full cursor-pointer py-2 px-1 ${showSourceContextMenu === null && (theme === 'light' ? 'hover:bg-light-hover-100/30' : 'hover:bg-light-hover-200/20')}`} onMouseEnter={() => handleMouseEnter(option?.source_path)} onMouseLeave={handleMouseLeave} onClick={(event) => onThumbnailClick(event, option)}>

                                        <div className="relative flex items-center flex-1 w-full max-w-full gap-2">
                                            {(showSourceContextMenu === option?.source_path && !('progress' in option)) && <div ref={dropdownRef} className={` absolute left-0 top-full z-10 flex flex-col p-1 rounded-md shadow-lg ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'}`}>
                                                <div className={`flex gap-2 py-2 pr-10 pl-1 font-medium text-left ${theme === "light" ? 'hover:bg-textColor-100/15' : 'text-textColor-100 hover:bg-slate-800/50'}`}
                                                    onClick={(event) => handleOpenFilenameUpdateModal(event, option)}>
                                                    <EditOutlinedIcon
                                                        className={`cursor-pointer ${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'}`}
                                                    />
                                                    <span>Rename</span>
                                                </div>
                                                <div className={`flex gap-2 py-2 pr-10 pl-1 font-medium text-left ${theme === "light" ? 'hover:bg-textColor-100/15' : ' hover:bg-slate-800/40'} text-red-400`} onClick={(event) => { event.stopPropagation(); deleteResource(event, [option]); }}>
                                                    <DeleteOutlineOutlinedIcon
                                                        className={`cursor-pointer`}
                                                    />
                                                    <span>Delete</span>
                                                </div>
                                            </div>}
                                            {
                                                !('progress' in option) ?
                                                    <MoreVertOutlinedIcon className={`${theme === 'light' ? 'text-[#333]' : 'text-[#ABAEB4]'} cursor-pointer`} onClick={e => handleOpenSourceContextMenu(e, option?.source_path)} /> : <CircularProgressWithLabel value={option.progress} variant="determinate" isUploadFiled={false} />

                                                // )
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
                                                {(option?.thumbnail?.startsWith('blob') && option.file_type === "video") ? (
                                                    <video
                                                        src={option.thumbnail}
                                                        className="object-cover w-full h-full rounded-md"
                                                        alt="video thumbnail"
                                                        controls={false}
                                                    />
                                                )
                                                    : <GsFile
                                                        className="object-cover w-full h-full rounded-md"
                                                        gsUrl={option.thumbnail}
                                                        alt="Video Thumbnail"
                                                        isPrivate
                                                    />}
                                            </div>
                                            <div className="flex flex-col ">
                                                {(option.step && option.step !== "") && <AnimatedText cssClasses='text-xs break-keep' text={option?.step} />}
                                                <span className={`text-md font-medium break-keep ${theme === 'dark' && 'text-textColor-100'}`} style={{ overflowWrap: 'anywhere' }}>{option.source_path.replace(/\.[^/.]+$/, '')}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center ">
                                            <Checkbox
                                                className="p-0 !ml-1"
                                                checked={option.is_checked}
                                                onChange={(e) => handleCheckboxChange(e?.target?.checked, option)}
                                                onClick={(event) => event.stopPropagation()}
                                                inputProps={{ "aria-label": "Select source" }}
                                                disabled={'progress' in option}
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
                <div className="relative" ref={settingsMenuRef}>
                    <button
                        onClick={handleToggleSettingsMenu}
                        className={`flex items-center gap-2
                        px-3 py-1.5
                        rounded-full
                        ${theme === 'light' ? 'bg-gray-100/70 hover:bg-gray-200/70' : 'bg-gray-800/70 hover:bg-gray-700/70 '}
                        transition`}
                    >
                        {/* Avatar */}
                        <div className="flex items-center justify-center text-sm font-semibold text-white rounded-full w-7 h-7 bg-gradient-to-br from-indigo-500 to-cyan-400">
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

                                {/* <div
                                    className={`flex  px-3 items-center cursor-pointer gap-2 py-2 pl-1
                                            ${theme === "light"
                                            ? "hover:bg-textColor-100/20"
                                            : "text-textColor-100 hover:bg-slate-800/50"
                                        }`}
                                    onClick={handleExitProject}
                                >
                                    {isExitPending ? <LoadingSpinner isSmall /> : <CloseOutlinedIcon
                                        className={`cursor-pointer ${theme === "light" ? "text-[#333]" : "text-[#ABAEB4]"
                                            }`}
                                    />}
                                    <span>Exit project</span>
                                </div> */}

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