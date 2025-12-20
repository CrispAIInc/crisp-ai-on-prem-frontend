import { useRef, useEffect } from "react";

export default function useDragScroll() {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let isDown = false;
        let startX = 0;
        let scrollLeft = 0;
        let isDragging = false;

        const DRAG_THRESHOLD = 5; // px

        const start = (e) => {
            isDown = true;
            isDragging = false;
            startX = (e.pageX || e.touches[0].pageX);
            scrollLeft = el.scrollLeft;
        };

        const move = (e) => {
            if (!isDown) return;

            const x = (e.pageX || e.touches[0].pageX);
            const walk = x - startX;

            if (Math.abs(walk) > DRAG_THRESHOLD) {
                isDragging = true;
            }

            if (isDragging) {
                e.preventDefault();
                el.scrollLeft = scrollLeft - walk;
            }
        };

        const end = () => {
            isDown = false;
        };

        const click = (e) => {
            if (isDragging) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        // Mouse
        el.addEventListener("mousedown", start);
        el.addEventListener("mousemove", move);
        el.addEventListener("mouseup", end);
        el.addEventListener("mouseleave", end);
        el.addEventListener("click", click, true); // capture phase

        // Touch
        el.addEventListener("touchstart", start, { passive: false });
        el.addEventListener("touchmove", move, { passive: false });
        el.addEventListener("touchend", end);

        return () => {
            el.removeEventListener("mousedown", start);
            el.removeEventListener("mousemove", move);
            el.removeEventListener("mouseup", end);
            el.removeEventListener("mouseleave", end);
            el.removeEventListener("click", click, true);
            el.removeEventListener("touchstart", start);
            el.removeEventListener("touchmove", move);
            el.removeEventListener("touchend", end);
        };
    }, []);

    return ref;
}
