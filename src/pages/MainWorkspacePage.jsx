import { useEffect, useLayoutEffect, useState } from "react";
import { Helmet } from 'react-helmet';
import MainWorkspace from '../components/MainWorkspace';
// import WorkspaceAuth from '../components/WorkspaceAuth';
import makeApiRequest, { axiosInstance } from '../api';
import { pick } from '../utils';
import { useContext } from "react";
import { AuthContext } from '../contexts/authContext';
import ProjectsPage from './ProjectsPage';
import MainProvider, { MainContext } from '../contexts/mainContext';
import { ProjectContext } from '../contexts/projectContext';


export default function MainWorkspacePage() {
  // const [isAuthenticated, setIsAuthenticated] = useState(false);
  // const [inputPassword, setInputPassword] = useState("");

  const { theme, setTheme, projects, setProjects, currentProject, setCurrentProject } = useContext(ProjectContext);

  // const handleLogin = () => {
  //     const correctPassword = "$Crisp-AI2025$";
  //     if (inputPassword === correctPassword) {
  //         setIsAuthenticated(true);
  //     } else {
  //         alert("Incorrect password!");
  //     }
  // };

  // if (isAuthenticated) {
  //     return <WorkspaceAuth inputPassword={inputPassword} setInputPassword={setInputPassword} handleLogin={handleLogin} />;
  // }




  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Workspace - Crisp AI</title>
        <meta name="description" content="Crisp AI Workspace to manage and create interactive reports." />
      </Helmet>
      <div className="!h-full">
        {/* <MainWorkspace /> */}
        {currentProject ? (
          <MainProvider theme={theme} setTheme={setTheme} >
            <MainWorkspace currentProject={currentProject} setCurrentProject={setCurrentProject} />
          </MainProvider>
        ) : <ProjectsPage setCurrentProject={setCurrentProject} projects={projects} setProjects={setProjects} />}
      </div>
    </>
  );
}