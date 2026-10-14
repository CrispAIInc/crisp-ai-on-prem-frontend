import { NAV_ITEMS } from "../../navigation/navitems.js";
import { Info } from "lucide-react";
import { useContext } from 'react';
import AppTooltip from '../AppTooltip/index.jsx';
import { MainContext } from '../../contexts/mainContext.jsx';
import { ANALYTICS_TABS, CREATE_TABS, ENRICH_TABS, MAIN_STUDIO_PANELS } from '../../globals.js';

export default function NavTabs({ active = "media" }) {

  const {
    setActiveTab,
    setActiveStudioPanel,
    setAnalyticsTab,
    enrichActiveTab,
    createActiveTab,
    jsonEntities,
    setSelectedJsonEntity,
  } = useContext(MainContext);

  function handleNavClick(key, tab) {
    console.log(key, tab);
    setActiveTab(key);

    if (key === "enrich") {

      const enrichPanel =
        enrichActiveTab === ENRICH_TABS.BUSINESS_INTELLIGENCE
          ? MAIN_STUDIO_PANELS.BUSINESS_INTELLIGENCE
          : MAIN_STUDIO_PANELS.METADATA;

      setActiveStudioPanel(enrichPanel);

      if (enrichActiveTab === ENRICH_TABS.BUSINESS_INTELLIGENCE && jsonEntities?.[0]) {
        setSelectedJsonEntity(jsonEntities[0]);
      }

    }

    else if (key === "create") {
      const createPanel =
        createActiveTab === CREATE_TABS.BLOGS
          ? MAIN_STUDIO_PANELS.BLOGS
          : createActiveTab === CREATE_TABS.SHORTS
            ? MAIN_STUDIO_PANELS.SHORTS
            : MAIN_STUDIO_PANELS.DASHBOARDS;

      setActiveStudioPanel(createPanel);
    }

    else {
      setActiveStudioPanel(tab);
    }

    if (tab === "time-segments") {
      setAnalyticsTab(ANALYTICS_TABS.TIME_SEGMENTS);
    }
  }

  return (
    <nav className="bg-white border-b border-gray-100">
      <ul className="flex items-center px-6 overflow-y-hidden overflow-x-auto [&::-webkit-scrollbar]:h-1
        [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
        {NAV_ITEMS.map(({ key, label, icon: Icon, tab, disabled, description }) => {
          const isActive = key === active;

          return (
            <li key={key} className="shrink-0">
              <AppTooltip content={description} direction="bottom">
                <button
                  type="button"
                  onClick={() => !disabled && handleNavClick(key, tab)}
                  className={[
                    "flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                    isActive
                      ? "border-primary-300 text-primary-300"
                      : disabled
                        ? "text-gray-400/60 pointer-events-none"
                        : "border-transparent text-gray-500 hover:text-gray-800",
                  ].join(" ")}
                >
                  <Icon size={14} strokeWidth={2} />
                  {label}
                  {description && (
                    <span
                      aria-label={`About ${label}`}
                      className="inline-flex items-center"
                      data-tooltip-id={`nav-${key}-tooltip`}
                      data-tooltip-content={description}
                    >
                      <Info size={13} strokeWidth={2} />
                    </span>
                  )}
                </button>
              </AppTooltip>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
