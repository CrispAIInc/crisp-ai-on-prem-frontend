// JoyrideTooltip.jsx
import React from "react";

export const JOYRIDE_STEPS = [
    {
        target: "#left_panel",
        title: "Your Workspace",
        content: "This is the main navigation panel where all your sources and tools live.",
        placement: "right",
    },
    {
        target: "#upload_sources",
        title: "Upload Sources",
        content: "Upload documents, videos, or files to start building your knowledge base.",
        placement: "right",
    },
    {
        target: "#source_explorer",
        title: "Source Explorer",
        content: "Browse, manage, and organize all your uploaded sources in one place.",
        placement: "right",
    },
    {
        target: "#discovery",
        title: "Discovery",
        content: "Explore insights and patterns extracted from your content automatically.",
        placement: "right",
    },
    {
        target: "#interaction",
        title: "Interaction",
        content: "Ask questions and interact with your content conversationally.",
    },
    {
        target: "#combined_summary",
        title: "Combined Summary",
        content: "Get a unified summary generated from multiple sources.",
    },
    {
        target: "#copilot",
        title: "AI Copilot",
        content: "Your AI assistant that helps you reason, analyze, and generate insights.",
    },
    {
        target: "#genMetadata",
        title: "Generate Metadata",
        content: "Automatically extract structured metadata from your content.",
        placement: "left",
    },
    {
        target: "#genStories",
        title: "Generate Stories",
        content: "Turn raw information into clear, engaging stories and reports.",
        placement: "left",
    },
    {
        target: "#genMedia",
        title: "Generate Media",
        content: "Create visual or multimedia outputs based on your content.",
        placement: "left",
    },
];

export default function JoyrideTooltip({
    continuous,
    index,
    step,
    backProps,
    primaryProps,
    closeProps,
    tooltipProps,
}) {
    return (
        <div
            {...tooltipProps}
            className="max-w-sm rounded-2xl !bg-red-600/90 backdrop-blur-xl shadow-2xl border  p-5"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">
                    {step.title}
                </h3>
                <button
                    {...closeProps}
                    className="text-gray-400 hover:text-gray-700 transition"
                >
                    ✕
                </button>
            </div>

            {/* Content */}
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
                {step.content}
            </p>

            {/* Footer */}
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                    Step {index + 1}
                </span>

                <div className="flex gap-2">
                    {index > 0 && (
                        <button
                            {...backProps}
                            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                        >
                            Back
                        </button>
                    )}

                    <button
                        {...primaryProps}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-black text-white hover:bg-gray-800 transition"
                    >
                        {continuous ? "Next" : "Finish"}
                    </button>
                </div>
            </div>
        </div>
    );
}
