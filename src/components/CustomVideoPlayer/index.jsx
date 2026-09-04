import React, { useState, useRef, useCallback, useEffect, useContext } from 'react';
import ReactPlayer from 'react-player';
import {
    Play,
    Pause,
    RotateCcw,
    RotateCw,
    Volume2,
    VolumeX,
    Settings,
    PictureInPicture2,
    Maximize,
    Minimize,
    Dot,
    X
} from 'lucide-react';
import CustomVideoPlayerSettings from '../CustomVideoPlayerSettings';
import { MainContext } from '../../contexts/mainContext';

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
    chapters = [],
    highlights = [],
    onReady,
    onDuration,
    playerRef,
    title,
    setCurrentTime
}) {

    const {
        setShowMetadata
    } = useContext(MainContext);

    const internalRef = useRef(null);
    const containerRef = useRef(null);
    const settingsMenuRef = useRef(null);
    const settingsButtonRef = useRef(null);
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
    const [isPlayerSettingsVisible, setIsPlayerSettingsVisible] = useState(false);
    const [areChaptersVisible, setAreChaptersVisibile] = useState(true);
    const [areHighlightsVisible, setAreHighlightsVisibile] = useState(true);
    const [playbackRate, setPlaybackRate] = useState(1);

    const PLAYBACK_RATES = [0.5, 0.75, 1, 1.25, 1.5, 2];

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

    useEffect(() => {
        if (!isPlayerSettingsVisible) return undefined;

        const handlePointerDown = (event) => {
            const clickedInsideSettingsMenu = settingsMenuRef.current?.contains(event.target);
            const clickedSettingsButton = settingsButtonRef.current?.contains(event.target);

            if (!clickedInsideSettingsMenu && !clickedSettingsButton) {
                setIsPlayerSettingsVisible(false);
            }
        };

        document.addEventListener('mousedown', handlePointerDown);

        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, [isPlayerSettingsVisible]);

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
        if (sortedChapters.length === 0 || duration <= 0 || !areChaptersVisible) {
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
        (duration > 0 && areHighlightsVisible)
            ? highlights.map((h) => ({
                title: h.title,
                start: parseTimestamp(h.timestamp?.[0]) / duration,
                end: Math.min(1, parseTimestamp(h.timestamp?.[1]) / duration),
            }))
            : [];

    const handleMouseLeave = () => {
        if (playing) {
            setShowControls(false);
            setIsPlayerSettingsVisible(false);
        }
    };

    const onClose = () => {
        setShowMetadata(false);
    };

    return (
        <div
            ref={containerRef}
            onMouseMove={wakeControls}
            onMouseLeave={handleMouseLeave}
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
                    setCurrentTime(state.playedSeconds);
                    if (!seeking) setPlayed(state.played);
                }}
                onClick={togglePlay}
                progressInterval={80}
                // progressInterval={250}
                playbackRate={playbackRate}
            />

            {/* video name */}
            {showControls && (
                <div className="absolute z-1 w-[98%] top-2 left-2 right-2  flex items-center justify-between">
                    <div className="px-2 py-1 w-fit max-w-[60%] truncate self-start flex items-center gap-2 overflow-hidden bg-black/40 text-[13px] backdrop-blur-sm rounded-md">
                        <Play className="w-[18px] h-[18px] text-primary-300" strokeWidth={4} />
                        <span className="truncate font-medium text-sm text-white/90" >{title}</span>
                    </div>

                    <div className="px-2 py-1 w-fit bg-black/40 text-white text-[13px] backdrop-blur-sm rounded-md cursor-pointer" onClick={onClose}>
                        <X size={15} />
                    </div>
                </div>
            )}

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
                                        className="absolute left-0 top-0 h-1.5 rounded-full bg-primary-300"
                                        style={{
                                            width: `${segPlayed * 100}%`,
                                        }}
                                    />
                                    {seg.title && hoveredChapterIdx === i && (
                                        <div
                                            className={`pointer-events-none flex items-center gap-1 absolute bottom-2 z-10 whitespace-nowrap text-white/90 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md w-fit text-[11px] font-medium text-white shadow ring-1 ring-white/10 ${seg.start > 0.60 ? 'right-0' : 'left-0'
                                                }`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="italic font-semibold text-primary-300 text-[10px]">
                                                    Chapter: {chapters[i]?.timestamp[0]} - {chapters[i]?.timestamp[1]}
                                                </span>
                                                <span>{seg.title}</span>
                                            </div>
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
                        <div className="relative h-[1px] w-full mt-0.5 rounded-full">
                            {highlightRanges.map((hl, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 w-2 h-2 cursor-pointer rounded-full bg-[#FBBF24]"
                                    style={{
                                        left: `${hl.start * 100}%`,
                                        // width: `${Math.max(0.5, (hl.end - hl.start) * 100)}%`,
                                    }}
                                    onMouseEnter={() => setHoveredHighlightIdx(i)}
                                    onMouseLeave={() =>
                                        setHoveredHighlightIdx((cur) => (cur === i ? null : cur))
                                    }
                                    onClick={() => {
                                        if (!duration || !internalRef.current) return;
                                        const targetSeconds = Math.max(0, hl.start * duration);
                                        internalRef.current?.seekTo(targetSeconds, 'seconds');
                                        setPlayed(hl.start);
                                    }}
                                >
                                    {hl.title && hoveredHighlightIdx === i && (
                                        <div
                                            className={`pointer-events-none flex items-center gap-1 absolute bottom-2 z-10 whitespace-nowrap text-white/90 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-md w-fit text-[11px] font-medium text-white shadow ring-1 ring-white/10 ${hl.start > 0.60 ? 'right-0' : 'left-0'
                                                } pointer-events-none`}
                                        >
                                            <div className="flex flex-col">
                                                <span className="italic  text-[#FBBF24] text-[10px]">
                                                    Highlight: {highlights[i]?.timestamp[0]} - {highlights[i]?.timestamp[1]}</span>
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
                        onMouseMove={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect();
                            const fraction = (e.clientX - rect.left) / rect.width;
                            const segIdx = segments.findIndex(
                                (seg) => fraction >= seg.start && fraction < seg.end
                            );
                            setHoveredChapterIdx(segIdx === -1 ? null : segIdx);
                        }}
                        onMouseLeave={() => {
                            setHoveredChapterIdx(null);
                            setHoveredHighlightIdx(null);
                        }}
                        className="absolute inset-0 h-4 w-full cursor-pointer opacity-0"
                        aria-label="Seek"
                    />
                </div>

                {/* Controls row */}
                <div className="flex items-center justify-between gap-2 text-white">
                    <div className="flex min-w-0 items-center gap-3">
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

                        {/* CURRENT CHAPTER */}
                        {currentChapter?.title && (
                            <div className="mb-1.5 min-w-0 max-w-[60%] flex-1 overflow-hidden rounded-md bg-black/40 px-2 py-1 text-[13px] backdrop-blur-sm">
                                <div className="flex items-center">
                                    <Dot className="w-[15px] h-[15px] text-primary-300" strokeWidth={7} />
                                    <span className="truncate font-medium text-sm text-white/90">{currentChapter.title}</span>
                                </div>
                            </div>
                        )}

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

                        {/* SETTINGS ICON */}
                        <div className="relative">
                            <button
                                ref={settingsButtonRef}
                                aria-label="Settings"
                                className="relative flex h-7 w-7 items-center justify-center rounded-full hover:bg-white/10"
                                onClick={() => setIsPlayerSettingsVisible(v => !v)}
                            >
                                <Settings className="h-4 w-4" />
                            </button>
                            {
                                isPlayerSettingsVisible && (
                                    <div ref={settingsMenuRef} className="absolute bottom-full right-0 w-64">
                                        <CustomVideoPlayerSettings
                                            areChaptersVisible={areChaptersVisible}
                                            setAreChaptersVisibile={setAreChaptersVisibile}
                                            areHighlightsVisible={areHighlightsVisible}
                                            setAreHighlightsVisibile={setAreHighlightsVisibile}
                                            playBackRates={PLAYBACK_RATES}
                                            playbackRate={playbackRate}
                                            setPlaybackRate={setPlaybackRate}
                                        />
                                    </div>
                                )
                            }
                        </div>

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