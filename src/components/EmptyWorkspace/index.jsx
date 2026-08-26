import React from "react";
import {
    Sparkles,
    Play,
    Star,
    Lightbulb,
} from "lucide-react";

const EmptyWorkspace = () => {
    return (
        <div className="flex h-full w-full items-center justify-center bg-[#f5f6f8] px-6">
            <div className="flex max-w-xl flex-col items-center text-center">
                {/* Icon */}
                <div className="mt-5 mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-200 to-primary-300 shadow-sm">
                    <Sparkles className="h-5 w-5 text-white" />
                </div>

                {/* Heading */}
                <h2 className="text-[19px] font-semibold tracking-[-0.01em] text-gray-800">
                    Your workspace is ready
                </h2>

                {/* Description */}
                <p className="mt-2 max-w-md text-[13px] leading-5 text-gray-500">
                    Select a source from your collection to explore its content,
                    metadata, and AI-powered insights.
                </p>

                {/* Feature cards */}
                <div className="mt-7 grid w-full max-w-lg grid-cols-3 gap-3">
                    <FeatureCard
                        icon={Play}
                        title="Content"
                        description="Watch & explore"
                    />

                    <FeatureCard
                        icon={Star}
                        title="Metadata"
                        description="Context & details"
                    />

                    <FeatureCard
                        icon={Lightbulb}
                        title="Insights"
                        description="AI-powered analysis"
                    />
                </div>

                {/* Hint */}
                <div className="mt-7 flex items-center gap-1.5 text-[12px] text-primary-300">
                    <span>Select a source from the left panel</span>
                </div>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon: Icon, title, description }) => {
    return (
        <div className="flex flex-col items-center rounded-xl border border-gray-200/80 bg-white px-3 py-4 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
                <Icon className="h-4 w-4 text-primary-300" strokeWidth={1.8} />
            </div>

            <span className="text-[12px] font-medium text-gray-700">
                {title}
            </span>

            <span className="mt-0.5 text-[11px] text-gray-400">
                {description}
            </span>
        </div>
    );
};

export default EmptyWorkspace;