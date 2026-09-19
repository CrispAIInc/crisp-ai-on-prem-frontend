import { Film, Info, PlayCircle } from "lucide-react";
import { useContext } from "react";
import { MainContext } from '../../contexts/mainContext';
import EmptyState from "../EmptyState";
import ReelProps from '../ReelProps';
import ReelViewer from '../ReelViewer';
import ShortListItem from '../ShortListItem';

function isHttpUrl(url) {
    return typeof url === "string" && /^https?:\/\//.test(url);
}

// 45 -> "0:45", 95.7 -> "1:36"


// The reel payload has no stable `id` field — fall back to a URL that's
// unique per reel. Swap this for a real id as soon as the backend has one.
function shortKey(short) {
    return short.id ?? short.reel_video_url ?? short.edl_url ?? short.thumbnail_url;
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
                    <EmptyState
                        icon={<Info size={20} />}
                        title="No Shorts found"
                        description="Use left panel to start generating Shorts."
                    />
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
                    <EmptyState
                        icon={<PlayCircle size={20} />}
                        title="Select a Short"
                        description="Pick a short from the list to preview it and see its details."
                        twClasses="!flex-1 !h-full"
                    />
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
