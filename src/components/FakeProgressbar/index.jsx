import React, { useEffect, useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";

export default function FakeProgress({ isLoading }) {
    const [progress, setProgress] = useState(0);
    const [intervalId, setIntervalId] = useState(null);

    useEffect(() => {
        if (isLoading) {
            setProgress(0);

            const id = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return prev; // pause around 90%
                    const speed = prev < 90 ? 0.2 : 0.3; // slow down later
                    return Math.min(prev + speed, 90);
                });
            }, 100); // adjust for speed

            setIntervalId(id);
        } else {
            // API is done, instantly complete
            setProgress(100);

            // Cleanup
            if (intervalId) clearInterval(intervalId);

            // Optionally reset after a delay
            const resetTimeout = setTimeout(() => {
                setProgress(0);
            }, 500);

            return () => {
                clearTimeout(resetTimeout);
            };
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [isLoading]);

    return <LinearProgress variant="determinate" value={progress} />;
}
