// JoyrideTooltip.jsx
import React from "react";

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
            className="max-w-sm rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl border border-gray-200 p-5"
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
