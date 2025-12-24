import { useEffect, useRef, useState } from "react";
import Person2OutlinedIcon from '@mui/icons-material/Person2Outlined';
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

export default function UserMenu({ username, onLogout, setIsSettingsModalOpen }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile pill */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="
          flex items-center gap-2
          px-3 py-1.5
          rounded-full
          bg-gray-100/70 hover:bg-gray-200/70
          transition
        "
      >
        {/* Avatar */}
        <div className="flex items-center justify-center text-sm font-semibold text-white rounded-full w-7 h-7 bg-gradient-to-br from-indigo-500 to-cyan-400">
          {username[0]?.toUpperCase()}
        </div>

        {/* Name */}
        <span className="text-sm font-medium text-gray-800">
          {username}
        </span>

        {/* Caret */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            open ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="
            absolute right-0 mt-2 w-44
            rounded-xl
            bg-white/80 backdrop-blur-md
            border border-gray-200/50
            shadow-[0_10px_30px_rgba(0,0,0,0.15)]
            overflow-hidden
            z-50
            animate-[fadeInMenu_0.15s_ease-out]
          "
        >
          <MenuItem icon={<Person2OutlinedIcon />} label="Account" onClick={() => setIsSettingsModalOpen(true)} />
          {/* <MenuItem icon={<SettingsOutlinedIcon />} label="Settings" /> */}

          <div className="h-px my-1 bg-gray-200/60" />

          <MenuItem
            icon={<LogoutOutlinedIcon />}
            label="Log out"
            danger
            onClick={onLogout}
          />
        </div>
      )}
    </div>
  );
}

function MenuItem({ icon, label, danger, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-2 px-3 py-2 text-sm text-left
        transition-colors
        ${danger
          ? "text-red-600 hover:bg-red-500/10"
          : "text-gray-700 hover:bg-indigo-500/10"}
      `}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}
