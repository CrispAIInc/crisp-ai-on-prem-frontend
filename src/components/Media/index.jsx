import { useContext, useState } from "react";
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
import { getFileType } from "../../utils.js";
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
            {/* Sub-navigation */}
            <nav className="flex items-center gap-6 border-b border-gray-100 mb-5">
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