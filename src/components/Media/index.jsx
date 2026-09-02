import { useContext, useEffect, useRef, useState } from "react";
import socket from "../../config/socket";
import { Upload, FolderOpen, Check } from "lucide-react";
import AddSourceModal from "../AddSourceModal";
import FileUploaderModal from "../FileUploaderModal";
import SourceExplorer from "../SourceExplorer";
import MediaCard from "../MediaCard";
import { UpdateFilenameModal } from "../ContentSection";
import { MainContext } from "../../contexts/mainContext.jsx";
import { ProjectContext } from "../../contexts/projectContext.jsx";
import { useToast } from "../../contexts/toastContext.jsx";
import makeApiRequest from "../../api";
import { extractThumbnail, generateRandomHash, getFileType } from "../../utils.js";
import NoData from '../NoData/index.jsx';

/**
 * Media - Upload / Collection sub-navigation above a grid of
 * source cards (thumbnail + filename + checkbox), with
 * select-all / clear-all controls above the grid.
 *
 * Presentational only — no upload, filtering, or persistence
 * logic is wired up.
 */

const MEDIA_NAV = [
    { key: "ingest", label: "Ingest", icon: Upload },
    { key: "collection", label: "Collection", icon: FolderOpen },
];

export default function Media() {
    const {
        categoryOptions,
        formatOptions,
        currentResource,
        displayedSources = [],
        setShowMetadata,
        isDetailedMode,
        handleCheckboxChange,
        knowledgeBase,
        onThumbnailClick,
        selectedCategory,
        setActiveView,
        setCurrentResource,
        setDisplayedSources,
        setGeneratedResources,
        setIsFileUploading,
        setKnowledgeBase,
        setPersistedUploadedFiles,
        videoCaptionContext,
        setUploadedSources,
        frameExtractionRate
    } = useContext(MainContext);
    const { isProjectReadOnly } = useContext(ProjectContext);
    const { notify } = useToast();

    const [showAddModal, setShowAddModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showSourceExplorer, setShowSourceExplorer] = useState(false);
    const [uploadModalCategory, setUploadModalCategory] = useState("all");
    const [isDeleting, setIsDeleting] = useState(false);
    const [clickedIndex, setClickedIndex] = useState(null);
    const [sourceToUpdate, setSourceToUpdate] = useState(null);
    const [filename, setFilename] = useState("");

    const checkedSources = displayedSources.filter((source) => source?.is_checked);
    const allChecked = displayedSources.length > 0 && checkedSources.length === displayedSources.length;
    const someChecked = checkedSources.length > 0;

    function handleMediaNavClick(key) {
        if (key === "ingest" && !isProjectReadOnly) {
            setUploadModalCategory("all");
            setShowSourceExplorer(false);
            setShowAddModal(true);
        }
        if (key === "collection") {
            setShowSourceExplorer(true);
        }
    }

    function openUploadModal(category = "all") {
        setUploadModalCategory(category);
        setShowSourceExplorer(false);
        setShowUploadModal(true);
    }

    function openSourceUpdate(event, source) {
        event.stopPropagation();
        setSourceToUpdate(source);
        setFilename(source?.source_path?.split(".")?.slice(0, -1).join(".") || "");
    }

    function closeSourceUpdate() {
        setSourceToUpdate(null);
        setFilename("");
    }

    function handleSourceUpdated({ oldFilename, newFilename, response }) {
        const mediaKey = ["video_url", "pdf_url", "thumbnail"].find((key) => response[key]);
        setDisplayedSources((previous) => previous.map((source) => source.source_path === oldFilename
            ? {
                ...source,
                source_path: newFilename,
                ...(mediaKey ? { [mediaKey]: response[mediaKey] } : {}),
            }
            : source));
    }

    /**
     * +++++++++++++ UPLOAD +++++++++++++++
     */

    const [isProgressStarted, setIsProgressStarted] = useState(false);
    const [progressUpdateCount, setProgressUpdateCount] = useState(0);
    const [isUploadFailed, setIsUploadFailed] = useState(false);
    const [uploadStatus, setUploadStatus] = useState("idle"); // 'idle' | 'uploading' | 'success' | 'error'
    const [uploadErrorMessage, setuploadErrorMessage] = useState("");
    const [fileThumbnails, setFileThumbnails] = useState([]);

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

            await makeApiRequest(`/assets/${items[0].source_id}`, "DELETE");
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

    function handleSelectAllCheckboxChange(sources, isChecked) {
        const paths = new Set(sources.map((source) => source.source_path));
        setKnowledgeBase((previous) => previous.map((item) => paths.has(item.source_path)
            ? { ...item, is_selected: true, is_checked: isChecked }
            : item));
    }

    function toggleAll() {
        const sourcePaths = new Set(displayedSources.map((source) => source.source_path));
        setKnowledgeBase((previous) => previous.map((source) => sourcePaths.has(source.source_path)
            ? { ...source, is_checked: !allChecked, is_selected: true }
            : source));
    }

    function clearAll() {
        setKnowledgeBase(prev => prev.map(item => {
            return {
                ...item,
                is_checked: false,
                is_selected: false,
            };
        }));
    }

    return (
        <div className="flex h-full min-h-0 max-w-[1400px] flex-col overflow-hidden mx-auto px-6 py-6 bg-white">
            <div className="pb-3 border-b border-border shrink-0">
                <h2 className="font-display text-[14.5px] font-semibold text-ink">Media sources</h2>
                <p className="text-xs text-ink-secondary mt-0.5">Ingest and handle your uploaded sources here.</p>
            </div>

            {/* Sub-navigation */}
            <nav className="pt-3.5 flex items-center gap-6 border-b border-gray-100 mb-5">
                {MEDIA_NAV.map(({ key, label, icon: Icon }) => {
                    return (
                        <button
                            key={key}
                            type="button"
                            className={[
                                "text-textColor-200 flex items-center gap-1.5 pb-3 text-[13px] font-medium border-b-2 -mb-px transition-colors",
                            ].join(" ")}
                            onClick={() => handleMediaNavClick(key)}
                        >
                            <Icon size={14} strokeWidth={2} />
                            {label}
                        </button>
                    );
                })}
            </nav>

            {/* Selection controls */}
            {displayedSources.length > 0 ? (
                <div className="flex items-center justify-between mb-4">
                    <label className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer select-none">
                        <span
                            onClick={toggleAll}
                            className={[
                                "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                                allChecked
                                    ? "bg-primary-300 border-primary-300"
                                    : someChecked
                                        ? "bg-primary-100 border-primary-200"
                                        : "bg-white border-gray-300",
                            ].join(" ")}
                        >
                            {allChecked && <Check size={11} className="text-white" strokeWidth={3} />}
                            {!allChecked && someChecked && (
                                <span className="w-1.5 h-1.5 rounded-sm bg-primary-300" />
                            )}
                        </span>
                        {allChecked ? "Deselect all" : "Select all"}
                        <span className="text-gray-400">
                            {someChecked ? `(${checkedSources.length} selected)` : `(${displayedSources.length})`}
                        </span>
                    </label>

                    {
                        displayedSources.length > 0 && (
                            <button
                                type="button"
                                onClick={clearAll}
                                className="text-[13px] font-medium transition-colors text-red-600 hover:text-red-700"
                            >
                                Clear all
                            </button>
                        )}
                </div>
            ) : (
                <NoData message="Select a source to start generating content" classes="mt-4" />
            )}

            <AddSourceModal
                show={showAddModal}
                setShowAddModal={setShowAddModal}
                isUploading={false}
                openCategoriesModal={false}
                onHide={() => setShowAddModal(false)}
                handleUpload={handleUpload}
            />
            {showUploadModal && (
                <FileUploaderModal
                    show={showUploadModal}
                    onHide={() => setShowUploadModal(false)}
                    hideIndexModal={() => setShowUploadModal(false)}
                    indexName={uploadModalCategory}
                    handleUpload={handleUpload}
                />
            )}
            {showSourceExplorer && (
                <SourceExplorer
                    show={showSourceExplorer}
                    onHide={() => setShowSourceExplorer(false)}
                    showIndexModal={() => setShowAddModal(true)}
                    handleUpload={handleUpload}
                    knowledgeBase={knowledgeBase}
                    setKnowledgeBase={setKnowledgeBase}
                    categories={categoryOptions}
                    formats={formatOptions}
                    isDeleting={isDeleting}
                    clickedIndex={clickedIndex}
                    deleteResource={deleteResource}
                    handleSelectAllCheckboxChange={handleSelectAllCheckboxChange}
                    onOpenUploadModal={openUploadModal}
                    onOpenCategoriesModal={() => setShowAddModal(true)}
                />
            )}

            {sourceToUpdate && (
                <UpdateFilenameModal
                    show
                    onHide={closeSourceUpdate}
                    filename={filename}
                    setFilename={setFilename}
                    extension={sourceToUpdate.source_path.split(".").at(-1)}
                    sourceCategory={sourceToUpdate.category}
                    oldFilename={sourceToUpdate.source_path}
                    filetype={sourceToUpdate.file_type}
                    onUpdated={handleSourceUpdated}
                />
            )}

            {/* Card grid */}
            <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                <div className="grid gap-5 [grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr))]">
                    {displayedSources.map((source) => (
                        <MediaCard
                            key={source.source_path}
                            source={source}
                            onOpen={onThumbnailClick}
                            onToggle={handleCheckboxChange}
                            onUpdate={openSourceUpdate}
                            onDelete={deleteResource}
                            isProjectReadOnly={isProjectReadOnly}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}