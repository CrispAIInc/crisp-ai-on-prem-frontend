import React, { useState, useEffect, useRef } from "react";

export default function UploadSimulator() {
    const [progress, setProgress] = useState(0);
    const [currentStep, setCurrentStep] = useState("");
    const [isRunning, setIsRunning] = useState(false);
    const [isComplete, setIsComplete] = useState(false);
    const intervalRef = useRef(null);

    const steps = [
        { label: "Video pre-processing", duration: 1000 },
        { label: "Upload to cloud storage", duration: 1500 },
        { label: "Keyframe extraction", duration: 1200 },
        { label: "Thumbnail extraction", duration: 1000 },
        { label: "Audio extraction", duration: 1200 },
        { label: "Transcription generation", duration: 1500 },
        { label: "Summary generation", duration: 1200 },
        { label: "Embeddings generation", duration: 1000 },
    ];

    const simulateUpload = async () => {
        if (isRunning) return;

        setProgress(0);
        setIsComplete(false);
        setIsRunning(true);

        for (let i = 0; i < steps.length; i++) {
            const { label, duration } = steps[i];
            setCurrentStep(label);

            // Simulate progress increase over the duration
            await new Promise((resolve) => {
                let start = progress;
                let end = Math.round(((i + 1) / steps.length) * 100);
                let current = start;

                intervalRef.current = setInterval(() => {
                    current += 2;
                    setProgress((p) => Math.min(p + 2, end));

                    if (current >= end) {
                        clearInterval(intervalRef.current);
                        resolve();
                    }
                }, duration / 10);
            });
        }

        setCurrentStep("✅ Processing complete");
        setIsComplete(true);
        setIsRunning(false);
    };

    useEffect(() => {
        return () => clearInterval(intervalRef.current);
    }, []);

    return (
        <div className="max-w-md p-6 mx-auto mt-10 bg-white border rounded-lg shadow">
            <h2 className="mb-4 text-xl font-semibold">Simulated Upload</h2>

            <button
                onClick={simulateUpload}
                disabled={isRunning}
                className={`px-4 py-2 rounded text-white ${isRunning ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"
                    }`}
            >
                {isRunning ? "Processing..." : "Start Simulation"}
            </button>

            <div className="w-full h-4 mt-6 mb-3 bg-gray-200 rounded-full">
                <div
                    className="h-4 transition-all duration-300 bg-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                ></div>
            </div>

            <p className="font-medium text-gray-700">{currentStep || "Waiting..."}</p>
            <p className="text-sm text-gray-500">{progress}%</p>

            {isComplete && (
                <p className="mt-3 font-medium text-green-600">🎉 All steps completed!</p>
            )}
        </div>
    );
}
