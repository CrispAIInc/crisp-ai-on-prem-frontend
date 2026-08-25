import { useState } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Generic expand/collapse section. Starts open by default; pass
 * defaultOpen={false} to start collapsed. Content area is left to the
 * caller (children) — intentionally empty by default here.
 */
export default function CollapsibleSection({ title, defaultOpen = true, children }) {
    const [open, setOpen] = useState(defaultOpen);

    return (
        <div className="border-t border-border">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className="w-full flex items-center justify-between py-2.5 text-left"
            >
                <span className="text-[12.5px] font-semibold text-ink">{title}</span>
                <ChevronDown
                    size={14}
                    className={`text-ink-secondary transition-transform ${open ? "rotate-180" : "rotate-0"}`}
                />
            </button>
            {open && <div className="pb-3">{children}</div>}
        </div>
    );
}
