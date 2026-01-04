import React, { useContext } from 'react';
import AppLogo from "/new-crisp-ai-slogan.png";
import { AuthContext } from '../../contexts/authContext';
import { MainContext } from "../../contexts/mainContext";
import { SettingsModal } from "../Settings/SettingsModal";
import useAuth from '../../hooks/useAuth';
import UserMenu from '../UserMenu';
import { ProjectContext } from '../../contexts/projectContext';

const ProjectsHeader = () => {
  const { isSettingsModalOpen, setIsSettingsModalOpen } = useContext(ProjectContext);
  const { user } = useContext(AuthContext);
  const { logout } = useAuth();
  return (
    <div className="sticky top-0 z-50 flex items-center justify-between py-4 mb-6 border-b bg-white/70 backdrop-blur-xl border-gray-200/40">
      <div>
        <img src={AppLogo} className="w-40 h-auto" alt="Crisp AI logo" />
      </div>
      <UserMenu
        firstName={user.firstName}
        lastName={user.lastName}
        onLogout={logout}
      />
      {
        isSettingsModalOpen && <SettingsModal hideTheme show={isSettingsModalOpen} onHide={() => setIsSettingsModalOpen(false)} />
      }
    </div>
  );
};

export default ProjectsHeader;