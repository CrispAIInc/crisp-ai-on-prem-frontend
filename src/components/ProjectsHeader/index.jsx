import React, { useContext } from 'react';
import AppLogo from "/imgs/app-logo-full.png"
import { AuthContext } from '../../contexts/authContext';

import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import useAuth from '../../hooks/useAuth';

const ProjectsHeader = () => {
    const {user} = useContext(AuthContext);
    const {logout} = useAuth()
  return (
    <div className="flex items-center justify-between mb-6">
        <div>
            <img src={AppLogo} className="w-40 h-auto" alt="Crisp AI logo" />
        </div>
        <div className="flex items-center gap-1">
            <p>{user?.firstName} {user?.lastName} | </p>
            <div className="flex items-center gap-1 ml-2 font-semibold text-red-600 cursor-pointer" onClick={logout}>
              <LogoutOutlinedIcon />
              <span>Log out</span>
            </div>
        </div>
    </div>
  )
}

export default ProjectsHeader