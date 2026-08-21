import { useState } from "react";
import { Upload, FolderOpen, Check, Film, Image as ImageIcon } from "lucide-react";

// Static placeholder data — replace with real source items.
const MOCK_ITEMS = [
    { id: 1, name: "BEST_VIDEO_CV_EVER_MARK.mp4", type: "video" },
    { id: 2, name: "product_launch_teaser.mp4", type: "video" },
    { id: 3, name: "onboarding_walkthrough.mp4", type: "video" },
    { id: 4, name: "team_offsite_photo.png", type: "image" },
    { id: 5, name: "customer_interview_q3.mp4", type: "video" },
    { id: 6, name: "brand_guidelines_cover.png", type: "image" },
    { id: 7, name: "webinar_recording_aug.mp4", type: "video" },
    { id: 8, name: "hero_banner_draft.png", type: "image" },
];

/**
 * Media - Upload / Collection sub-navigation above a grid of
 * source cards (thumbnail + filename + checkbox), with
 * select-all / clear-all controls above the grid.
 *
 * Presentational only — no upload, filtering, or persistence
 * logic is wired up.
 */
export default function Media() {
    const [activeNav, setActiveNav] = useState("upload");
    const [checkedIds, setCheckedIds] = useState([]);

    const allChecked = checkedIds.length === MOCK_ITEMS.length;
    const someChecked = checkedIds.length > 0;

    function toggleCard(id) {
        setCheckedIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    }

    function toggleAll() {
        setCheckedIds(allChecked ? [] : MOCK_ITEMS.map((item) => item.id));
    }

    function clearAll() {
        setCheckedIds([]);
    }

    return (
        <div className="max-w-[1400px] h-full mx-auto px-6 py-6 bg-white">
            {/* Sub-navigation */}
            <nav className="flex items-center gap-6 border-b border-gray-100 mb-5">
                {[
                    { key: "upload", label: "Upload", icon: Upload },
                    { key: "collection", label: "Collection", icon: FolderOpen },
                ].map(({ key, label, icon: Icon }) => {
                    const isActive = key === activeNav;
                    return (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setActiveNav(key)}
                            className={[
                                "flex items-center gap-1.5 pb-3 text-[13px] font-medium border-b-2 -mb-px transition-colors",
                                isActive
                                    ? "border-violet-600 text-violet-700"
                                    : "border-transparent text-gray-500 hover:text-gray-800",
                            ].join(" ")}
                        >
                            <Icon size={14} strokeWidth={2} />
                            {label}
                        </button>
                    );
                })}
            </nav>

            {/* Selection controls */}
            <div className="flex items-center justify-between mb-4">
                <label className="flex items-center gap-2 text-[13px] text-gray-600 cursor-pointer select-none">
                    <span
                        onClick={toggleAll}
                        className={[
                            "w-4 h-4 rounded flex items-center justify-center border transition-colors",
                            allChecked
                                ? "bg-violet-600 border-violet-600"
                                : someChecked
                                    ? "bg-violet-100 border-violet-400"
                                    : "bg-white border-gray-300",
                        ].join(" ")}
                    >
                        {allChecked && <Check size={11} className="text-white" strokeWidth={3} />}
                        {!allChecked && someChecked && (
                            <span className="w-1.5 h-1.5 rounded-sm bg-violet-500" />
                        )}
                    </span>
                    {allChecked ? "Deselect all" : "Select all"}
                    <span className="text-gray-400">
                        {someChecked ? `(${checkedIds.length} selected)` : `(${MOCK_ITEMS.length})`}
                    </span>
                </label>

                <button
                    type="button"
                    onClick={clearAll}
                    disabled={!someChecked}
                    className={[
                        "text-[13px] font-medium transition-colors",
                        someChecked
                            ? "text-red-600 hover:text-red-700"
                            : "text-gray-300 cursor-not-allowed",
                    ].join(" ")}
                >
                    Clear all
                </button>
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {MOCK_ITEMS.map((item) => {
                    const isChecked = checkedIds.includes(item.id);
                    const Icon = item.type === "video" ? Film : ImageIcon;

                    return (
                        <div
                            key={item.id}
                            className={[
                                "group relative bg-white rounded-xl border shadow-sm overflow-hidden transition-colors cursor-pointer",
                                isChecked ? "border-violet-400 ring-2 ring-violet-100" : "border-gray-100 hover:border-gray-200",
                            ].join(" ")}
                            onClick={() => toggleCard(item.id)}
                        >
                            {/* Checkbox */}
                            <div
                                className={[
                                    "absolute top-2.5 left-2.5 z-10 w-5 h-5 rounded flex items-center justify-center border transition-colors",
                                    isChecked
                                        ? "bg-violet-600 border-violet-600"
                                        : "bg-white/90 border-gray-300 group-hover:border-gray-400",
                                ].join(" ")}
                            >
                                {isChecked && <Check size={12} className="text-white" strokeWidth={3} />}
                            </div>

                            {/* Thumbnail */}
                            <div className="relative aspect-square bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center">
                                <Icon size={22} className="text-white/40" />
                                {item.type === "video" && (
                                    <span className="absolute bottom-2 right-2 text-[10px] text-white/80 bg-black/40 rounded px-1.5 py-0.5 tabular-nums">
                                        2:10
                                    </span>
                                )}
                            </div>

                            {/* File name */}
                            <div className="px-2.5 py-2 border-t border-gray-100">
                                <p className="text-[12px] text-gray-700 truncate">{item.name}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}