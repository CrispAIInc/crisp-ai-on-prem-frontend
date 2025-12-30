import { useCallback } from "react";

export function useGlowingBorder(ref, animationClass = "animate-glow-twice") {
    const triggerGlow = useCallback(() => {
        if (!ref?.current) return;

        const el = ref.current;

        // Remove animation
        el.classList.remove(animationClass);

        // Force reflow to restart animation
        void el.offsetWidth;

        // Re-add animation
        el.classList.add(animationClass);
    }, [ref, animationClass]);

    return triggerGlow;
}