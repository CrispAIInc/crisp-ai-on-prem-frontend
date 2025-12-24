import { useEffect, useLayoutEffect, useState } from "react";
import { Helmet } from 'react-helmet';
import MainWorkspace from '../components/MainWorkspace';
// import WorkspaceAuth from '../components/WorkspaceAuth';
import makeApiRequest, { axiosInstance } from '../api';
import { pick } from '../utils';
import { useContext } from "react";
import { AuthContext } from '../contexts/authContext';
import ProjectsPage from './ProjectsPage';
import { MainContext } from '../contexts/mainContext';


export default function MainWorkspacePage() {
    // const [isAuthenticated, setIsAuthenticated] = useState(false);
    // const [inputPassword, setInputPassword] = useState("");

    const { setUser } = useContext(AuthContext);
    const {projects, setProjects, currentProject, setCurrentProject} = useContext(MainContext)

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

    useEffect(() => {
        const getUserInfo = async () => {
          try {
            const data = await makeApiRequest("/me", "get");
            const userWithSpecificProperties = pick(data, ["firstName", "lastName", "email", "username"]);
            setUser({
              userId: data.user_id,
              firstName: data?.display_name.split(" ")[0] ?? data.firstName,
              lastName: data?.display_name.split(" ").slice(1).join(" ") ?? data.lastName,
              ...userWithSpecificProperties,
              emailVerified: data.email_verified,
            });
          } catch (error) {
            console.error("Error fetching user info:", error);
          }
        };
    
        getUserInfo();
      }, []);


      // const [projects, setProjects] = useState([]);
      // const [currentProject, setCurrentProject] = useState(null);
    //   const currentProject = useMemo(() => projects.find(project => 'isCurrent' in project), [JSON.stringify(projects)]);
      
          useEffect(() => {
              async function fetchProjects() {
                  const {projects} = await makeApiRequest('/projects')
                  setProjects(projects);
              }
      
              fetchProjects();
          }, []);

        //   useLayoutEffect(() => {
        //         if (currentProject) {
        //             console.log("adding header")
        //             axiosInstance.defaults.headers.common['ProjectId'] = currentProject.project_id;
        //         }
        //     }, [currentProject]);

            useLayoutEffect(() => {
                if (!currentProject) return;

                axiosInstance.defaults.headers.common['ProjectId'] =
                    currentProject.project_id;

                return () => {
                    delete axiosInstance.defaults.headers.common['ProjectId'];
                };
            }, [currentProject]);

            

    return (
        <>
            <Helmet>
                <meta name="robots" content="noindex, nofollow" />
                <title>Workspace - Crisp AI</title>
                <meta name="description" content="Crisp AI Workspace to manage and create interactive reports." />
            </Helmet>
            <div className="!h-full">
                {/* <MainWorkspace /> */}
                {currentProject ? <MainWorkspace currentProject={currentProject} setCurrentProject={setCurrentProject} /> : <ProjectsPage setCurrentProject={setCurrentProject} projects={projects} setProjects={setProjects} />}
            </div>
        </>
    );
}