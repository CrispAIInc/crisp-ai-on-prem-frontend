import { useContext, useEffect } from "react";
import { ClockFading, MessageCircle } from "lucide-react";
import { MainContext } from "../../contexts/mainContext";
import { ENGAGE_TABS } from "../../globals";
import Analytics from "../Analytics";
import Interaction from "../Interaction";

const TABS = [
    { id: ENGAGE_TABS.CORPUS_INTERACTION, label: "Corpus Interaction", icon: MessageCircle },
    { id: ENGAGE_TABS.ASSET_INTERACTION, label: "Asset Interaction", icon: ClockFading },
];

export default function Engage() {
    const {
        engageActiveTab,
        setEngageActiveTab,
        analyticsActiveTab,
        setActiveStudioPanel,
    } = useContext(MainContext);

    function syncStudioPanel(tabId) {
        setActiveStudioPanel(
            tabId === ENGAGE_TABS.ASSET_INTERACTION
                ? analyticsActiveTab
                : null
        );
    }

    useEffect(() => {
        syncStudioPanel(engageActiveTab);
    }, [engageActiveTab, analyticsActiveTab]);

    function handleSubTabChange(tabId) {
        setEngageActiveTab(tabId);
        syncStudioPanel(tabId);
    }

    return (
        <div className="h-full px-[14px] min-h-0 flex flex-col overflow-hidden bg-white">
            <nav className="pt-3.5 flex items-center gap-6 shrink-0 overflow-x-auto overflow-y-hidden">
                {TABS.map(({ id, label, icon: Icon }) => {
                    const active = engageActiveTab === id;

                    return (
                        <button
                            key={id}
                            type="button"
                            aria-current={active ? "page" : undefined}
                            className={`flex items-center gap-2 text-[13px] font-semibold whitespace-nowrap ${active ? "text-primary-300 !border-b-primary-300" : "text-ink"
                                } pb-3 border-b -mb-px transition-colors`}
                            onClick={() => handleSubTabChange(id)}
                        >
                            <Icon size={14} strokeWidth={2} />
                            {label}
                        </button>
                    );
                })}
            </nav>

            <div className="flex-1 min-h-0 overflow-hidden flex flex-col -mx-[14px]">
                {engageActiveTab === ENGAGE_TABS.CORPUS_INTERACTION ? (
                    <Interaction />
                ) : (
                    <Analytics />
                )}
            </div>
        </div>
    );
}
