import { useContext, useState } from "react";
import { Upload, FolderOpen, Check } from "lucide-react";
import Modal from "react-bootstrap/Modal";
import AddSourceModal from "../AddSourceModal";
import FileUploaderModal from "../FileUploaderModal";
import LoadingSpinner from "../LoadingSpinner";
import SourceExplorer from "../SourceExplorer";
import MediaCard from "../MediaCard";
import { MainContext } from "../../contexts/mainContext.jsx";
import { ProjectContext } from "../../contexts/projectContext.jsx";
import { useToast } from "../../contexts/toastContext.jsx";
import makeApiRequest from "../../api";
import { getFileType } from "../../utils.js";

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
        frameExtractionRate,
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
    const [updatedSourceName, setUpdatedSourceName] = useState("");
    const [isUpdatingSource, setIsUpdatingSource] = useState(false);

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
        setUpdatedSourceName(source?.source_path?.split(".")?.slice(0, -1).join(".") || "");
    }

    function closeSourceUpdate() {
        if (!isUpdatingSource) {
            setSourceToUpdate(null);
            setUpdatedSourceName("");
        }
    }

    async function updateSourcePath() {
        const trimmedName = updatedSourceName.trim();
        if (!trimmedName || !sourceToUpdate) return;

        const extension = sourceToUpdate.source_path.split(".").at(-1);
        const newSourcePath = `${trimmedName}.${extension}`;
        setIsUpdatingSource(true);

        try {
            const response = await makeApiRequest("/rename", "PATCH", JSON.stringify({
                category: sourceToUpdate.category,
                oldFilename: sourceToUpdate.source_path,
                newFilename: newSourcePath,
                filetype: sourceToUpdate.file_type,
            }));
            const mediaKey = ["video_url", "pdf_url", "thumbnail"].find((key) => response[key]);
            const updateSource = (source) => source.source_path === sourceToUpdate.source_path
                ? {
                    ...source,
                    source_path: newSourcePath,
                    ...(mediaKey ? { [mediaKey]: response[mediaKey] } : {}),
                }
                : source;

            setKnowledgeBase((previous) => previous.map(updateSource));
            setDisplayedSources((previous) => previous.map(updateSource));
            notify({ variant: "success", heading: "Source renamed successfully!" });
            closeSourceUpdate();
        } catch (error) {
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: error?.response?.data?.error || "Unable to rename source.",
            });
        } finally {
            setIsUpdatingSource(false);
        }
    }

    async function handleUpload(event, fileFormat, files, isFineGrained = false) {
        const selectedFiles = files || Array.from(event?.target?.files || []);
        if (selectedFiles.length === 0) return;

        setIsFileUploading(true);
        const formData = new FormData();
        selectedFiles.forEach((file) => {
            formData.append("file", file);
            formData.append("category", selectedCategory);
            formData.append("fileType", file.type);
            formData.append("isDetailedMode", isDetailedMode);
            formData.append("videoCaptionContext", videoCaptionContext);
        });
        formData.append("isFineGrained", isFineGrained);
        if (frameExtractionRate) {
            formData.append("frameExtractionRate", JSON.stringify(frameExtractionRate));
        }

        const pendingSources = selectedFiles.map((file) => ({
            category: [selectedCategory],
            file_type: getFileType(file.type),
            source_path: file.name,
            thumbnail: null,
            is_checked: false,
            is_selected: true,
            progress: 0,
            step: "Initialize ingestion...",
        }));

        setPersistedUploadedFiles(pendingSources);
        setKnowledgeBase((previous) => [...pendingSources, ...previous]);
        setShowAddModal(false);
        setShowUploadModal(false);

        try {
            const { uploaded_data: uploadedData = [] } = await makeApiRequest(
                "/upload",
                "post",
                formData,
                { "Content-type": "multipart/form-data" }
            );
            setKnowledgeBase((previous) => [
                ...uploadedData,
                ...previous.filter((item) => !pendingSources.some((pending) => pending.source_path === item.source_path)),
            ]);
            setCurrentResource((previous) => previous && uploadedData[0]);
            if (uploadedData.length > 0) setActiveView("resource");
            notify({ variant: "success", heading: "Source uploaded successfully!" });
        } catch (error) {
            setKnowledgeBase((previous) => previous.filter((item) => !pendingSources.includes(item)));
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: error?.response?.data?.error || "Failed to upload new source. Please try again.",
            });
        } finally {
            setIsFileUploading(false);
        }
    }

    async function deleteResource(event, items) {
        try {
            setIsDeleting(true);
            setClickedIndex(items[0]);
            const payload = items.map((item) => ({
                category: item.category,
                fileName: item.source_path,
                fileType: item.file_type,
            }));
            await makeApiRequest("/delete", "post", { sources: payload });
            const deletedPaths = new Set(payload.map((item) => item.fileName));
            setDisplayedSources((previous) => previous.filter((item) => !deletedPaths.has(item.source_path)));
            setKnowledgeBase((previous) => previous.filter((item) => !deletedPaths.has(item.source_path)));
            setGeneratedResources((previous) => previous?.filter((item) => !deletedPaths.has(item.source_path)));
            if (items.some((item) => item.source_path === currentResource?.source_path)) {
                setCurrentResource(null);
                setActiveView(null);
            }
            notify({ variant: "success", heading: "Source deleted successfully!" });
        } catch (error) {
            notify({ variant: "error", heading: "Unable to delete source." });
        } finally {
            setIsDeleting(false);
            setClickedIndex(null);
        }
    }

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
        setKnowledgeBase((previous) => previous.map((source) => displayedSources.some((item) => item.source_path === source.source_path)
            ? { ...source, is_checked: false }
            : source));
    }

    return (
        <div className="max-w-[1400px] h-full mx-auto px-6 py-6 bg-white">
            {/* Sub-navigation */}
            <nav className="flex items-center gap-6 border-b border-gray-100 mb-5">
                {MEDIA_NAV.map(({ key, label, icon: Icon }) => {
                    return (
                        <button
                            key={key}
                            type="button"
                            className={[
                                "flex items-center gap-1.5 pb-3 text-[13px] font-medium border-b-2 -mb-px transition-colors",
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
            <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer select-none">
                    <span
                        onClick={toggleAll}
                        className={[
                            "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                            allChecked
                                ? "bg-violet-600 border-violet-600"
                                : someChecked
                                    ? "bg-violet-100 border-violet-400"
                                    : "bg-white border-gray-300",
                        ].join(" ")}
                    >
                        {allChecked && <Check size={11} className="text-white" strokeWidth={3} />}
                        {!allChecked && someChecked && (
                            <span className="w-1.5 h-1.5 rounded-sm bg-violet-500" />
                        )}
                    </span>
                    {allChecked ? "Deselect all" : "Select all"}
                    <span className="text-gray-400">
                        {someChecked ? `(${checkedSources.length} selected)` : `(${displayedSources.length})`}
                    </span>
                </label>

                <button
                    type="button"
                    onClick={clearAll}
                    disabled={!someChecked}
                    className={[
                        "text-[13px] font-medium transition-colors",
                        someChecked
                            ? "text-red-600 hover:text-red-700"
                            : "text-gray-300 cursor-not-allowed",
                    ].join(" ")}
                >
                    Clear all
                </button>
            </div>

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
                <Modal show onHide={closeSourceUpdate} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Update source path</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <label htmlFor="source-path" className="mb-1 block text-sm font-medium text-gray-700">
                            Source filename
                        </label>
                        <div className="flex items-center gap-1">
                            <input
                                id="source-path"
                                type="text"
                                value={updatedSourceName}
                                onChange={(event) => setUpdatedSourceName(event.target.value)}
                                onKeyDown={(event) => event.key === "Enter" && updateSourcePath()}
                                className="block w-full rounded-xl border border-gray-300 p-2 outline-none"
                                autoFocus
                            />
                            <span className="text-gray-500">.{sourceToUpdate.source_path.split(".").at(-1)}</span>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <button type="button" onClick={closeSourceUpdate} disabled={isUpdatingSource} className="rounded-md px-3 py-2 text-gray-600 hover:bg-gray-100">
                            Cancel
                        </button>
                        <button type="button" onClick={updateSourcePath} disabled={!updatedSourceName.trim() || isUpdatingSource} className="rounded-md px-3 py-2 text-primary-300 hover:bg-primary-50 disabled:cursor-not-allowed disabled:text-gray-400">
                            {isUpdatingSource ? <LoadingSpinner isSmall /> : "Save title"}
                        </button>
                    </Modal.Footer>
                </Modal>
            )}

            {/* Card grid */}
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
    );
}