import { useEffect, useRef, useState } from "react";
import { assetLength, getFileTypeLabel } from '../utils';
import useFirebase from '../hooks/useFirebase';
// 308k - 28k RUPIAH
const CSS = `
.vs-root { --vs-accent:#8b5cf6; --vs-bg:#16151d; --vs-card:#22212b; --vs-text:#f4f3f8; --vs-muted:#a9a7b8;
  --vs-w:175px; --vs-overlap:150px; font-family:inherit; color:var(--vs-text); }
.vs-track { display:flex; align-items:flex-end; padding:20px; padding-top: 30px; overflow-x:auto; overflow-y:visible; }
.vs-card { position:relative; flex:0 0 var(--vs-w); width:var(--vs-w); aspect-ratio:16/10; padding:0; border:0;
  border-radius:12px; overflow:hidden; background:var(--vs-card); cursor:pointer; text-align:left; color:inherit;
  margin-left:calc(var(--vs-overlap) * -1);
  transform:translateX(var(--vs-shift,0px)) translateY(var(--vs-lift,0px)) rotate(var(--vs-rot,0deg));
  transition:transform .28s cubic-bezier(.2,.8,.2,1), box-shadow .28s;
  box-shadow:-8px 0 12px rgba(0,0,0,.35); }
.vs-card:first-child { margin-left:0; }
.vs-card[data-active="true"] { --vs-lift:-16px; --vs-rot:0deg; z-index:50 !important;
  box-shadow:0 12px 20px rgba(0,0,0,.5), 0 0 0 2px var(--vs-accent); }
.vs-card:focus-visible { outline:none; }
.vs-media { position:absolute; inset:0; width:100%; height:100%; object-fit:cover; pointer-events:none; }
.vs-shade { position:absolute; inset:0; background:linear-gradient(to top, rgba(10,9,16,.92) 0%, rgba(10,9,16,.1) 55%); }
.vs-info { position:absolute; left:12px; right:12px; bottom:10px; }
.vs-title { font-size:14px; font-weight:600; line-height:1.3; display:-webkit-box; -webkit-line-clamp:2;
  -webkit-box-orient:vertical; overflow:hidden; }
.vs-sub { margin-top:3px; font-size:11px; color:var(--vs-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.vs-play { position:absolute; top:50%; left:50%; width:44px; height:44px; margin:-22px 0 0 -22px; border-radius:50%;
  background:rgba(0,0,0,.55); display:grid; place-items:center; opacity:0; transform:scale(.8); transition:.2s; }
.vs-card[data-active="true"] .vs-play { opacity:1; transform:scale(1); }
.vs-dur { position:absolute; top:8px; right:8px; font-size:11px; padding:2px 6px; border-radius:6px; background:rgba(0,0,0,.6); }

.vs-overlay { position:fixed; inset:0; z-index:1000; display:grid; place-items:center; padding:24px;
  background:rgba(8,7,13,.72); backdrop-filter:blur(4px); animation:vs-fade .18s ease-out; }
.vs-head { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:12px 16px; }
.vs-head h3 { margin:0; font-size:15px; font-weight:600; }
.vs-head p { margin:2px 0 0; font-size:12px; color:var(--vs-muted); }
.vs-close { border:0; border-radius:8px; padding:8px 12px; background:var(--vs-accent); color:#fff; font-weight:600; cursor:pointer; }
.vs-close:focus-visible { outline:2px solid #fff; outline-offset:2px; }
.vs-player { display:block; width:100%; max-height:70vh; background:#000; }
@keyframes vs-fade { from { opacity:0 } }
@keyframes vs-pop { from { opacity:0; transform:translateY(12px) scale(.97) } }
@media (hover:none) { .vs-card[data-active="true"] { --vs-lift:0px; } }
@media (prefers-reduced-motion:reduce) {
  .vs-card, .vs-play, .vs-overlay, .vs-dialog { transition:none; animation:none; } }
`;

function Thumb({ video }) {
    const { getPublicUrl } = useFirebase();
    const [publicThumbnailUrl, setPublicThumbnailUrl] = useState(null);

    useEffect(() => {
        getPublicUrl(video.thumbnail)
            .then((url) => {
                setPublicThumbnailUrl(url);
            })
            .catch((error) => {
                console.error("Error fetching public URL:", error);
            });
    }, [video.source_id, getPublicUrl]);

    if (video.thumbnail) {
        return <img className="vs-media" src={publicThumbnailUrl || video.thumbnail} alt="" loading="lazy" />;
    }
}

export default function VideoStack({ videos, onSelect }) {
    const [hovered, setHovered] = useState(null);
    const lastTrigger = useRef(null);

    const open = (video, el) => {
        lastTrigger.current = el;
        onSelect?.(video);
    };

    const mid = (videos.length - 1) / 2;

    return (
        <div className="vs-root">
            <style>{CSS}</style>

            <div className="vs-track" onMouseLeave={() => setHovered(null)}>
                {videos.map((v, i) => {
                    const active = hovered === i;
                    // Cards to the right of the active one slide out so its full face is visible.
                    const shift = hovered !== null && i > hovered ? 120 : 0;
                    return (
                        <button
                            key={v.source_id}
                            className="vs-card"
                            data-active={active}
                            aria-label={`Play ${v.source_path}`}
                            style={{
                                zIndex: i + 1,
                                "--vs-shift": `${shift}px`,
                                "--vs-rot": `${(i - mid) * 1.5}deg`,
                            }}
                            onMouseEnter={() => setHovered(i)}
                            onFocus={() => setHovered(i)}
                            onBlur={() => setHovered(null)}
                            onClick={(e) => open(v, e.currentTarget)}
                        >
                            <Thumb video={v} />
                            <span className="vs-shade" />

                            {
                                v.file_type !== "img" && (
                                    <span className="vs-dur">{assetLength(v)}</span>
                                )
                            }

                            <span className="vs-info">
                                <span className="vs-title">{v.source_path}</span>
                                <span className="vs-sub" style={{ display: "block" }}>{getFileTypeLabel(v.file_type)} • {v.category}</span>
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* {selected && <PlayerDialog video={selected} onClose={close} />} */}
        </div>
    );
}