import { useContext, useEffect, useRef, useState } from "react";
import socket from "../../config/socket";
import { Upload, FolderOpen } from "lucide-react";
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
import AssetCollection from '../AssetCollection/index.jsx';
import AnimatedText from '../AnimatedText/index.jsx';
import ConfirmationModal from '../ConfirmationModal/index.jsx';

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
        frameExtractionRate,
        setFrameExtractionRate,
        setIsDetailedMode,
        setVideoCaptionContext,
        isKnowledgeBaseFetching,
        setSelectedCategory,
        setCategoryOptions
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
    const [showRemoveIndexModal, setShowRemoveIndexModal] = useState(false);
    const [isIndexDeleting, setIsIndexDeleting] = useState(false);
    const [indexToRemove, setIndexToRemove] = useState("");
    const [sourcesToDelete, setSourcesToDelete] = useState([]);

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

    const [uploadStatus, setUploadStatus] = useState("idle");

    function handleProgressUpdate(data) {
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
            setUploadStatus('error');
        });

        socket.on('upload_complete', (data) => {
            console.log('*****************************Upload complete:*********************', data);
            if (data.success) {
                setUploadStatus('success');
                setIsFileUploading(false);
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
            setIsFileUploading(true);
            setShowAddModal(false); // Reset progress update counter

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
                formData.append("index_id", categoryOptions.find(item => item.value.toLowerCase() === selectedCategory.toLowerCase())?.id);
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
                            step: "Asset pre-processing..."
                        };
                    }

                    return item;
                }));
            }, 10000);

            // await delay(3000);
            const { uploaded_data } = await makeApiRequest("/assets", "POST", formData, { 'Content-type': "multipart/form-data" });

            // ----------  Update knowledge base ----------
            setKnowledgeBase(prev => [...uploaded_data.map(item => ({
                category: [categoryOptions.find(cat => cat.id === item.index_id)?.value || selectedCategory],
                ...item,
            })), ...prev.slice(totalFiles)]);

            // show success message
            notify({
                variant: "success",
                heading: "Source uploaded successfully!",
            });

            setCurrentResource(prev => prev && uploaded_data[0]);

            if (uploaded_data.length > 0) {
                setActiveView('resource');
            }

            // RESET VIDEO PROESSING SETTINGS
            setFrameExtractionRate({ mode: "medium", frames: 1, interval: 3 });
            setIsDetailedMode(false);
            setVideoCaptionContext("");


        } catch (error) {
            setUploadStatus("error");
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "Failed to upload new source. Please try again.",
            });

            setKnowledgeBase(prev => prev.filter(item => !('progress' in item)));
        } finally {
            disconnectSocket();
            setIsFileUploading(false);
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

    function removeIndex(e, indexId) {
        e?.stopPropagation();
        const indexValue = categoryOptions.find(item => item.id === indexId)?.value;
        setIndexToRemove(indexValue);
        const itemsToBeDeleted = knowledgeBase.filter((item) => item.category.includes(indexValue));
        setSourcesToDelete(itemsToBeDeleted);
        setShowRemoveIndexModal(true);
    }

    async function deleteIndex() {
        try {
            setIsIndexDeleting(true);

            // remove sources before index
            if (sourcesToDelete.length > 0) {
                await deleteResource(null, sourcesToDelete);
            }

            const { success, message } = await makeApiRequest(`/indexes/${categoryOptions.find(idx => idx.value === indexToRemove)?.id}`, 'DELETE');

            if (!success) {
                throw new Error(message);
            }

            // CHANGE CURRENTCATEGORY IF IT IS THE DELETING ONE
            if (selectedCategory === indexToRemove) {
                setSelectedCategory("all");
            }

            setCategoryOptions(prev => [...prev.filter(item => item.value !== indexToRemove)]);
            notify({
                variant: "success",
                heading: message || "Index deleted!",
            });
            setShowRemoveIndexModal(false);
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: error.message || "Couldn't delete index. Please try again later.",
            });
        } finally {
            setIsIndexDeleting(false);
        }
    }

    return (
        <div className="flex h-full min-h-0 max-w-[1400px] flex-col overflow-hidden mx-auto px-6 py-6 bg-white">
            <div className="pb-3 border-b border-border shrink-0">
                <h2 className="font-display text-[14.5px] font-semibold text-ink">Media assets</h2>
                <p className="text-xs text-ink-secondary mt-0.5">Ingest and handle your uploaded assets here.</p>
            </div>

            {/* Sub-navigation */}
            <nav className="pt-3.5 flex items-center gap-6 border-b border-gray-100 mb-5 overflow-x-auto overflow-y-hidden">
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



            {isKnowledgeBaseFetching ? (
                <NoData pulse={true} message="Preparing your knowledge base..." classes="mt-4" iconUrl="/data-processing.svg" />
            ) : knowledgeBase.length > 0 ? (
                <AssetCollection
                    onThumbnailClick={onThumbnailClick}
                    handleCheckboxChange={handleCheckboxChange}
                    openSourceUpdate={openSourceUpdate}
                    deleteResource={deleteResource}
                    isDeleting={isDeleting}
                    isProjectReadOnly={isProjectReadOnly}
                    onDeleteIndex={(index) => removeIndex(null, index)}
                />) : (
                <NoData message="No asset was found in your knowledge base. Start ingesting now to generate content." classes="mt-4" />
            )}

            {/* DELETE INDEX MODAL */}
            <ConfirmationModal
                show={showRemoveIndexModal}
                onHide={() => setShowRemoveIndexModal(false)}
                targetName={indexToRemove}
                itemCount={sourcesToDelete.length}
                itemLabel="sources"
                requireTypedConfirmation={true}
                confirmedFn={deleteIndex}
                isDeleting={isIndexDeleting}
            />

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
                            isDeleting={isDeleting}
                            isProjectReadOnly={isProjectReadOnly}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}