import { Helmet } from 'react-helmet';
import MainWorkspace from '../components/MainWorkspace';
// import WorkspaceAuth from '../components/WorkspaceAuth';
import { useContext } from "react";
import MainProvider from '../contexts/mainContext';
import { ProjectContext } from '../contexts/projectContext';
import ProjectsPage from './ProjectsPage';


export default function MainWorkspacePage() {

  const { theme, setTheme, projects, setProjects, currentProject, setCurrentProject } = useContext(ProjectContext);

  console.log(projects);

  return (
    <>
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Crisp AI - My Projects</title>
        <meta name="description" content="Crisp AI Workspace to manage and create interactive reports." />
      </Helmet>
      <div className="!h-full">
        {/* <MainWorkspace /> */}
        {currentProject ? (
          <MainProvider theme={theme} setTheme={setTheme} >
            <MainWorkspace currentProject={currentProject} setCurrentProject={setCurrentProject} />
          </MainProvider>
        ) : <ProjectsPage setCurrentProject={setCurrentProject} projects={[{ ...projects[0], is_shared: true, created_at: new Date() }, ...projects]} setProjects={setProjects} />}
      </div>
    </>
  );
}