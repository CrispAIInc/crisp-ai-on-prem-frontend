import { useEffect, useRef, useState } from "react";
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

export default function SelectDropdown({
  options = [],
  value,
  onChange,
  placeholder = "Select",
  align = "left",
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((o) => o.value === value);

  const alignmentClasses = {
    left: "left-0",
    right: "right-0",
    center: "left-1/2 -translate-x-1/2",
  };

  return (
    <div className="relative inline-block w-44" ref={ref}>
      {/* Trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full gap-0 px-4 py-2 text-sm border rounded-full "
      >
        <span>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <PlayArrowIcon className={`${open ? '-rotate-90' : 'rotate-90'}`} />
      </button>

      {/* Menu */}
      {open && (
        <div
          className={`absolute z-50 mt-1 w-full rounded-md border bg-white shadow-md ${alignmentClasses[align]}`}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full px-3 py-2 text-left text-md  hover:bg-gray-100
                ${
                  option.value === value
                    ? "bg-gray-100 font-medium"
                    : ""
                }
              `}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
