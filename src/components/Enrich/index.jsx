import { useContext, useEffect } from "react";
import { Sparkles, Braces } from "lucide-react";
import { MainContext } from "../../contexts/mainContext";
import { ENRICH_TABS, MAIN_STUDIO_PANELS } from "../../globals";
import ContextualMetadata from "../ContextualMetadata";
import BusinessIntelligence from "../BusinessIntelligence";

const TABS = [
    { id: "metadata", label: "Contextual metadata", icon: Sparkles },
    { id: "business-intelligence", label: "Business intelligence", icon: Braces },
];

export default function Enrich() {
    const {
        enrichActiveTab,
        setEnrichActiveTab,
        setActiveStudioPanel,
        jsonEntities,
        setSelectedJsonEntity,
    } = useContext(MainContext);

    function syncStudioPanel(tabId) {
        setActiveStudioPanel(
            tabId === ENRICH_TABS.BUSINESS_INTELLIGENCE
                ? MAIN_STUDIO_PANELS.BUSINESS_INTELLIGENCE
                : MAIN_STUDIO_PANELS.METADATA
        );

        if (tabId === ENRICH_TABS.BUSINESS_INTELLIGENCE && jsonEntities?.[0]) {
            setSelectedJsonEntity(jsonEntities[0]);
        }
    }

    useEffect(() => {
        syncStudioPanel(enrichActiveTab);
    }, [enrichActiveTab]);

    function handleSubTabChange(tabId) {
        setEnrichActiveTab(tabId);
        syncStudioPanel(tabId);
    }

    return (
        <div className="h-full px-[14px] min-h-0 flex flex-col overflow-hidden bg-white">
            <nav className="pt-3.5 flex items-center gap-6 shrink-0 overflow-x-auto overflow-y-hidden">
                {TABS.map(({ id, label, icon: Icon }) => {
                    const active = enrichActiveTab === id;

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
                {enrichActiveTab === TABS[0].id ? (
                    <ContextualMetadata embedded />
                ) : (
                    <BusinessIntelligence embedded />
                )}
            </div>
        </div>
    );
}
