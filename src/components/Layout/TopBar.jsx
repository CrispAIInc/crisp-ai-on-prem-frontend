import {
  LogOut,
  Settings
} from "lucide-react";
import { useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from '../../contexts/authContext';
import { ProjectContext } from '../../contexts/projectContext';
import useAuth from '../../hooks/useAuth';
import ProjectSwitcherDropdown from '../ProjectSwitcherDropdown';
import { SettingsModal } from '../Settings/SettingsModal';

export default function TopBar() {

  const { logout } = useAuth();
  const { user } = useContext(AuthContext);

  const {
    isSettingsModalOpen,
    setIsSettingsModalOpen,
  } = useContext(ProjectContext);

  const [menuOpen, setMenuOpen] = useState(false);

  const menuRef = useRef(null);

  // Close the dropdown on outside click or Escape.
  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  function handleSettingsModalState() {
    setIsSettingsModalOpen(true);
    setMenuOpen(false);
  }

  async function log() {
    localStorage.setItem('current_project', null);
    await logout();
  }

  function handleLogout() {
    setMenuOpen(false);
    log();
  }

  return (
    <header className="h-14 border-b border-gray-100 bg-white">
      <div className="h-full flex items-center justify-between px-6">
        {/* Brand mark */}
        <div className="w-36 h-auto flex items-center justify-center">
          <img src='/new-crips-ai-logo.png' alt='Crisp AI logo.' />
        </div>

        {/* Account controls */}
        <div className="flex items-center gap-3">
          <ProjectSwitcherDropdown />

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              aria-label="Account menu"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-200 to-primary-300 text-white text-xs font-semibold flex items-center justify-center hover:opacity-90 transition-opacity"
            >
              {user?.firstName[0]?.toUpperCase()}{user?.lastName[0]?.toUpperCase()}
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-10 w-44 bg-white border border-gray-100 rounded-lg shadow-md py-1 z-50"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSettingsModalState}
                  className="w-full flex items-center gap-2 px-3 py-1 text-[13px] text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings size={14} className="text-gray-700" />
                  Settings
                </button>
                <div className="my-1 border-t border-gray-100" />
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-3 py-1 text-[13px] text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={14} />
                  Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {isSettingsModalOpen && (
        <SettingsModal
          show={isSettingsModalOpen}
          onHide={() => setIsSettingsModalOpen(false)}
          hideTheme
        />
      )}
    </header>
  );
}
