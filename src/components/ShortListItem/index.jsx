import { Clock, Layers, Pencil, Trash } from "lucide-react";
import { useContext, useRef, useState } from "react";
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext';
import { ProjectContext } from '../../contexts/projectContext';
import { useToast } from '../../contexts/toastContext';
import useFirebase from '../../hooks/useFirebase';
import ActionMenu from '../ActionMenu';
import AnimatedText from '../AnimatedText';
import FilenameUpdateModal from "../AppSingleValueModal";
import GsFile from '../GsFile';
import LoadingSpinner from '../LoadingSpinner';
import { formatDate, formatDuration } from '../../utils';

export default function ShortListItem({ short, active, onClick }) {

    const { isProjectReadOnly } = useContext(ProjectContext);
    const { reels, setReels, selectedReel, setSelectedReel } = useContext(MainContext);
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

    function totalDuration(short) {
        return short.segments?.reduce((sum, seg) => sum + (seg.duration || 0), 0) ?? 0;
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

            //SET CURRENT REEL TO NULL IF IT'S THE ONE BEING DELETED
            if (selectedReel.id === reel.id) {
                setSelectedReel(null);
            }

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