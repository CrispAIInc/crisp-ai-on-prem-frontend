import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import { Pencil, Check, Film, Image as ImageIcon } from "lucide-react";
import ActionMenu from "../ActionMenu";
import CircularProgressWithLabel from "../CircularProgressWithLabel";
import GsFile from "../GsFile";
import BaseHeading from '../BaseHeading';
import LoadingSpinner from '../LoadingSpinner';

function formatTimestamp(value) {
    if (value === null || value === undefined || value === "") return "";
    if (typeof value !== "number") return value;

    const totalSeconds = Math.max(0, Math.round(value));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
        : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export default function MediaCard({ source, onOpen, onToggle, onUpdate, onDelete, isDeleting, isProjectReadOnly, isDiscoveryResult = false }) {
    const isChecked = Boolean(source?.is_checked);
    const isUploading = Object.prototype.hasOwnProperty.call(source || {}, "progress");
    const Icon = source?.file_type === "video" ? Film : ImageIcon;
    const discoveryLocation = isDiscoveryResult
        ? source?.file_type === "pdf" && Number.isFinite(source?.page)
            ? `Page ${source.page}`
            : source?.file_type === "video" && source?.timestamp !== null && source?.timestamp !== undefined
                ? `Timestamp ${formatTimestamp(source.timestamp)}`
                : null
        : null;

    return (
        <div
            className={`group relative rounded-xl border bg-white shadow-sm transition-colors cursor-pointer ${isChecked
                ? "border-primary-300 ring-2 ring-primary-100"
                : "border-gray-100 hover:border-gray-200"
                }`}
            onClick={(event) => onOpen(event, source)}
        >
            <div
                className={`absolute top-2.5 left-2.5 z-1 flex h-5 w-5 items-center justify-center rounded border transition-colors ${isChecked
                    ? "border-primary-300 bg-primary-300"
                    : "border-gray-300 bg-white/90 group-hover:border-gray-400"
                    }`}
                onClick={(event) => {
                    event.stopPropagation();
                    onToggle(!isChecked, source);
                }}
                role="checkbox"
                aria-checked={isChecked}
                tabIndex={0}
                onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        event.stopPropagation();
                        onToggle(!isChecked, source);
                    }
                }}
            >
                {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
            </div>

            <div className="relative flex aspect-video items-center justify-center rounded-t-xl bg-gray-900">
                {source?.thumbnail ? (
                    source.thumbnail.startsWith("blob") && source.file_type === "video" ? (
                        <video
                            src={source.thumbnail}
                            className="h-full w-full object-cover rounded-xl"
                            muted
                            controls={false}
                            aria-label={source.source_path}
                        />
                    ) : (
                        <GsFile
                            gsUrl={source.thumbnail}
                            className="h-full w-full object-cover rounded-xl"
                            alt={source.source_path}
                            isPrivate
                        />
                    )
                ) : (
                    <Icon size={30} className="text-white/40" />
                )}
                {source?.file_type === "video" && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white/80">
                        Video
                    </span>
                )}

                {source?.file_type === "img" && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white/80">
                        Image
                    </span>
                )}

                {source?.file_type === "pdf" && (
                    <span className="absolute bottom-2 right-2 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white/80">
                        PDF
                    </span>
                )}

                {isUploading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/65">
                        <CircularProgressWithLabel value={source.progress} variant="determinate" isUploadFailed={false} />
                        <BaseHeading text={source.step} className="!text-primary-300 !text-[10px] !font-bold !mt-1" />
                    </div>
                )}
                {typeof source?.score === "number" && (
                    <span className="absolute bottom-2 left-2 rounded bg-primary-100/80 px-1.5 py-0.5 text-[10px] font-bold text-primary-300">
                        {Math.round(source.score * 10)}% score
                    </span>
                )}
            </div>

            <div className="relative border-t border-gray-100 px-2.5 py-2 flex items-center justify-between gap-2">
                <div className="min-w-0">
                    <p className="truncate text-[12px] text-gray-700" title={source?.source_path}>
                        {source?.source_path?.replace(/\.[^/.]+$/, "")}
                    </p>
                    {discoveryLocation && (
                        <p className="mt-0.5 truncate text-[10px] text-gray-500">
                            {discoveryLocation}
                        </p>
                    )}
                </div>
                {!isUploading && !isProjectReadOnly && (
                    <div>
                        <ActionMenu
                            actions={[
                                {
                                    label: "Rename",
                                    icon: <Pencil size={15} />,
                                    onClick: (event) => onUpdate(event, source),
                                },
                                {
                                    label: "Delete",
                                    icon: isDeleting ? <LoadingSpinner isSmall /> : <DeleteOutlineOutlinedIcon fontSize="small" />,
                                    onClick: (event) => onDelete(event, [source]),
                                }
                            ]}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
