import { NAV_ITEMS } from "../../navigation/navitems.js";

/**
 * NavTabs - the primary section navigation, rendered directly
 * beneath the TopBar. Purely presentational aside from the
 * controlled `active` tab, so it can be reused on any page.
 */
export default function NavTabs({ active = "media", onChange = () => { } }) {
  return (
    <nav className="bg-white border-b border-gray-100">
      <ul className="flex items-center px-6 overflow-y-hidden overflow-x-auto [&::-webkit-scrollbar]:h-1
        [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => {
          const isActive = key === active;
          return (
            <li key={key} className="shrink-0">
              <button
                type="button"
                onClick={() => onChange(key)}
                className={[
                  "flex items-center gap-1.5 px-3 py-2 text-[13px] font-medium border-b-2 -mb-px transition-colors whitespace-nowrap",
                  isActive
                    ? "border-primary-300 text-primary-300"
                    : "border-transparent text-gray-500 hover:text-gray-800",
                ].join(" ")}
              >
                <Icon size={14} strokeWidth={2} />
                {label}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
