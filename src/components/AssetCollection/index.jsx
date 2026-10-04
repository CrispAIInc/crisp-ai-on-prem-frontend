import React, { useContext, useState } from "react";
import {
    ChevronRight,
    ChevronDown,
    Folder,
    FolderOpen,
    PlayCircle,
    FileText,
    Image as ImageIcon,
    Layers,
} from "lucide-react";
import { MainContext } from '../../contexts/mainContext';
import MediaCard from '../MediaCard';

const FORMATS = [
    { value: "all", label: "All" },
    { value: "video", label: "Videos" },
    { value: "pdf", label: "PDFs" },
    { value: "img", label: "Images" },
];

const FORMAT_ICONS = {
    all: Layers,
    video: PlayCircle,
    pdf: FileText,
    img: ImageIcon,
};

export default function AssetCollection({
    onThumbnailClick,
    handleCheckboxChange,
    openSourceUpdate,
    deleteResource,
    isDeleting,
    isProjectReadOnly,
}) {

    const {
        categoryOptions,
        knowledgeBase
    } = useContext(MainContext);

    const indexes = categoryOptions.filter(item => item.value !== "all");

    const [openIndexes, setOpenIndexes] = useState({});
    const [openFormats, setOpenFormats] = useState({});

    const toggleIndex = (id) =>
        setOpenIndexes((prev) => ({ ...prev, [id]: !prev[id] }));

    const toggleFormat = (indexId, formatValue) => {
        const key = `${indexId}:${formatValue}`;
        setOpenFormats((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const sourcesForIndex = (index) =>
        knowledgeBase.filter(
            (s) => s.index_id === index.id || s.category?.includes(index.value)
        );

    const sourcesForFormat = (indexSources, formatValue) =>
        formatValue === "all"
            ? indexSources
            : indexSources.filter((s) => s.file_type === formatValue);

    return (
        <div className="w-full max-w-xl rounded-lg overflow-y-auto h-full">
            {indexes.map((index) => {
                const isIndexOpen = !!openIndexes[index.id];
                const indexSources = sourcesForIndex(index);

                return (
                    <div key={index.id}>
                        <button
                            type="button"
                            onClick={() => toggleIndex(index.id)}
                            className="w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-slate-200/60 transition-colors"
                        >
                            {isIndexOpen ? (
                                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                            ) : (
                                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                            )}
                            {isIndexOpen ? (
                                <FolderOpen className="w-4 h-4 text-primary-200 shrink-0" />
                            ) : (
                                <Folder className="w-4 h-4 text-primary-200 shrink-0" />
                            )}
                            <span className="text-sm font-medium text-textColor-300 truncate">
                                {index.label}
                            </span>
                            <span className="ml-auto text-xs text-slate-500">
                                {indexSources.length}
                            </span>
                        </button>

                        {isIndexOpen && (
                            <div className="pl-6 pb-2">
                                {indexSources.length === 0 && (
                                    <p className="px-3 py-2 text-xs italic text-slate-500">
                                        No sources in this folder
                                    </p>
                                )}

                                {FORMATS.map((format) => {
                                    const formatSources = sourcesForFormat(
                                        indexSources,
                                        format.value
                                    );
                                    if (formatSources.length === 0) return null;

                                    const key = `${index.id}:${format.value}`;
                                    const isFormatOpen = !!openFormats[key];
                                    const Icon = FORMAT_ICONS[format.value] || Layers;

                                    return (
                                        <div key={format.value}>
                                            <button
                                                type="button"
                                                onClick={() => toggleFormat(index.id, format.value)}
                                                className="w-full flex items-center gap-2 rounded px-3 py-2 text-left hover:bg-slate-200/60 transition-colors"
                                            >
                                                {isFormatOpen ? (
                                                    <ChevronDown className="w-3.5 h-3.5 text-primary-200 shrink-0" />
                                                ) : (
                                                    <ChevronRight className="w-3.5 h-3.5 text-primary-200 shrink-0" />
                                                )}
                                                <Icon className="w-3.5 h-3.5 text-primary-200 shrink-0" />
                                                <span className="text-sm text-textColor-300">
                                                    {format.label}
                                                </span>
                                                <span className="ml-auto text-xs text-slate-500">
                                                    {formatSources.length}
                                                </span>
                                            </button>

                                            {isFormatOpen && (
                                                <div className="grid [grid-template-columns:repeat(auto-fit,minmax(min(100%,150px),1fr))] gap-2 py-2 pl-6 pr-2">
                                                    {formatSources.map((source) => (
                                                        <MediaCard
                                                            key={source.source_id}
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
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}