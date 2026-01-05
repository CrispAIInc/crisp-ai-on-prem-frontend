import { useEffect, useRef, useState } from "react";

export default function AppDropdown({
  trigger,
  children,
  align = "left",
  closeOnClick = true,
}) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const alignmentClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={() => setOpen((v) => !v)} className="cursor-pointer">
        {trigger}
      </div>

      {/* Menu */}
      {open && (
        <div
          className={`absolute z-50 mt-2 min-w-[160px] rounded-md border bg-white shadow-lg ${alignmentClasses[align]}`}
          onClick={() => closeOnClick && setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}
