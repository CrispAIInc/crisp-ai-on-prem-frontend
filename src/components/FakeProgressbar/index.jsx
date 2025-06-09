import React, { useEffect, useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";

export default function FakeProgress({ isLoading, closeModals }) {
    const [progress, setProgress] = useState(0);
    const [intervalId, setIntervalId] = useState(null);

    useEffect(() => {
        let resetTimeout;

        if (isLoading) {
            setProgress(0);

            const id = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 96) return prev; // cap before 100%

                    let speed;
                    if (prev >= 80 && prev < 96) {
                        speed = 0.01; // very slow in final stretch
                    } else if (prev >= 50) {
                        speed = 0.06;
                    } else {
                        speed = 0.2;
                    }

                    return Math.min(prev + speed, 99);
                });
            }, 80);

            setIntervalId(id);
        } else {
            // API done — complete instantly
            setProgress(100);

            if (intervalId) clearInterval(intervalId);

            closeModals();

            resetTimeout = setTimeout(() => {
                setProgress(0);
            }, 500);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (resetTimeout) clearTimeout(resetTimeout);
        };
    }, [isLoading]);

    return <LinearProgress variant="determinate" value={progress} />;
}
