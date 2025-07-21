import React, { useEffect, useState } from "react";
import LinearProgress from "@mui/material/LinearProgress";

export default function FakeProgress({ isLoading, closeModals, progress, setProgress, setIsProgressStarted }) {
    const [intervalId, setIntervalId] = useState(null);

    useEffect(() => {
        let resetTimeout;

        setIsProgressStarted(true);
        if (isLoading) {
            setProgress(0);

            const id = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 97) return prev; // cap before 100%

                    let speed;
                    if (prev >= 80 && prev < 97) {
                        speed = 0.01; // very slow in final stretch
                    } else if (prev >= 40) {
                        speed = 0.02;
                    } else {
                        speed = 0.03;
                    }

                    return Math.min(prev + speed, 99);
                });
            }, 80);

            setIntervalId(id);
        } else {
            // API done — complete instantly
            // setTimeout(() => {
            setProgress(100);
            // }, 1200);

            if (intervalId) clearInterval(intervalId);

            // closeModals();

            // resetTimeout = setTimeout(() => {
            //     setProgress(0);
            // }, 500);

            setTimeout(() => {
                setIsProgressStarted(false);
                closeModals();
            }, 600);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
            if (resetTimeout) clearTimeout(resetTimeout);
        };
    }, [isLoading]);

    return <LinearProgress variant="determinate" value={progress} />;
}
