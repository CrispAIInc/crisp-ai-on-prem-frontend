import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactPlayer from 'react-player';
import {
    Play,
    Pause,
    RotateCcw,
    RotateCw,
    Volume2,
    VolumeX,
    // Settings,
    PictureInPicture2,
    Maximize,
    Minimize,
    Dot
} from 'lucide-react';

/**
 * CustomVideoPlayer
 * -------------------------------------------------------------
 * Drop-in replacement for the default ReactPlayer `controls` UI.
 * Keeps ReactPlayer for actual playback/source handling, but renders
 * a fully custom control bar + scrubber underneath (dark, pill-shaped
 * markers on the progress track, title left-aligned above the bar).
 *
 * Props mirror the ones already used in your app so it's a near
 * drop-in swap for the previous <ReactPlayer .../> block.
 */

const formatTime = (seconds = 0) => {
    if (!Number.isFinite(seconds)) return '0:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const mm = h > 0 ? String(m).padStart(2, '0') : m;
    const ss = String(s).padStart(2, '0');
    return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

// "HH:MM:SS" or "MM:SS" -> total seconds
const parseTimestamp = (ts) => {
    if (typeof ts !== 'string') return 0;
    const parts = ts.split(':').map((p) => parseFloat(p) || 0);
    return parts.reduce((acc, p) => acc * 60 + p, 0);
};

export default function CustomVideoPlayer({
    sourcePublicUrl,
    resourceURL,
    video_autoplay = false,
    video_loop = false,
    theme = 'dark',
    title = '',
    // chapters: raw `data.content` array from the API, e.g.
    // [{ title: "Welcome and The Rehearsal Dance", timestamp: ["00:00:00", "00:00:41"], ... }, ...]
    chapters = [],
    // highlights: same shape as chapters (array of { title, timestamp: [start, end], ... })
    highlights = [],
    onReady,
    onDuration,
    playerRef, // optional external ref, in addition to internal one
}) {
    const internalRef = useRef(null);
    const containerRef = useRef(null);
    const hideControlsTimeout = useRef(null);

    const [playing, setPlaying] = useState(video_autoplay);
    const [played, setPlayed] = useState(0); // fraction 0-1
    const [duration, setDuration] = useState(0);
    const [seeking, setSeeking] = useState(false);
    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showVolumeSlider, setShowVolumeSlider] = useState(false);
    const [hoveredChapterIdx, setHoveredChapterIdx] = useState(null);
    const [hoveredHighlightIdx, setHoveredHighlightIdx] = useState(null);

    const setRefs = useCallback(
        (node) => {
            internalRef.current = node;
            if (playerRef) {
                if (typeof playerRef === 'function') playerRef(node);
                else playerRef.current = node;
            }
        },
        [playerRef]
    );

    const url = sourcePublicUrl || resourceURL;

    const togglePlay = () => setPlaying((p) => !p);

    const handleSeekMouseDown = () => setSeeking(true);

    const handleSeekChange = (e) => {
        setPlayed(parseFloat(e.target.value));
    };

    const handleSeekMouseUp = (e) => {
        setSeeking(false);
        internalRef.current?.seekTo(parseFloat(e.target.value));
    };

    const skip = (seconds) => {
        const current = internalRef.current?.getCurrentTime?.() ?? 0;
        internalRef.current?.seekTo(Math.max(0, current + seconds));
    };

    const toggleMute = () => setMuted((m) => !m);

    const handleVolumeChange = (e) => {
        const v = parseFloat(e.target.value);
        setVolume(v);
        setMuted(v === 0);
    };

    const togglePip = async () => {
        const videoEl = containerRef.current?.querySelector('video');
        if (!videoEl) return;
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await videoEl.requestPictureInPicture();
            }
        } catch (err) {
            console.warn('PiP not supported', err);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current?.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', onFsChange);
        return () => document.removeEventListener('fullscreenchange', onFsChange);
    }, []);

    const wakeControls = useCallback(() => {
        setShowControls(true);
        clearTimeout(hideControlsTimeout.current);
        hideControlsTimeout.current = setTimeout(() => {
            if (playing) setShowControls(false);
        }, 2200);
    }, [playing]);

    useEffect(() => () => clearTimeout(hideControlsTimeout.current), []);

    const currentSeconds = played * duration;

    // Build [{ title, start, end }] segments (as fractions of duration) from
    // the raw chapter objects (each with a `timestamp: [start, end]` pair of
    // "HH:MM:SS" strings). Falls back to one full-width segment if no
    // chapters were passed in, or if duration isn't known yet.
    const sortedChapters = [...chapters].sort(
        (a, b) => parseTimestamp(a.timestamp?.[0]) - parseTimestamp(b.timestamp?.[0])
    );
    const segments = (() => {
        if (sortedChapters.length === 0 || duration <= 0) {
            return [{ title: null, start: 0, end: 1 }];
        }
        const built = sortedChapters.map((ch) => ({
            title: ch.title,
            start: parseTimestamp(ch.timestamp?.[0]) / duration,
            end: Math.min(1, parseTimestamp(ch.timestamp?.[1]) / duration),
        }));
        // Pad any gap before, between, or after chapters with an invisible
        // filler segment so the track always spans the full 0-1 width — even
        // if chapter timestamps don't fully cover the video's real duration.
        const filled = [];
        let cursor = 0;
        built.forEach((seg) => {
            if (seg.start > cursor) {
                filled.push({ title: null, start: cursor, end: seg.start });
            }
            filled.push(seg);
            cursor = Math.max(cursor, seg.end);
        });
        if (cursor < 1) {
            filled.push({ title: null, start: cursor, end: 1 });
        }
        return filled;
    })();

    const currentChapter =
        segments.find((seg) => played >= seg.start && played < seg.end) ||
        segments[segments.length - 1];

    // Highlight ranges as fractions of full duration (0-1), positioned on top
    // of the chapter track. Same shape as chapters: { title, timestamp: [start, end] }.
    const highlightRanges =
        duration > 0
            ? highlights.map((h) => ({
                title: h.title,
                start: parseTimestamp(h.timestamp?.[0]) / duration,
                end: Math.min(1, parseTimestamp(h.timestamp?.[1]) / duration),
            }))
            : [];

    return (
        <div
            ref={containerRef}
            onMouseMove={wakeControls}
            onMouseLeave={() => playing && setShowControls(false)}
            className={`group relative aspect-video w-full overflow-hidden rounded-xl shadow-md select-none`}
            style={{ background: '#05060a' }}
        >
            <ReactPlayer
                id="react-player"
                ref={setRefs}
                className="absolute top-0 left-0"
                width="100%"
                height="100%"
                playing={playing}
                loop={video_loop}
                volume={volume}
                muted={muted}
                url={url}
                controls={false}
                onReady={() => onReady?.()}
                onDuration={(d) => {
                    setDuration(d);
                    onDuration?.(d);
                }}
                onProgress={(state) => {
                    if (!seeking) setPlayed(state.played);
                }}
                onClick={togglePlay}
                progressInterval={250}
            />

            {/* Center play/pause tap target */}
            <button
                aria-label={playing ? 'Pause' : 'Play'}
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center"
                tabIndex={-1}
            >
                {!playing && (
                    <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm ring-1 ring-white/20 transition-transform duration-150 hover:scale-105">
                        <Play className="h-7 w-7 text-white" fill="white" />
                    </span>
                )}
            </button>

            {/* Bottom gradient + control bar */}
            <div
                className={`absolute inset-x-0 bottom-0 px-3 pb-2 pt-10 transition-opacity duration-200 ${showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                style={{
                    background:
                        'linear-gradient(to top, rgba(5,6,10,0.92) 0%, rgba(5,6,10,0.55) 55%, rgba(5,6,10,0) 100%)',
                }}
            >
                {/* Current chapter title row */}
                {currentChapter?.title && (
                    <div className="mb-1.5 truncate text-[13px] font-medium text-white/90 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md w-fit flex items-center gap-1">
                        <Dot strokeWidth={7} color="#A78BFA" />
                        {currentChapter.title}
                    </div>
                )}

                {/* Scrubber */}
                <div className="relative mb-2 flex h-6 flex-col justify-center gap-1">
                    <div className="flex h-1 w-full items-center gap-[3px]">
                        {segments.map((seg, i) => {
                            const segWidth = seg.end - seg.start;
                            const segPlayed =
                                segWidth <= 0
                                    ? 0
                                    : Math.min(1, Math.max(0, (played - seg.start) / segWidth));
                            return (
                                <div
                                    key={i}
                                    className="relative h-1.5 rounded-full bg-white/20"
                                    style={{ width: `${segWidth * 100}%` }}
                                    onMouseEnter={() => setHoveredChapterIdx(i)}
                                    onMouseLeave={() =>
                                        setHoveredChapterIdx((cur) => (cur === i ? null : cur))
                                    }
                                >
                                    <div
                                        className="absolute left-0 top-0 h-1.5 rounded-full"
                                        style={{
                                            width: `${segPlayed * 100}%`,
                                            background: '#755bea',
                                        }}
                                    />
                                    {seg.title && hoveredChapterIdx === i && (
                                        <div className="pointer-events-none absolute bottom-3 left-0 z-10 whitespace-nowrap rounded-md bg-[#05060a] px-2 py-1 text-[11px] font-medium text-white shadow ring-1 ring-white/10">
                                            {seg.title}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {/* scrub handle */}
                        <span
                            className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white opacity-0 shadow group-hover:opacity-100"
                            style={{ left: `${played * 100}%` }}
                        />
                    </div>

                    {/* Highlight strip */}
                    {highlightRanges.length > 0 && (
                        <div className="relative h-[1px] w-full rounded-full">
                            {highlightRanges.map((hl, i) => (
                                <div
                                    key={i}
                                    className="group/hl  absolute top-0 h-[3px] cursor-pointer rounded-full"
                                    style={{
                                        left: `${hl.start * 100}%`,
                                        // width: `${Math.max(0.5, (hl.end - hl.start) * 100)}%`,
                                        borderRadius: '50%',
                                        width: "8px",
                                        height: "8px",
                                        background: '#FBBF24',
                                    }}
                                    onMouseEnter={() => setHoveredHighlightIdx(i)}
                                    onMouseLeave={() =>
                                        setHoveredHighlightIdx((cur) => (cur === i ? null : cur))
                                    }
                                    onClick={() => {
                                        internalRef.current?.seekTo(hl.start);
                                        setPlayed(hl.start);
                                    }}
                                >
                                    {hl.title && hoveredHighlightIdx === i && (
                                        <div
                                            className={`pointer-events-none flex items-center gap-1 absolute bottom-2 z-10 whitespace-nowrap text-white/90 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md w-fit text-[11px] font-medium text-white shadow ring-1 ring-white/10 ${hl.start > 0.75 ? 'right-0' : 'left-0'
                                                }`}
                                        >
                                            {/* <Dot strokeWidth={3} color="#FBBF24" /> */}
                                            <div className="flex flex-col">
                                                <span className="italic  text-gradient-x text-[10px]">{highlights[i]?.timestamp[0]}</span>
                                                <span>{hl.title}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    <input
                        type="range"
                        min={0}
                        max={0.999999}
                        step="any"
                        value={played}
                        onMouseDown={handleSeekMouseDown}
                        onTouchStart={handleSeekMouseDown}
                        onChange={handleSeekChange}
                        onMouseUp={handleSeekMouseUp}
                        onTouchEnd={handleSeekMouseUp}
                        className="absolute inset-0 h-4 w-full cursor-pointer opacity-0"
                        aria-label="Seek"
                    />
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={togglePlay}
                            aria-label={playing ? 'Pause' : 'Play'}
                            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
                        >
                            {playing ? (
                                <Pause className="h-4 w-4" fill="white" />
                            ) : (
                                <Play className="ml-0.5 h-4 w-4" fill="white" />
                            )}
                        </button>

                        <button
                            onClick={() => skip(-10)}
                            aria-label="Back 10 seconds"
                            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
                        >
                            <RotateCcw className="h-4 w-4" />
                        </button>
                        <button
                            onClick={() => skip(10)}
                            aria-label="Forward 10 seconds"
                            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
                        >
                            <RotateCw className="h-4 w-4" />
                        </button>

                        <span className="text-[12px] tabular-nums text-white/80">
                            {formatTime(currentSeconds)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <div
                            className="relative flex items-start"
                            onMouseEnter={() => setShowVolumeSlider(true)}
                            onMouseLeave={() => setShowVolumeSlider(false)}
                        >
                            <div
                                className={`overflow-hidden transition-all duration-150 ${showVolumeSlider ? 'w-16 opacity-100' : 'w-0 opacity-0'
                                    }`}
                            >
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={muted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="h-1 w-14 accent-[#A78BFA]"
                                    aria-label="Volume"
                                />
                            </div>
                            <button
                                onClick={toggleMute}
                                aria-label={muted ? 'Unmute' : 'Mute'}
                                className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
                            >
                                {muted || volume === 0 ? (
                                    <VolumeX className="h-4 w-4" />
                                ) : (
                                    <Volume2 className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        {/* <button
                            aria-label="Settings"
                            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
                        >
                            <Settings className="h-4 w-4" />
                        </button> */}
                        <button
                            onClick={togglePip}
                            aria-label="Picture in picture"
                            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
                        >
                            <PictureInPicture2 className="h-4 w-4" />
                        </button>
                        <button
                            onClick={toggleFullscreen}
                            aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
                            className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
                        >
                            {isFullscreen ? (
                                <Minimize className="h-4 w-4" />
                            ) : (
                                <Maximize className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


// import React, { useState, useRef, useCallback, useEffect } from 'react';
// import ReactPlayer from 'react-player';
// import {
//     Play,
//     Pause,
//     RotateCcw,
//     RotateCw,
//     Volume2,
//     VolumeX,
//     Settings,
//     PictureInPicture2,
//     Maximize,
//     Minimize,
//     Dot
// } from 'lucide-react';

// /**
//  * CustomVideoPlayer
//  * -------------------------------------------------------------
//  * Drop-in replacement for the default ReactPlayer `controls` UI.
//  * Keeps ReactPlayer for actual playback/source handling, but renders
//  * a fully custom control bar + scrubber underneath (dark, pill-shaped
//  * markers on the progress track, title left-aligned above the bar).
//  *
//  * Props mirror the ones already used in your app so it's a near
//  * drop-in swap for the previous <ReactPlayer .../> block.
//  */

// const formatTime = (seconds = 0) => {
//     if (!Number.isFinite(seconds)) return '0:00';
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = Math.floor(seconds % 60);
//     const mm = h > 0 ? String(m).padStart(2, '0') : m;
//     const ss = String(s).padStart(2, '0');
//     return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
// };

// // "HH:MM:SS" or "MM:SS" -> total seconds
// const parseTimestamp = (ts) => {
//     if (typeof ts !== 'string') return 0;
//     const parts = ts.split(':').map((p) => parseFloat(p) || 0);
//     return parts.reduce((acc, p) => acc * 60 + p, 0);
// };

// export default function CustomVideoPlayer({
//     sourcePublicUrl,
//     resourceURL,
//     video_autoplay = false,
//     video_loop = false,
//     theme = 'dark',
//     title = '',
//     // optional: chapter/highlight markers as fractions [0-1] of duration
//     // chapters: raw `data.content` array from the API, e.g.
//     // [{ title: "Welcome and The Rehearsal Dance", timestamp: ["00:00:00", "00:00:41"], ... }, ...]
//     chapters = [],
//     highlights = [],
//     onReady,
//     onDuration,
//     playerRef, // optional external ref, in addition to internal one
// }) {
//     const internalRef = useRef(null);
//     const containerRef = useRef(null);
//     const hideControlsTimeout = useRef(null);

//     const [playing, setPlaying] = useState(video_autoplay);
//     const [played, setPlayed] = useState(0); // fraction 0-1
//     const [duration, setDuration] = useState(0);
//     const [seeking, setSeeking] = useState(false);
//     const [volume, setVolume] = useState(1);
//     const [muted, setMuted] = useState(false);
//     const [showControls, setShowControls] = useState(true);
//     const [isFullscreen, setIsFullscreen] = useState(false);
//     const [showVolumeSlider, setShowVolumeSlider] = useState(false);
//     const [hoveredChapterIdx, setHoveredChapterIdx] = useState(null);
//     const [hoveredHighlightIdx, setHoveredHighlightIdx] = useState(null);

//     const setRefs = useCallback(
//         (node) => {
//             internalRef.current = node;
//             if (playerRef) {
//                 if (typeof playerRef === 'function') playerRef(node);
//                 else playerRef.current = node;
//             }
//         },
//         [playerRef]
//     );

//     const url = sourcePublicUrl || resourceURL;

//     const togglePlay = () => setPlaying((p) => !p);

//     const handleSeekMouseDown = () => setSeeking(true);

//     const handleSeekChange = (e) => {
//         setPlayed(parseFloat(e.target.value));
//     };

//     const handleSeekMouseUp = (e) => {
//         setSeeking(false);
//         internalRef.current?.seekTo(parseFloat(e.target.value));
//     };

//     const skip = (seconds) => {
//         const current = internalRef.current?.getCurrentTime?.() ?? 0;
//         internalRef.current?.seekTo(Math.max(0, current + seconds));
//     };

//     const toggleMute = () => setMuted((m) => !m);

//     const handleVolumeChange = (e) => {
//         const v = parseFloat(e.target.value);
//         setVolume(v);
//         setMuted(v === 0);
//     };

//     const togglePip = async () => {
//         const videoEl = containerRef.current?.querySelector('video');
//         if (!videoEl) return;
//         try {
//             if (document.pictureInPictureElement) {
//                 await document.exitPictureInPicture();
//             } else {
//                 await videoEl.requestPictureInPicture();
//             }
//         } catch (err) {
//             console.warn('PiP not supported', err);
//         }
//     };

//     const toggleFullscreen = () => {
//         if (!document.fullscreenElement) {
//             containerRef.current?.requestFullscreen?.();
//         } else {
//             document.exitFullscreen?.();
//         }
//     };

//     useEffect(() => {
//         const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
//         document.addEventListener('fullscreenchange', onFsChange);
//         return () => document.removeEventListener('fullscreenchange', onFsChange);
//     }, []);

//     const wakeControls = useCallback(() => {
//         setShowControls(true);
//         clearTimeout(hideControlsTimeout.current);
//         hideControlsTimeout.current = setTimeout(() => {
//             if (playing) setShowControls(false);
//         }, 2200);
//     }, [playing]);

//     useEffect(() => () => clearTimeout(hideControlsTimeout.current), []);

//     const currentSeconds = played * duration;

//     // Build [{ title, start, end }] segments (as fractions of duration) from
//     // the raw chapter objects (each with a `timestamp: [start, end]` pair of
//     // "HH:MM:SS" strings). Falls back to one full-width segment if no
//     // chapters were passed in, or if duration isn't known yet.
//     const sortedChapters = [...chapters].sort(
//         (a, b) => parseTimestamp(a.timestamp?.[0]) - parseTimestamp(b.timestamp?.[0])
//     );

//     const segments = (() => {
//         if (sortedChapters.length === 0 || duration <= 0) {
//             return [{ title: null, start: 0, end: 1 }];
//         }
//         const built = sortedChapters.map((ch) => ({
//             title: ch.title,
//             start: parseTimestamp(ch.timestamp?.[0]) / duration,
//             end: Math.min(1, parseTimestamp(ch.timestamp?.[1]) / duration),
//         }));
//         // Pad any gap before, between, or after chapters with an invisible
//         // filler segment so the track always spans the full 0-1 width — even
//         // if chapter timestamps don't fully cover the video's real duration.
//         const filled = [];
//         let cursor = 0;
//         built.forEach((seg) => {
//             if (seg.start > cursor) {
//                 filled.push({ title: null, start: cursor, end: seg.start });
//             }
//             filled.push(seg);
//             cursor = Math.max(cursor, seg.end);
//         });
//         if (cursor < 1) {
//             filled.push({ title: null, start: cursor, end: 1 });
//         }
//         return filled;
//     })();

//     const currentChapter =
//         segments.find((seg) => played >= seg.start && played < seg.end) ||
//         segments[segments.length - 1];

//     // Highlight ranges as fractions of full duration (0-1), positioned on top
//     // of the chapter track. Same shape as chapters: { title, timestamp: [start, end] }.
//     const highlightRanges =
//         duration > 0
//             ? highlights.map((h) => ({
//                 title: h.title,
//                 start: parseTimestamp(h.timestamp?.[0]) / duration,
//                 end: Math.min(1, parseTimestamp(h.timestamp?.[1]) / duration),
//             }))
//             : [];

//     return (
//         <div
//             ref={containerRef}
//             onMouseMove={wakeControls}
//             onMouseLeave={() => playing && setShowControls(false)}
//             className={`group relative aspect-video w-full overflow-hidden rounded-xl shadow-md select-none
//                 }`}
//             style={{ background: '#05060a' }}
//         >
//             <ReactPlayer
//                 id="react-player"
//                 ref={setRefs}
//                 className="absolute top-0 left-0"
//                 width="100%"
//                 height="100%"
//                 playing={playing}
//                 loop={video_loop}
//                 volume={volume}
//                 muted={muted}
//                 url={url}
//                 controls={false}
//                 onReady={() => onReady?.()}
//                 onDuration={(d) => {
//                     setDuration(d);
//                     onDuration?.(d);
//                 }}
//                 onProgress={(state) => {
//                     if (!seeking) setPlayed(state.played);
//                 }}
//                 onClick={togglePlay}
//                 progressInterval={250}
//             />

//             {/* Center play/pause tap target */}
//             <button
//                 aria-label={playing ? 'Pause' : 'Play'}
//                 onClick={togglePlay}
//                 className="absolute inset-0 flex items-center justify-center"
//                 tabIndex={-1}
//             >
//                 {!playing && (
//                     <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm ring-1 ring-white/20 transition-transform duration-150 hover:scale-105">
//                         <Play className="h-7 w-7 text-white" fill="white" />
//                     </span>
//                 )}
//             </button>

//             {/* Bottom gradient + control bar */}
//             <div
//                 className={`absolute inset-x-0 bottom-0 px-3 pb-2 pt-10 transition-opacity duration-200 ${showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'
//                     }`}
//                 style={{
//                     background:
//                         'linear-gradient(to top, rgba(5,6,10,0.92) 0%, rgba(5,6,10,0.55) 55%, rgba(5,6,10,0) 100%)',
//                 }}
//             >
//                 {/* Current chapter title row */}
//                 {currentChapter?.title && (
//                     <div className="mb-1.5 truncate text-[13px] font-medium text-white/90 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md w-fit flex items-center gap-1">
//                         <Dot strokeWidth={7} color="#A78BFA" />
//                         {currentChapter.title}
//                     </div>
//                 )}

//                 {/* Scrubber */}
//                 <div className="relative mb-2 flex h-6 flex-col justify-center gap-1">
//                     <div className="flex h-1 w-full items-center gap-[3px]">
//                         {segments.map((seg, i) => {
//                             const segWidth = seg.end - seg.start;
//                             const segPlayed =
//                                 segWidth <= 0
//                                     ? 0
//                                     : Math.min(1, Math.max(0, (played - seg.start) / segWidth));
//                             return (
//                                 <div
//                                     key={i}
//                                     className="relative h-1.5 rounded-full bg-white/20"
//                                     style={{ width: `${segWidth * 100}%` }}
//                                     onMouseEnter={() => setHoveredChapterIdx(i)}
//                                     onMouseLeave={() =>
//                                         setHoveredChapterIdx((cur) => (cur === i ? null : cur))
//                                     }
//                                 >
//                                     <div
//                                         className="absolute left-0 top-0 h-1.5 rounded-full"
//                                         style={{
//                                             width: `${segPlayed * 100}%`,
//                                             background:
//                                                 '#A78BFA',
//                                         }}
//                                     />
//                                     {seg.title && hoveredChapterIdx === i && (
//                                         <div className="pointer-events-none absolute bottom-3 left-0 z-10 whitespace-nowrap rounded-md bg-[#05060a] px-2 py-1 text-[11px] font-medium text-white shadow ring-1 ring-white/10">
//                                             {seg.title}
//                                         </div>
//                                     )}
//                                 </div>
//                             );
//                         })}
//                         {/* Highlight strip */}
//                         {highlightRanges.length > 0 && (
//                             <div className="relative h-[3px] w-full rounded-full bg-white/5">
//                                 {highlightRanges.map((hl, i) => (
//                                     <div
//                                         key={i}
//                                         className="group/hl absolute top-0 h-[3px] cursor-pointer rounded-full"
//                                         style={{
//                                             left: `${hl.start * 100}%`,
//                                             width: `${Math.max(0.5, (hl.end - hl.start) * 100)}%`,
//                                             background: '#FBBF24',
//                                         }}
//                                         onMouseEnter={() => setHoveredHighlightIdx(i)}
//                                         onMouseLeave={() =>
//                                             setHoveredHighlightIdx((cur) => (cur === i ? null : cur))
//                                         }
//                                     >
//                                         {hl.title && hoveredHighlightIdx === i && (
//                                             <div className="pointer-events-none absolute bottom-2 left-0 z-10 whitespace-nowrap rounded-md bg-[#05060a] px-2 py-1 text-[11px] font-medium text-white shadow ring-1 ring-white/10">
//                                                 {hl.title}
//                                             </div>
//                                         )}
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                         {/* scrub handle */}
//                         <span
//                             className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white opacity-0 shadow group-hover:opacity-100"
//                             style={{ left: `${played * 100}%` }}
//                         />
//                     </div>
//                     <input
//                         type="range"
//                         min={0}
//                         max={0.999999}
//                         step="any"
//                         value={played}
//                         onMouseDown={handleSeekMouseDown}
//                         onTouchStart={handleSeekMouseDown}
//                         onChange={handleSeekChange}
//                         onMouseUp={handleSeekMouseUp}
//                         onTouchEnd={handleSeekMouseUp}
//                         className="absolute inset-0 h-4 w-full cursor-pointer opacity-0"
//                         aria-label="Seek"
//                     />
//                 </div>

//                 {/* Controls row */}
//                 <div className="flex items-center justify-between text-white">
//                     <div className="flex items-center gap-3">
//                         <button
//                             onClick={togglePlay}
//                             aria-label={playing ? 'Pause' : 'Play'}
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             {playing ? (
//                                 <Pause className="h-4 w-4" fill="white" />
//                             ) : (
//                                 <Play className="ml-0.5 h-4 w-4" fill="white" />
//                             )}
//                         </button>

//                         <button
//                             onClick={() => skip(-10)}
//                             aria-label="Back 10 seconds"
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             <RotateCcw className="h-4 w-4" />
//                         </button>
//                         <button
//                             onClick={() => skip(10)}
//                             aria-label="Forward 10 seconds"
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             <RotateCw className="h-4 w-4" />
//                         </button>

//                         <span className="text-[12px] tabular-nums text-white/80">
//                             {formatTime(currentSeconds)} / {formatTime(duration)}
//                         </span>
//                     </div>

//                     <div className="flex items-center gap-2">
//                         <div
//                             className="relative flex items-center"
//                             onMouseEnter={() => setShowVolumeSlider(true)}
//                             onMouseLeave={() => setShowVolumeSlider(false)}
//                         >
//                             <div
//                                 className={`overflow-hidden transition-all duration-150 ${showVolumeSlider ? 'w-16 opacity-100' : 'w-0 opacity-0'
//                                     }`}
//                             >
//                                 <input
//                                     type="range"
//                                     min={0}
//                                     max={1}
//                                     step={0.05}
//                                     value={muted ? 0 : volume}
//                                     onChange={handleVolumeChange}
//                                     className="h-1 w-14 accent-[#A78BFA]"
//                                     aria-label="Volume"
//                                 />
//                             </div>
//                             <button
//                                 onClick={toggleMute}
//                                 aria-label={muted ? 'Unmute' : 'Mute'}
//                                 className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                             >
//                                 {muted || volume === 0 ? (
//                                     <VolumeX className="h-4 w-4" />
//                                 ) : (
//                                     <Volume2 className="h-4 w-4" />
//                                 )}
//                             </button>

//                         </div>

//                         {/* <button
//                             aria-label="Settings"
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             <Settings className="h-4 w-4" />
//                         </button> */}
//                         <button
//                             onClick={togglePip}
//                             aria-label="Picture in picture"
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             <PictureInPicture2 className="h-4 w-4" />
//                         </button>
//                         <button
//                             onClick={toggleFullscreen}
//                             aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             {isFullscreen ? (
//                                 <Minimize className="h-4 w-4" />
//                             ) : (
//                                 <Maximize className="h-4 w-4" />
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }




// import React, { useState, useRef, useCallback, useEffect } from 'react';
// import ReactPlayer from 'react-player';
// import {
//     Play,
//     Pause,
//     RotateCcw,
//     RotateCw,
//     Volume2,
//     VolumeX,
//     Settings,
//     PictureInPicture2,
//     Maximize,
//     Minimize,
// } from 'lucide-react';

// /**
//  * CustomVideoPlayer
//  * -------------------------------------------------------------
//  * Drop-in replacement for the default ReactPlayer `controls` UI.
//  * Keeps ReactPlayer for actual playback/source handling, but renders
//  * a fully custom control bar + scrubber underneath (dark, pill-shaped
//  * markers on the progress track, title left-aligned above the bar).
//  *
//  * Props mirror the ones already used in your app so it's a near
//  * drop-in swap for the previous <ReactPlayer .../> block.
//  */

// const formatTime = (seconds = 0) => {
//     if (!Number.isFinite(seconds)) return '0:00';
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = Math.floor(seconds % 60);
//     const mm = h > 0 ? String(m).padStart(2, '0') : m;
//     const ss = String(s).padStart(2, '0');
//     return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
// };

// export default function CustomVideoPlayer({
//     sourcePublicUrl,
//     resourceURL,
//     video_autoplay = false,
//     video_loop = false,
//     theme = 'dark',
//     title = '',
//     // optional: chapter/highlight markers as fractions [0-1] of duration
//     // chapters: [{ title: string, start: number (0-1 fraction of duration) }, ...]
//     chapters = [],
//     onReady,
//     onDuration,
//     playerRef, // optional external ref, in addition to internal one
// }) {
//     const internalRef = useRef(null);
//     const containerRef = useRef(null);
//     const hideControlsTimeout = useRef(null);

//     const [playing, setPlaying] = useState(video_autoplay);
//     const [played, setPlayed] = useState(0); // fraction 0-1
//     const [duration, setDuration] = useState(0);
//     const [seeking, setSeeking] = useState(false);
//     const [volume, setVolume] = useState(1);
//     const [muted, setMuted] = useState(false);
//     const [showControls, setShowControls] = useState(true);
//     const [isFullscreen, setIsFullscreen] = useState(false);
//     const [showVolumeSlider, setShowVolumeSlider] = useState(false);
//     const [hoveredChapterIdx, setHoveredChapterIdx] = useState(null);

//     const setRefs = useCallback(
//         (node) => {
//             internalRef.current = node;
//             if (playerRef) {
//                 if (typeof playerRef === 'function') playerRef(node);
//                 else playerRef.current = node;
//             }
//         },
//         [playerRef]
//     );

//     const url = sourcePublicUrl || resourceURL;

//     const togglePlay = () => setPlaying((p) => !p);

//     const handleSeekMouseDown = () => setSeeking(true);

//     const handleSeekChange = (e) => {
//         setPlayed(parseFloat(e.target.value));
//     };

//     const handleSeekMouseUp = (e) => {
//         setSeeking(false);
//         internalRef.current?.seekTo(parseFloat(e.target.value));
//     };

//     const skip = (seconds) => {
//         const current = internalRef.current?.getCurrentTime?.() ?? 0;
//         internalRef.current?.seekTo(Math.max(0, current + seconds));
//     };

//     const toggleMute = () => setMuted((m) => !m);

//     const handleVolumeChange = (e) => {
//         const v = parseFloat(e.target.value);
//         setVolume(v);
//         setMuted(v === 0);
//     };

//     const togglePip = async () => {
//         const videoEl = containerRef.current?.querySelector('video');
//         if (!videoEl) return;
//         try {
//             if (document.pictureInPictureElement) {
//                 await document.exitPictureInPicture();
//             } else {
//                 await videoEl.requestPictureInPicture();
//             }
//         } catch (err) {
//             console.warn('PiP not supported', err);
//         }
//     };

//     const toggleFullscreen = () => {
//         if (!document.fullscreenElement) {
//             containerRef.current?.requestFullscreen?.();
//         } else {
//             document.exitFullscreen?.();
//         }
//     };

//     useEffect(() => {
//         const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
//         document.addEventListener('fullscreenchange', onFsChange);
//         return () => document.removeEventListener('fullscreenchange', onFsChange);
//     }, []);

//     const wakeControls = useCallback(() => {
//         setShowControls(true);
//         clearTimeout(hideControlsTimeout.current);
//         hideControlsTimeout.current = setTimeout(() => {
//             if (playing) setShowControls(false);
//         }, 2200);
//     }, [playing]);

//     useEffect(() => () => clearTimeout(hideControlsTimeout.current), []);

//     const currentSeconds = played * duration;

//     // Build [{ title, start, end }] segments; falls back to one full-width
//     // segment if no chapters were passed in.
//     const sortedChapters = [...chapters].sort((a, b) => a.start - b.start);
//     const segments =
//         sortedChapters.length > 0
//             ? sortedChapters.map((ch, i) => ({
//                 title: ch.title,
//                 start: ch.start,
//                 end: i + 1 < sortedChapters.length ? sortedChapters[i + 1].start : 1,
//             }))
//             : [{ title: null, start: 0, end: 1 }];

//     const currentChapter =
//         segments.find((seg) => played >= seg.start && played < seg.end) ||
//         segments[segments.length - 1];

//     return (
//         <div
//             ref={containerRef}
//             onMouseMove={wakeControls}
//             onMouseLeave={() => playing && setShowControls(false)}
//             className={`group relative aspect-video w-full overflow-hidden rounded-xl shadow-lg select-none ${theme === 'light' ? 'border border-slate-200' : 'border border-white/10'
//                 }`}
//             style={{ background: '#05060a' }}
//         >
//             <ReactPlayer
//                 id="react-player"
//                 ref={setRefs}
//                 className="absolute top-0 left-0"
//                 width="100%"
//                 height="100%"
//                 playing={playing}
//                 loop={video_loop}
//                 volume={volume}
//                 muted={muted}
//                 url={url}
//                 controls={false}
//                 onReady={() => onReady?.()}
//                 onDuration={(d) => {
//                     setDuration(d);
//                     onDuration?.(d);
//                 }}
//                 onProgress={(state) => {
//                     if (!seeking) setPlayed(state.played);
//                 }}
//                 onClick={togglePlay}
//                 progressInterval={250}
//             />

//             {/* Center play/pause tap target */}
//             <button
//                 aria-label={playing ? 'Pause' : 'Play'}
//                 onClick={togglePlay}
//                 className="absolute inset-0 flex items-center justify-center"
//                 tabIndex={-1}
//             >
//                 {!playing && (
//                     <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm ring-1 ring-white/20 transition-transform duration-150 hover:scale-105">
//                         <Play className="ml-1 h-7 w-7 text-white" fill="white" />
//                     </span>
//                 )}
//             </button>

//             {/* Bottom gradient + control bar */}
//             <div
//                 className={`absolute inset-x-0 bottom-0 px-3 pb-2 pt-10 transition-opacity duration-200 ${showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'
//                     }`}
//                 style={{
//                     background:
//                         'linear-gradient(to top, rgba(5,6,10,0.92) 0%, rgba(5,6,10,0.55) 55%, rgba(5,6,10,0) 100%)',
//                 }}
//             >
//                 {/* Current chapter title row */}
//                 {currentChapter?.title && (
//                     <div className="mb-1.5 truncate text-[13px] font-medium text-white/90">
//                         {currentChapter.title}
//                     </div>
//                 )}

//                 {/* Scrubber */}
//                 <div className="relative mb-2 flex h-4 items-center">
//                     <div className="flex h-1 w-full items-center gap-[3px]">
//                         {segments.map((seg, i) => {
//                             const segWidth = seg.end - seg.start;
//                             const segPlayed =
//                                 segWidth <= 0
//                                     ? 0
//                                     : Math.min(1, Math.max(0, (played - seg.start) / segWidth));
//                             return (
//                                 <div
//                                     key={i}
//                                     className="relative h-1 rounded-full bg-white/20"
//                                     style={{ width: `${segWidth * 100}%` }}
//                                     onMouseEnter={() => setHoveredChapterIdx(i)}
//                                     onMouseLeave={() =>
//                                         setHoveredChapterIdx((cur) => (cur === i ? null : cur))
//                                     }
//                                 >
//                                     <div
//                                         className="absolute left-0 top-0 h-1 rounded-full"
//                                         style={{
//                                             width: `${segPlayed * 100}%`,
//                                             background:
//                                                 'linear-gradient(90deg, #7C6CF6 0%, #A78BFA 50%, #60A5FA 100%)',
//                                         }}
//                                     />
//                                     {seg.title && hoveredChapterIdx === i && (
//                                         <div className="pointer-events-none absolute bottom-3 left-0 z-10 whitespace-nowrap rounded-md bg-[#05060a] px-2 py-1 text-[11px] font-medium text-white shadow ring-1 ring-white/10">
//                                             {seg.title}
//                                         </div>
//                                     )}
//                                 </div>
//                             );
//                         })}
//                         {/* scrub handle */}
//                         <span
//                             className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white opacity-0 shadow group-hover:opacity-100"
//                             style={{ left: `${played * 100}%` }}
//                         />
//                     </div>
//                     <input
//                         type="range"
//                         min={0}
//                         max={0.999999}
//                         step="any"
//                         value={played}
//                         onMouseDown={handleSeekMouseDown}
//                         onTouchStart={handleSeekMouseDown}
//                         onChange={handleSeekChange}
//                         onMouseUp={handleSeekMouseUp}
//                         onTouchEnd={handleSeekMouseUp}
//                         className="absolute inset-0 h-4 w-full cursor-pointer opacity-0"
//                         aria-label="Seek"
//                     />
//                 </div>

//                 {/* Controls row */}
//                 <div className="flex items-center justify-between text-white">
//                     <div className="flex items-center gap-3">
//                         <button
//                             onClick={togglePlay}
//                             aria-label={playing ? 'Pause' : 'Play'}
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             {playing ? (
//                                 <Pause className="h-4 w-4" fill="white" />
//                             ) : (
//                                 <Play className="ml-0.5 h-4 w-4" fill="white" />
//                             )}
//                         </button>

//                         <button
//                             onClick={() => skip(-10)}
//                             aria-label="Back 10 seconds"
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             <RotateCcw className="h-4 w-4" />
//                         </button>
//                         <button
//                             onClick={() => skip(10)}
//                             aria-label="Forward 10 seconds"
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             <RotateCw className="h-4 w-4" />
//                         </button>

//                         <span className="text-[12px] tabular-nums text-white/80">
//                             {formatTime(currentSeconds)} / {formatTime(duration)}
//                         </span>
//                     </div>

//                     <div className="flex items-center gap-2">
//                         <div
//                             className="relative flex items-center"
//                             onMouseEnter={() => setShowVolumeSlider(true)}
//                             onMouseLeave={() => setShowVolumeSlider(false)}
//                         >
//                             <button
//                                 onClick={toggleMute}
//                                 aria-label={muted ? 'Unmute' : 'Mute'}
//                                 className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                             >
//                                 {muted || volume === 0 ? (
//                                     <VolumeX className="h-4 w-4" />
//                                 ) : (
//                                     <Volume2 className="h-4 w-4" />
//                                 )}
//                             </button>
//                             <div
//                                 className={`overflow-hidden transition-all duration-150 ${showVolumeSlider ? 'w-16 opacity-100' : 'w-0 opacity-0'
//                                     }`}
//                             >
//                                 <input
//                                     type="range"
//                                     min={0}
//                                     max={1}
//                                     step={0.05}
//                                     value={muted ? 0 : volume}
//                                     onChange={handleVolumeChange}
//                                     className="h-1 w-14 accent-[#A78BFA]"
//                                     aria-label="Volume"
//                                 />
//                             </div>
//                         </div>

//                         <button
//                             aria-label="Settings"
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             <Settings className="h-4 w-4" />
//                         </button>
//                         <button
//                             onClick={togglePip}
//                             aria-label="Picture in picture"
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             <PictureInPicture2 className="h-4 w-4" />
//                         </button>
//                         <button
//                             onClick={toggleFullscreen}
//                             aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             {isFullscreen ? (
//                                 <Minimize className="h-4 w-4" />
//                             ) : (
//                                 <Maximize className="h-4 w-4" />
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


// import React, { useState, useRef, useCallback, useEffect } from 'react';
// import ReactPlayer from 'react-player';
// import {
//     Play,
//     Pause,
//     RotateCcw,
//     RotateCw,
//     Volume2,
//     VolumeX,
//     Settings,
//     PictureInPicture2,
//     Maximize,
//     Minimize,
// } from 'lucide-react';

// /**
//  * CustomVideoPlayer
//  * -------------------------------------------------------------
//  * Drop-in replacement for the default ReactPlayer `controls` UI.
//  * Keeps ReactPlayer for actual playback/source handling, but renders
//  * a fully custom control bar + scrubber underneath (dark, pill-shaped
//  * markers on the progress track, title left-aligned above the bar).
//  *
//  * Props mirror the ones already used in your app so it's a near
//  * drop-in swap for the previous <ReactPlayer .../> block.
//  */

// const formatTime = (seconds = 0) => {
//     if (!Number.isFinite(seconds)) return '0:00';
//     const h = Math.floor(seconds / 3600);
//     const m = Math.floor((seconds % 3600) / 60);
//     const s = Math.floor(seconds % 60);
//     const mm = h > 0 ? String(m).padStart(2, '0') : m;
//     const ss = String(s).padStart(2, '0');
//     return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
// };

// export default function CustomVideoPlayer({
//     sourcePublicUrl,
//     resourceURL,
//     video_autoplay = false,
//     video_loop = false,
//     theme = 'dark',
//     title = '',
//     // optional: chapter/highlight markers as fractions [0-1] of duration
//     // chapters: [{ title: string, start: number (0-1 fraction of duration) }, ...]
//     chapters = [],
//     onReady,
//     onDuration,
//     playerRef, // optional external ref, in addition to internal one
// }) {
//     const internalRef = useRef(null);
//     const containerRef = useRef(null);
//     const hideControlsTimeout = useRef(null);

//     const [playing, setPlaying] = useState(video_autoplay);
//     const [played, setPlayed] = useState(0); // fraction 0-1
//     const [duration, setDuration] = useState(0);
//     const [seeking, setSeeking] = useState(false);
//     const [volume, setVolume] = useState(1);
//     const [muted, setMuted] = useState(false);
//     const [showControls, setShowControls] = useState(true);
//     const [isFullscreen, setIsFullscreen] = useState(false);
//     const [showVolumeSlider, setShowVolumeSlider] = useState(false);
//     const [hoveredChapterIdx, setHoveredChapterIdx] = useState(null);

//     const setRefs = useCallback(
//         (node) => {
//             internalRef.current = node;
//             if (playerRef) {
//                 if (typeof playerRef === 'function') playerRef(node);
//                 else playerRef.current = node;
//             }
//         },
//         [playerRef]
//     );

//     const url = sourcePublicUrl || resourceURL;

//     const togglePlay = () => setPlaying((p) => !p);

//     const handleSeekMouseDown = () => setSeeking(true);

//     const handleSeekChange = (e) => {
//         setPlayed(parseFloat(e.target.value));
//     };

//     const handleSeekMouseUp = (e) => {
//         setSeeking(false);
//         internalRef.current?.seekTo(parseFloat(e.target.value));
//     };

//     const skip = (seconds) => {
//         const current = internalRef.current?.getCurrentTime?.() ?? 0;
//         internalRef.current?.seekTo(Math.max(0, current + seconds));
//     };

//     const toggleMute = () => setMuted((m) => !m);

//     const handleVolumeChange = (e) => {
//         const v = parseFloat(e.target.value);
//         setVolume(v);
//         setMuted(v === 0);
//     };

//     const togglePip = async () => {
//         const videoEl = containerRef.current?.querySelector('video');
//         if (!videoEl) return;
//         try {
//             if (document.pictureInPictureElement) {
//                 await document.exitPictureInPicture();
//             } else {
//                 await videoEl.requestPictureInPicture();
//             }
//         } catch (err) {
//             console.warn('PiP not supported', err);
//         }
//     };

//     const toggleFullscreen = () => {
//         if (!document.fullscreenElement) {
//             containerRef.current?.requestFullscreen?.();
//         } else {
//             document.exitFullscreen?.();
//         }
//     };

//     useEffect(() => {
//         const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
//         document.addEventListener('fullscreenchange', onFsChange);
//         return () => document.removeEventListener('fullscreenchange', onFsChange);
//     }, []);

//     const wakeControls = useCallback(() => {
//         setShowControls(true);
//         clearTimeout(hideControlsTimeout.current);
//         hideControlsTimeout.current = setTimeout(() => {
//             if (playing) setShowControls(false);
//         }, 2200);
//     }, [playing]);

//     useEffect(() => () => clearTimeout(hideControlsTimeout.current), []);

//     const currentSeconds = played * duration;

//     // Build [{ title, start, end }] segments; falls back to one full-width
//     // segment if no chapters were passed in.
//     const sortedChapters = [...chapters].sort((a, b) => a.start - b.start);
//     const segments =
//         sortedChapters.length > 0
//             ? sortedChapters.map((ch, i) => ({
//                 title: ch.title,
//                 start: ch.start,
//                 end: i + 1 < sortedChapters.length ? sortedChapters[i + 1].start : 1,
//             }))
//             : [{ title: null, start: 0, end: 1 }];

//     return (
//         <div
//             ref={containerRef}
//             onMouseMove={wakeControls}
//             onMouseLeave={() => playing && setShowControls(false)}
//             className={`group relative aspect-video w-full overflow-hidden rounded-xl shadow-lg select-none ${theme === 'light' ? 'border border-slate-200' : 'border border-white/10'
//                 }`}
//             style={{ background: '#05060a' }}
//         >
//             <ReactPlayer
//                 id="react-player"
//                 ref={setRefs}
//                 className="absolute top-0 left-0"
//                 width="100%"
//                 height="100%"
//                 playing={playing}
//                 loop={video_loop}
//                 volume={volume}
//                 muted={muted}
//                 url={url}
//                 controls={false}
//                 onReady={() => onReady?.()}
//                 onDuration={(d) => {
//                     setDuration(d);
//                     onDuration?.(d);
//                 }}
//                 onProgress={(state) => {
//                     if (!seeking) setPlayed(state.played);
//                 }}
//                 onClick={togglePlay}
//                 progressInterval={250}
//             />

//             {/* Center play/pause tap target */}
//             <button
//                 aria-label={playing ? 'Pause' : 'Play'}
//                 onClick={togglePlay}
//                 className="absolute inset-0 flex items-center justify-center"
//                 tabIndex={-1}
//             >
//                 {!playing && (
//                     <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/50 backdrop-blur-sm ring-1 ring-white/20 transition-transform duration-150 hover:scale-105">
//                         <Play className="ml-1 h-7 w-7 text-white" fill="white" />
//                     </span>
//                 )}
//             </button>

//             {/* Bottom gradient + control bar */}
//             <div
//                 className={`absolute inset-x-0 bottom-0 px-3 pb-2 pt-10 transition-opacity duration-200 ${showControls || !playing ? 'opacity-100' : 'opacity-0 pointer-events-none'
//                     }`}
//                 style={{
//                     background:
//                         'linear-gradient(to top, rgba(5,6,10,0.92) 0%, rgba(5,6,10,0.55) 55%, rgba(5,6,10,0) 100%)',
//                 }}
//             >
//                 {/* Title row */}
//                 {title && (
//                     <div className="mb-1.5 truncate text-[13px] font-medium text-white/90">
//                         {title}
//                     </div>
//                 )}

//                 {/* Scrubber */}
//                 <div className="relative mb-2 flex h-4 items-center">
//                     <div className="flex h-1 w-full items-center gap-[3px]">
//                         {segments.map((seg, i) => {
//                             const segWidth = seg.end - seg.start;
//                             const segPlayed =
//                                 segWidth <= 0
//                                     ? 0
//                                     : Math.min(1, Math.max(0, (played - seg.start) / segWidth));
//                             return (
//                                 <div
//                                     key={i}
//                                     className="relative h-3 rounded-full bg-white/20"
//                                     style={{ width: `${segWidth * 100}%` }}
//                                     onMouseEnter={() => { console.log("hhh"); setHoveredChapterIdx(i); }}
//                                     onMouseLeave={() =>
//                                         setHoveredChapterIdx((cur) => (cur === i ? null : cur))
//                                     }
//                                 >
//                                     <div
//                                         className="absolute left-0 top-0 h-3 rounded-full"
//                                         style={{
//                                             width: `${segPlayed * 100}%`,
//                                             background:
//                                                 'linear-gradient(90deg, #7C6CF6 0%, #A78BFA 50%, #60A5FA 100%)',
//                                         }}
//                                     />
//                                     {seg.title && hoveredChapterIdx === i && (
//                                         <div className="pointer-events-none absolute bottom-3 left-0 z-10 whitespace-nowrap rounded-md bg-[#05060a] px-2 py-1 text-[11px] font-medium text-white shadow ring-1 ring-white/10">
//                                             {seg.title}
//                                         </div>
//                                     )}
//                                 </div>
//                             );
//                         })}
//                         {/* scrub handle */}
//                         <span
//                             className="pointer-events-none absolute top-1/2 h-3 w-3 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white opacity-0 shadow group-hover:opacity-100"
//                             style={{ left: `${played * 100}%` }}
//                         />
//                     </div>
//                     <input
//                         type="range"
//                         min={0}
//                         max={0.999999}
//                         step="any"
//                         value={played}
//                         onMouseDown={handleSeekMouseDown}
//                         onTouchStart={handleSeekMouseDown}
//                         onChange={handleSeekChange}
//                         onMouseUp={handleSeekMouseUp}
//                         onTouchEnd={handleSeekMouseUp}
//                         className="absolute inset-0 h-4 w-full cursor-pointer opacity-0"
//                         aria-label="Seek"
//                     />
//                 </div>

//                 {/* Controls row */}
//                 <div className="flex items-center justify-between text-white">
//                     <div className="flex items-center gap-3">
//                         <button
//                             onClick={togglePlay}
//                             aria-label={playing ? 'Pause' : 'Play'}
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             {playing ? (
//                                 <Pause className="h-4 w-4" fill="white" />
//                             ) : (
//                                 <Play className="ml-0.5 h-4 w-4" fill="white" />
//                             )}
//                         </button>

//                         <button
//                             onClick={() => skip(-10)}
//                             aria-label="Back 10 seconds"
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             <RotateCcw className="h-4 w-4" />
//                         </button>
//                         <button
//                             onClick={() => skip(10)}
//                             aria-label="Forward 10 seconds"
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             <RotateCw className="h-4 w-4" />
//                         </button>

//                         <span className="text-[12px] tabular-nums text-white/80">
//                             {formatTime(currentSeconds)} / {formatTime(duration)}
//                         </span>
//                     </div>

//                     <div className="flex items-center gap-2">
//                         <div
//                             className="relative flex items-center"
//                             onMouseEnter={() => setShowVolumeSlider(true)}
//                             onMouseLeave={() => setShowVolumeSlider(false)}
//                         >
//                             <button
//                                 onClick={toggleMute}
//                                 aria-label={muted ? 'Unmute' : 'Mute'}
//                                 className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                             >
//                                 {muted || volume === 0 ? (
//                                     <VolumeX className="h-4 w-4" />
//                                 ) : (
//                                     <Volume2 className="h-4 w-4" />
//                                 )}
//                             </button>
//                             <div
//                                 className={`overflow-hidden transition-all duration-150 ${showVolumeSlider ? 'w-16 opacity-100' : 'w-0 opacity-0'
//                                     }`}
//                             >
//                                 <input
//                                     type="range"
//                                     min={0}
//                                     max={1}
//                                     step={0.05}
//                                     value={muted ? 0 : volume}
//                                     onChange={handleVolumeChange}
//                                     className="h-1 w-14 accent-[#A78BFA]"
//                                     aria-label="Volume"
//                                 />
//                             </div>
//                         </div>

//                         <button
//                             aria-label="Settings"
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             <Settings className="h-4 w-4" />
//                         </button>
//                         <button
//                             onClick={togglePip}
//                             aria-label="Picture in picture"
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             <PictureInPicture2 className="h-4 w-4" />
//                         </button>
//                         <button
//                             onClick={toggleFullscreen}
//                             aria-label={isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
//                             className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
//                         >
//                             {isFullscreen ? (
//                                 <Minimize className="h-4 w-4" />
//                             ) : (
//                                 <Maximize className="h-4 w-4" />
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
