import React, { useContext } from 'react';
import AppLogo from "/imgs/app-logo-full.png"
import { AuthContext } from '../../contexts/authContext';

const ProjectsHeader = () => {
    const {user} = useContext(AuthContext)
  return (
    <div>
        <div>
            <img src={AppLogo} alt="Crisp AI logo" />
        </div>
        <div>
            <p>{user?.firstName}</p>
        </div>
    </div>
  )
}

export default ProjectsHeader