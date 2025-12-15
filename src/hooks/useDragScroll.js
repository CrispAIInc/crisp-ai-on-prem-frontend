import { useRef, useEffect } from "react";

export default function useDragScroll() {
    const ref = useRef(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        let isDown = false;
        let startX;
        let scrollLeft;

        const start = (e) => {
            isDown = true;
            el.classList.add("dragging");
            startX = (e.pageX || e.touches[0].pageX) - el.offsetLeft;
            scrollLeft = el.scrollLeft;
        };

        const move = (e) => {
            if (!isDown) return;
            e.preventDefault();

            const x = (e.pageX || e.touches[0].pageX) - el.offsetLeft;
            const walk = (x - startX) * 1.2; // scroll speed
            el.scrollLeft = scrollLeft - walk;
        };

        const end = () => {
            isDown = false;
            el.classList.remove("dragging");
        };

        // Mouse
        el.addEventListener("mousedown", start);
        el.addEventListener("mousemove", move);
        el.addEventListener("mouseup", end);
        el.addEventListener("mouseleave", end);

        // Touch
        el.addEventListener("touchstart", start, { passive: false });
        el.addEventListener("touchmove", move, { passive: false });
        el.addEventListener("touchend", end);

        return () => {
            el.removeEventListener("mousedown", start);
            el.removeEventListener("mousemove", move);
            el.removeEventListener("mouseup", end);
            el.removeEventListener("mouseleave", end);
            el.removeEventListener("touchstart", start);
            el.removeEventListener("touchmove", move);
            el.removeEventListener("touchend", end);
        };
    }, []);

    return ref;
}
