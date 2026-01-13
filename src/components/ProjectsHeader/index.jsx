import { useContext } from 'react';
import { AuthContext } from '../../contexts/authContext';
import { ProjectContext } from '../../contexts/projectContext';
import useAuth from '../../hooks/useAuth';
import { SettingsModal } from "../Settings/SettingsModal";
import UserMenu from '../UserMenu';
import AppLogo from "/new-crisp-ai-slogan.png";

const ProjectsHeader = () => {
  const { isSettingsModalOpen, setIsSettingsModalOpen } = useContext(ProjectContext);
  const { user } = useContext(AuthContext);
  const { logout } = useAuth();
  return (
    <div className="flex items-center justify-between py-4 mb-6 border-b border-gray-200 bg-white/70 backdrop-blur-xl">
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