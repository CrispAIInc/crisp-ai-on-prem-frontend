import { Settings } from "lucide-react";

/**
 * TopBar - the uppermost strip of the shared app.
 * Contains the product mark on the left and account-level
 * controls (settings, avatar) on the right.
 */
export default function TopBar({ user = { initials: "JD" } }) {
  return (
    <header className="h-14 border-b border-gray-100 bg-white">
      <div className="h-full flex items-center justify-between px-6">
        {/* Brand mark */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-blue-600 to-slate-900 flex items-center justify-center shrink-0">
            <div className="w-3 h-3 rounded-full bg-white/90" />
          </div>
          <div className="leading-tight">
            <div className="text-[15px] font-semibold text-gray-900 tracking-tight">
              CRISP AI
            </div>
            <div className="text-[10px] text-gray-400 -mt-0.5">
              Discover Understanding
            </div>
          </div>
        </div>

        {/* Account controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Settings"
            className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
          >
            <Settings size={15} />
          </button>
          <button
            type="button"
            aria-label="Account menu"
            className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 text-white text-xs font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
          >
            {user.initials}
          </button>
        </div>
      </div>
    </header>
  );
}
