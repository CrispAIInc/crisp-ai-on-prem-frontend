import React, { useState, useRef, useEffect, useCallback, useContext } from "react";
import {
    ZoomIn,
    ZoomOut,
    Maximize2,
    Minimize2,
    X,
    RotateCcw,
    Image
} from "lucide-react";
import GsFile from '../GsFile';
import { MainContext } from '../../contexts/mainContext';

/* ---------------------------------------------------------
   ImageViewer
   A responsive, zoomable, fullscreen-capable image viewer.

   Props:
   - src        (string, required)  image url
   - alt        (string)            alt text
   - title      (string)            image title shown top-left
   - eyebrow    (string)            small label above the title
   - onPrev     (function)          optional, shows a "prev" arrow
   - onNext     (function)          optional, shows a "next" arrow
--------------------------------------------------------- */

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SCALE_STEP = 0.5;

function ImageViewer({ src, alt, title, onClose }) {

    const {
        setShowMetadata
    } = useContext(MainContext);

    const [scale, setScale] = useState(1);
    const [pos, setPos] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const [isMouseEnter, setIsMouseEnter] = useState(false);

    const containerRef = useRef(null);
    const dragStart = useRef({ x: 0, y: 0 });
    const posStart = useRef({ x: 0, y: 0 });

    // reset pan/zoom whenever the image changes
    useEffect(() => {
        setScale(1);
        setPos({ x: 0, y: 0 });
        setLoaded(false);
    }, [src]);

    const clampPos = useCallback(
        (nextPos, nextScale) => {
            if (!containerRef.current) return nextPos;
            const bound = ((nextScale - 1) * 260) / 1; // generous, feel-based clamp
            return {
                x: Math.max(-bound, Math.min(bound, nextPos.x)),
                y: Math.max(-bound, Math.min(bound, nextPos.y)),
            };
        },
        []
    );

    const zoomTo = useCallback(
        (next) => {
            const clamped = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
            setScale(clamped);
            if (clamped === 1) setPos({ x: 0, y: 0 });
            else setPos((p) => clampPos(p, clamped));
        },
        [clampPos]
    );

    const zoomIn = () => zoomTo(scale + SCALE_STEP);
    const zoomOut = () => zoomTo(scale - SCALE_STEP);
    const resetZoom = () => zoomTo(1);

    // const onWheel = (e) => {
    //     e.preventDefault();
    //     zoomTo(scale + (e.deltaY < 0 ? SCALE_STEP / 2 : -SCALE_STEP / 2));
    // };

    const onDoubleClick = () => (scale > 1 ? resetZoom() : zoomTo(2.5));

    const onPointerDown = (e) => {
        if (scale <= 1) return;
        setDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
        posStart.current = pos;
    };
    const onPointerMove = (e) => {
        if (!dragging) return;
        const dx = e.clientX - dragStart.current.x;
        const dy = e.clientY - dragStart.current.y;
        setPos(clampPos({ x: posStart.current.x + dx, y: posStart.current.y + dy }, scale));
    };
    const stopDrag = () => setDragging(false);

    // keyboard shortcuts
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === "Escape" && isFullscreen) setIsFullscreen(false);
            // else if (e.key === "+" || e.key === "=") zoomIn();
            // else if (e.key === "-") zoomOut();
            // else if (e.key === "0") resetZoom();
            // else if (e.key === "f") setIsFullscreen((f) => !f);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [scale, isFullscreen]);

    const zoomPct = Math.round(scale * 100);

    // function onClose() {
    //     setShowMetadata(false);
    // }

    return (
        <div
            ref={containerRef}
            className={
                isFullscreen
                    ? "fixed inset-0 z-50 bg-[#0B0A14]"
                    : "relative w-full rounded-2xl bg-[#0B0A14] overflow-hidden"
            }
            style={!isFullscreen ? { aspectRatio: "16 / 10" } : undefined}
            onMouseEnter={() => setIsMouseEnter(true)}
            onMouseLeave={() => setIsMouseEnter(false)}
        >
            {/* ambient glow backdrop */}
            <div
                className="pointer-events-none absolute -inset-24 opacity-40 blur-3xl"
                style={{
                    background:
                        "radial-gradient(40% 40% at 20% 15%, #755BEA55, transparent 60%), radial-gradient(35% 35% at 85% 80%, #A694F355, transparent 60%)",
                }}
            />

            {/* image stage */}
            <div
                className="relative h-full w-full select-none"
                // onWheel={onWheel}
                onDoubleClick={onDoubleClick}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={stopDrag}
                onPointerLeave={stopDrag}
                style={{ cursor: scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in" }}
            >
                {!loaded && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-[#A694F3]" />
                    </div>
                )}
                <GsFile
                    gsUrl={src}
                    alt={alt || title || "image"}
                    draggable={false}
                    onLoad={() => setLoaded(true)}
                    className={`h-full w-full object-contain transition-opacity duration-300 ${loaded ? "opacity-100" : "opacity-0"
                        }`}
                    style={{
                        transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                        transition: dragging ? "none" : "transform 220ms cubic-bezier(.2,.8,.2,1)",
                    }}
                />
            </div>

            {/* title, top-left */}
            {(alt && isMouseEnter) && (
                <div className="absolute left-3 top-3 right-3 flex items-center justify-between gap-1 w-[98%]">
                    <div className="min-w-0 max-w-[60%] flex items-center gap-2 overflow-hidden rounded-md bg-black/40 px-2 py-1 text-[13px] backdrop-blur-sm">
                        <Image className="w-[15px] h-[15px] text-primary-300" strokeWidth={2} />
                        <span className="truncate font-medium text-sm text-white/90">{alt}</span>
                    </div>
                    <div className="min-w-0 overflow-hidden rounded-md bg-black/40 px-2 py-1 text-white text-[13px] backdrop-blur-sm cursor-pointer" onClick={onClose}>
                        <X size={15} />
                    </div>
                </div>
            )}

            {/* fullscreen exit */}
            {isFullscreen && (
                <button
                    onClick={() => setIsFullscreen(false)}
                    className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 p-2 text-white/80 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
                    aria-label="Close fullscreen"
                >
                    <X size={18} />
                </button>
            )}

            {/* floating toolbar */}
            {isMouseEnter && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                    <div className="relative">
                        <div
                            className="absolute -inset-[1px] rounded-full opacity-70 blur-[2px]"
                            style={{ background: "linear-gradient(90deg,#A694F3,#755BEA)" }}
                        />
                        <div className="relative flex items-center gap-1 rounded-full border border-white/10 bg-[#0B0A14]/90 px-2 py-2 backdrop-blur-xl">
                            <ToolbarButton onClick={zoomOut} disabled={scale <= MIN_SCALE} label="Zoom out">
                                <ZoomOut size={16} />
                            </ToolbarButton>

                            <span className="min-w-[3.2rem] select-none text-center text-xs font-medium tabular-nums text-white/70">
                                {zoomPct}%
                            </span>

                            <ToolbarButton onClick={zoomIn} disabled={scale >= MAX_SCALE} label="Zoom in">
                                <ZoomIn size={16} />
                            </ToolbarButton>

                            <div className="mx-1 h-5 w-px bg-white/10" />

                            <ToolbarButton onClick={resetZoom} disabled={scale === 1} label="Reset zoom">
                                <RotateCcw size={16} />
                            </ToolbarButton>

                            <ToolbarButton
                                onClick={() => setIsFullscreen((f) => !f)}
                                label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
                                accent
                            >
                                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                            </ToolbarButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function ToolbarButton({ children, onClick, disabled, label, accent }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            aria-label={label}
            title={label}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition disabled:cursor-not-allowed disabled:opacity-30 ${accent
                ? "text-white hover:brightness-110"
                : "text-white/80 hover:bg-white/10 hover:text-white"
                }`}
            style={
                accent
                    ? { background: "linear-gradient(135deg,#A694F3,#755BEA)" }
                    : undefined
            }
        >
            {children}
        </button>
    );
}

export default ImageViewer;