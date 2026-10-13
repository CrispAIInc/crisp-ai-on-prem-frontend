import { useContext, useEffect } from "react";
import { BookOpen, Clapperboard, LayoutDashboard } from "lucide-react";
import { MainContext } from "../../contexts/mainContext";
import { CREATE_TABS, MAIN_STUDIO_PANELS } from "../../globals";
import Blogs from "../Blogs";
import Shorts from "../Shorts";

const TABS = [
    { id: CREATE_TABS.BLOGS, label: "Blogs", icon: BookOpen, isDisabled: true },
    { id: CREATE_TABS.SHORTS, label: "Shorts", icon: Clapperboard },
    { id: CREATE_TABS.DASHBOARDS, label: "Dashboards", icon: LayoutDashboard },
];

function createPanelForTab(tabId) {
    switch (tabId) {
        case CREATE_TABS.BLOGS:
            return MAIN_STUDIO_PANELS.BLOGS;
        case CREATE_TABS.SHORTS:
            return MAIN_STUDIO_PANELS.SHORTS;
        case CREATE_TABS.DASHBOARDS:
            return MAIN_STUDIO_PANELS.DASHBOARDS;
        default:
            return MAIN_STUDIO_PANELS.BLOGS;
    }
}

export default function Create() {
    const {
        createActiveTab,
        setCreateActiveTab,
        setActiveStudioPanel,
    } = useContext(MainContext);

    function syncStudioPanel(tabId) {
        setActiveStudioPanel(createPanelForTab(tabId));
    }

    useEffect(() => {
        syncStudioPanel(createActiveTab);
    }, [createActiveTab]);

    function handleSubTabChange(tabId) {
        setCreateActiveTab(tabId);
        syncStudioPanel(tabId);
    }

    return (
        <div className="h-full px-[14px] min-h-0 flex flex-col overflow-hidden bg-white">
            <div className="pt-4 pb-3 border-b border-border shrink-0">
                <div className="flex items-center justify-between gap-2">
                    <h2 className="font-display text-[14.5px] font-semibold text-ink">Create</h2>
                </div>
                <p className="text-xs text-ink-secondary mt-0.5">
                    Generate blogs, shorts, and dashboards from your assets.
                </p>
            </div>

            <nav className="pt-3.5 flex items-center gap-6 shrink-0 overflow-x-auto overflow-y-hidden">
                {TABS.map(({ id, label, icon: Icon, isDisabled }) => {
                    const active = createActiveTab === id;

                    return (
                        <button
                            key={id}
                            type="button"
                            aria-current={active ? "page" : undefined}
                            className={`flex items-center gap-2 text-[13px] font-semibold whitespace-nowrap ${active ? "text-primary-300 !border-b-primary-300" : "text-ink"
                                } pb-3 border-b -mb-px transition-colors ${isDisabled ? "opacity-50 cursor-not-allowed" : "hover:text-primary-300 hover:border-b-primary-300"}`}
                            onClick={() => handleSubTabChange(id)}
                            disabled={isDisabled}
                        >
                            <Icon size={14} strokeWidth={2} />
                            {label}
                        </button>
                    );
                })}
            </nav>

            <div className="flex-1 min-h-0 overflow-hidden flex flex-col -mx-[14px]">
                {createActiveTab === CREATE_TABS.BLOGS && <Blogs embedded />}
                {createActiveTab === CREATE_TABS.SHORTS && <Shorts embedded />}
                {createActiveTab === CREATE_TABS.DASHBOARDS && <div className="flex-1 min-h-0" />}
            </div>
        </div>
    );
}
