import { useContext, useState } from "react";
import { Film, Clock, Layers, PlayCircle } from "lucide-react";
import { MainContext } from '../../contexts/mainContext';
import ReelViewer from '../ReelViewer';
import GsFile from '../GsFile';

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
    return short.id ?? short.reel_url ?? short.edl_url ?? short.thumbnail_url;
}

function totalDuration(short) {
    return short.segments?.reduce((sum, seg) => sum + (seg.duration || 0), 0) ?? 0;
}

/**
 * ShortsList — two-column shorts browser.
 *
 * Left column: scrollable list of shorts (thumbnail, title, clip count,
 * total duration, created date). Right column: the selected short's
 * player on top and its info panel below, using your existing
 * `PlayerComponent` / `InfoComponent`.
 *
 * Fills 100% of its parent's height (parent needs a bounded height, e.g.
 * flex + min-h-0) — each column scrolls independently and the whole thing
 * never overflows the app shell.
 *
 * Props:
 *  - shorts: [reel] — array shaped like the `newReel` object you shared
 *  - selectedShortId, onSelectedShortIdChange: controlled selection
 *    (optional — falls back to internal state if omitted)
 *  - PlayerComponent: your existing video player component, rendered as
 *    `<PlayerComponent short={selectedShort} src={selectedShort.reel_video_url} />`
 *  - InfoComponent: your existing short-details component, rendered as
 *    `<InfoComponent short={selectedShort} />`
 *  - className: extra classes on the root element
 */
export default function ShortsList({
    selectedShortId: selectedIdProp,
    onSelectedShortIdChange,
    PlayerComponent,
    InfoComponent,
    className = "",
}) {

    const {
        reels: shorts,
        selectedReel: selectedShort,
        setSelectedReel: setSelectedShort
    } = useContext(MainContext);

    const [internalSelectedId, setInternalSelectedId] = useState(null);
    const selectedId = selectedIdProp ?? internalSelectedId;
    const setSelectedId = onSelectedShortIdChange ?? setInternalSelectedId;

    return (
        <div className={`h-full min-h-0 flex overflow-hidden ${className}`}>
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
                                active={key === selectedId}
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

                        {InfoComponent ? (
                            <InfoComponent short={selectedShort} />
                        ) : (
                            <div className="text-[12.5px] text-ink-muted">InfoComponent not provided</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function ShortListItem({ short, active, onClick }) {
    const clipCount = short.segments?.length ?? 0;

    return (
        <button
            type="button"
            onClick={onClick}
            aria-current={active ? "true" : undefined}
            className={`w-full flex items-center gap-3 rounded-lg p-2 text-left border transition-colors ${active ? "border-primary bg-[#F6F3FE]" : "border-border hover:border-border-strong hover:bg-surface-alt"
                }`}
        >
            <GsFile className="!w-12 !h-12 !rounded-md" gsUrl={short.thumbnail_url ?? short.thumbnail} alt={short.title || short.filename} />
            <span className="min-w-0 flex-1">
                <span className="block text-[12.5px] font-semibold text-ink truncate">
                    {short.title || short.filename}
                </span>
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
