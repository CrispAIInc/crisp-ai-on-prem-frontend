import { useContext, useRef, useState } from "react";
import { Film, Clock, Layers, PlayCircle, Pencil, Trash } from "lucide-react";
import { MainContext } from '../../contexts/mainContext';
import ReelViewer from '../ReelViewer';
import GsFile from '../GsFile';
import ActionMenu from '../ActionMenu';
import AnimatedText from '../AnimatedText';
import FilenameUpdateModal from "../AppSingleValueModal";
import LoadingSpinner from '../LoadingSpinner';
import { ProjectContext } from '../../contexts/projectContext';
import useFirebase from '../../hooks/useFirebase';
import makeApiRequest from '../../api';
import { useToast } from '../../contexts/toastContext';
import ReelProps from '../ReelProps';

function isHttpUrl(url) {
    return typeof url === "string" && /^https?:\/\//.test(url);
}

// 45 -> "0:45", 95.7 -> "1:36"
function formatDuration(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = Math.round(totalSeconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(isoString) {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

// The reel payload has no stable `id` field — fall back to a URL that's
// unique per reel. Swap this for a real id as soon as the backend has one.
function shortKey(short) {
    return short.id ?? short.reel_video_url ?? short.edl_url ?? short.thumbnail_url;
}

function totalDuration(short) {
    return short.segments?.reduce((sum, seg) => sum + (seg.duration || 0), 0) ?? 0;
}

export default function ShortsList() {

    const {
        reels: shorts,
        selectedReel: selectedShort,
        setSelectedReel: setSelectedShort
    } = useContext(MainContext);

    return (
        <div className={`h-full min-h-0 flex overflow-hidden`}>
            {/* Left column — list */}
            <div className="w-[280px] shrink-0 border-r border-border h-full min-h-0 overflow-y-auto p-3 flex flex-col gap-2">
                {shorts.length === 0 ? (
                    <p className="text-center text-[12.5px] font-semibold text-ink-secondary py-8">No shorts found</p>
                ) : (
                    shorts.map((short) => {
                        const key = shortKey(short);
                        return (
                            <ShortListItem
                                key={key}
                                short={short}
                                active={short.id === selectedShort?.id}
                                onClick={() => setSelectedShort(short)}
                            />
                        );
                    })
                )}
            </div>

            {/* Right column — selected short */}
            <div className="flex-1 min-w-0 h-full min-h-0 overflow-y-auto">
                {!selectedShort ? (
                    <div className="h-full flex flex-col items-center justify-center text-center gap-2.5 px-6">
                        <div className="w-11 h-11 rounded-xl bg-surface-alt flex items-center justify-center text-ink-muted">
                            <PlayCircle size={19} />
                        </div>
                        <strong className="text-ink text-[13px] font-semibold">Select a short</strong>
                        <span className="text-[12.5px] text-ink-muted max-w-[260px]">
                            Pick a short from the list to preview it and see its details.
                        </span>
                    </div>
                ) : (
                    <div className="p-4 flex flex-col gap-4">
                        <ReelViewer />

                        <ReelProps />
                    </div>
                )}
            </div>
        </div>
    );
}

function ShortListItem({ short, active, onClick }) {

    const { isProjectReadOnly } = useContext(ProjectContext);
    const { reels, setReels } = useContext(MainContext);
    const { getPublicUrl } = useFirebase();
    const { notify } = useToast();

    const [reelTitleUpdateValue, setReelTitleUpdateValue] = useState('');
    const [showUpdateReelTitleModal, setShowUpdateReelTitleModal] = useState(false);
    const [isReelDeleting, setIsReelDeleting] = useState(false);
    const [hoveredReel, setHoveredReel] = useState(null);

    const hoveredReelRef = useRef(null);


    const clipCount = short.segments?.length ?? 0;

    const handleMouseEnterReel = (id) => {
        setHoveredReel(id);
        hoveredReelRef.current = id;
    };
    const handleMouseLeaveReel = () => {
        setHoveredReel(null);
    };

    function handleOpenFilenameUpdateModal(event, reel) {
        event.stopPropagation();
        setReelTitleUpdateValue(reel.title);
        setShowUpdateReelTitleModal(true);
    }

    async function deleteReel(event, reel) {
        if (isProjectReadOnly) return;
        event.preventDefault();
        setIsReelDeleting(true);
        try {
            const publicReelUrl = await getPublicUrl(reel.reel_video_url);
            await makeApiRequest(`/reels/${reel.id}`, 'DELETE', JSON.stringify({
                videoUrl: publicReelUrl,
            }));

            notify({
                variant: "success",
                heading: "Reel deleted successfully!",
            });
            setReels(prev => prev.filter(item => item.id !== reel.id));
            // getReels();
        } catch (error) {
            console.log(error);
            notify({
                variant: "error",
                heading: "Oops!",
                subheading: "An error occurred while deleting the reel",
            });
        } finally {
            setIsReelDeleting(false);
        }
    }

    return (
        <>
            <button
                type="button"
                onClick={onClick}
                onMouseEnter={() => handleMouseEnterReel(short.id)}
                onMouseLeave={handleMouseLeaveReel}
                aria-current={active ? "true" : undefined}
                className={`w-full flex items-center gap-3 bg-white shadow-sm rounded-lg p-2 text-left transition-colors !border hover:!border-primary-300 ${active && "!border !border-primary-300"}`}
            >
                <GsFile className="!w-12 !h-12 !rounded-md" gsUrl={short.thumbnail_url ?? short.thumbnail} alt={short.title || short.filename} />
                <span className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                        <span className="block text-[12.5px] font-semibold text-ink truncate">
                            {short.title || short.filename}
                        </span>

                        {
                            !isProjectReadOnly && (
                                <ActionMenu
                                    actions={[
                                        {
                                            label: "Edit title",
                                            icon: <Pencil size={13} />,
                                            onClick: (e) => {
                                                e.stopPropagation();
                                                handleOpenFilenameUpdateModal(e, short);
                                            },
                                        },
                                        {
                                            label: isReelDeleting ? <AnimatedText text='Deleting...' cssClasses="!font-semibold !text-sm" /> : "Delete",
                                            icon: isReelDeleting ? <LoadingSpinner isSmall /> : <Trash size={13} />,
                                            onClick: (e) => deleteReel(e, short),
                                        },
                                    ]}
                                />
                            )
                        }
                    </div>
                    <span className="flex items-center gap-3 mt-1">
                        <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                            <Clock size={11} />
                            {formatDuration(totalDuration(short))}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-ink-muted">
                            <Layers size={11} />
                            {clipCount} segment{clipCount === 1 ? "" : "s"}
                        </span>
                    </span>
                    <span className="block text-[10.5px] text-ink-muted mt-0.5">{formatDate(short.created_at)}</span>
                </span>
            </button>

            {
                showUpdateReelTitleModal && (
                    <FilenameUpdateModal
                        value={reelTitleUpdateValue}
                        setValue={setReelTitleUpdateValue}
                        label="Update short title"
                        show={showUpdateReelTitleModal}
                        onHide={() => setShowUpdateReelTitleModal(false)}
                        reel={reels.find(r => r.id === hoveredReelRef.current)}
                    />
                )
            }
        </>
    );
}

function Thumb({ src, size }) {
    const style = { width: size, height: size };
    if (isHttpUrl(src)) {
        return <img src={src} alt="" style={style} className="rounded-md object-cover shrink-0" />;
    }
    return (
        <span style={style} className="rounded-md bg-surface-alt flex items-center justify-center text-ink-muted shrink-0">
            <Film size={size * 0.45} />
        </span>
    );
}
