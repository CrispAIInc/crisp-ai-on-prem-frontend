import React, { useEffect, useRef, useState } from "react";
import CircularProgressWithLabel from "../CircularProgressWithLabel";

export default function FakeProgress({ isLoading, setIsProgressStarted, isUploadFailed }) {
    const [progress, setProgress] = useState(0);
    const intervalRef = useRef(null);

    useEffect(() => {
        let resetTimeout;

        if (isLoading) {
            setIsProgressStarted(true);
            setProgress(0);

            // clear any previous interval
            if (intervalRef.current) clearInterval(intervalRef.current);

            intervalRef.current = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 99) return prev; // stop increasing before 100%
                    let speed;
                    if (prev >= 80 && prev < 99) speed = 0.1;
                    else if (prev >= 40) speed = 0.5;
                    else speed = 1;
                    return Math.min(prev + speed, 99);
                });
            }, 80);
        } else {
            // when upload completes or fails
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }

            if (!isUploadFailed) {
                // smoothly finish progress
                setProgress(100);
                resetTimeout = setTimeout(() => {
                    setProgress(0);
                    setIsProgressStarted(false);
                }, 4000);
            }
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (resetTimeout) clearTimeout(resetTimeout);
        };
    }, [isLoading, isUploadFailed, setIsProgressStarted]);

    return (
        <div className="flex items-center gap-2">
            <CircularProgressWithLabel
                variant="determinate"
                value={progress}
                isUploadFailed={isUploadFailed}
            />
            <div className="flex flex-col gap-0">
                <h5 className="text-[1rem] font-medium mb-1">
                    {progress < 100 ? "Uploading..." : "Upload done!"}
                </h5>
                <span className="text-sm">
                    {progress < 100
                        ? "Please wait while we upload your files securely."
                        : "Files uploaded successfully."}
                </span>
            </div>
        </div>
    );
}
