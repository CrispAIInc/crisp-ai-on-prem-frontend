import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const SIDES = ["top", "bottom", "right", "left"];
const VIEWPORT_PADDING = 8;
const ARROW_INSET = 12;

const ARROW_CLASS = {
    top: "top-full -translate-x-1/2 -translate-y-1/2",
    bottom: "bottom-full -translate-x-1/2 translate-y-1/2",
    left: "left-full -translate-y-1/2 -translate-x-1/2",
    right: "right-full -translate-y-1/2 translate-x-1/2",
};

const clamp = (value, min, max) => Math.max(min, Math.min(value, max));

function computePosition(trigger, bubble, offset) {
    const vw = document.documentElement.clientWidth;
    const vh = document.documentElement.clientHeight;
    const bw = bubble.offsetWidth;
    const bh = bubble.offsetHeight;
    const pad = VIEWPORT_PADDING;


    const space = {
        top: trigger.top - offset - pad,
        bottom: vh - trigger.bottom - offset - pad,
        left: trigger.left - offset - pad,
        right: vw - trigger.right - offset - pad,
    };
    const needed = { top: bh, bottom: bh, left: bw, right: bw };


    const dir =
        SIDES.find((side) => space[side] >= needed[side]) ??
        SIDES.reduce((best, side) => (space[side] > space[best] ? side : best));

    const centerX = trigger.left + trigger.width / 2;
    const centerY = trigger.top + trigger.height / 2;

    let top;
    let left;
    if (dir === "top" || dir === "bottom") {
        top = dir === "top" ? trigger.top - offset - bh : trigger.bottom + offset;
        left = clamp(centerX - bw / 2, pad, Math.max(pad, vw - bw - pad));
    } else {
        left = dir === "left" ? trigger.left - offset - bw : trigger.right + offset;
        top = clamp(centerY - bh / 2, pad, Math.max(pad, vh - bh - pad));
    }

    const arrow =
        dir === "top" || dir === "bottom"
            ? { left: clamp(centerX - left, ARROW_INSET, Math.max(ARROW_INSET, bw - ARROW_INSET)) }
            : { top: clamp(centerY - top, ARROW_INSET, Math.max(ARROW_INSET, bh - ARROW_INSET)) };

    return { top, left, dir, arrow };
}

export default function Tooltip({ content, offset = 8, className = "", children }) {
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false); // avoids SSR/hydration issues
    const [pos, setPos] = useState({ top: 0, left: 0, dir: "top", arrow: {} });
    const triggerRef = useRef(null);
    const bubbleRef = useRef(null);
    const id = useId();

    useEffect(() => setMounted(true), []);

    const updatePosition = () => {
        if (!triggerRef.current || !bubbleRef.current) return;
        setPos(
            computePosition(
                triggerRef.current.getBoundingClientRect(),
                bubbleRef.current,
                offset
            )
        );
    };


    useLayoutEffect(() => {
        if (!visible) return;
        updatePosition();
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, offset, content]);

    const show = () => setVisible(true);
    const hide = () => setVisible(false);

    return (
        <>
            <span
                ref={triggerRef}
                className="inline-flex"
                onMouseEnter={show}
                onMouseLeave={hide}
                onFocus={show}
                onBlur={hide}
                onKeyDown={(e) => e.key === "Escape" && hide()}
                aria-describedby={visible ? id : undefined}
            >
                {children}
            </span>

            {mounted &&
                createPortal(
                    <span
                        ref={bubbleRef}
                        id={id}
                        role="tooltip"
                        style={{ top: pos.top, left: pos.left }}
                        className={[
                            "pointer-events-none fixed z-50 w-max max-w-xs",
                            "rounded-md shadow-md backdrop-blur-sm bg-white/60 text-textColor-300 !border !border-slate-200/80 px-3 py-2 text-sm leading-snug",
                            "whitespace-normal break-words text-left",
                            "transition-opacity duration-150",
                            visible ? "opacity-100" : "opacity-0",
                            className,
                        ].join(" ")}
                    >
                        {content}
                        <span
                            aria-hidden="true"
                            style={pos.arrow}
                            className={`absolute h-2 w-2 rotate-45 bg-white/60 text-textColor-300 !border !border-slate-300/80 ${ARROW_CLASS[pos.dir]}`}
                        />
                    </span>,
                    document.body
                )}
        </>
    );
}