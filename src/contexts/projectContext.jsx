import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import makeApiRequest, { axiosInstance } from '../api';
import { AuthContext } from './authContext';
import { pick } from '../utils';

export const ProjectContext = createContext();

export default function ProjectProvider({ theme, setTheme, children }) {

    const { user, setUser } = useContext(AuthContext);
    const [projects, setProjects] = useState([]);
    const [currentProject, setCurrentProject] = useState(JSON.parse(localStorage.getItem('current_project')));
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

    // GET USER INFO
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

    // FETCH PROJECT
    useEffect(() => {
        async function fetchProjects() {
            const { projects } = await makeApiRequest('/projects');
            setProjects(projects);
        }

        fetchProjects();
    }, []);

    // ADD/REMOVE PROJECTID HEADER FROM AXIOS
    useLayoutEffect(() => {
        localStorage.setItem('current_project', JSON.stringify(currentProject));

        if (!currentProject) return;

        axiosInstance.defaults.headers.common['ProjectId'] =
            currentProject.project_id;

        return () => {
            delete axiosInstance.defaults.headers.common['ProjectId'];
        };
    }, [currentProject]);

    // INDICATE IF CURRENT PROJECT IS A PROJECT EXAMPLE
    const isSharedProject = currentProject?.is_shared || Boolean(currentProject?.isProjectExample);

    // INDICATE ID CURRENT PROJECT IS SHARED PROJECT (EXAMPLE PROJECT) AND THE OWNER OF THE EXAMPLE PROJECT (TO EDIT IT)
    const isProjectReadOnly = isSharedProject && user.userId !== "uCWw2cICQzb2qyqWkwSPqPTzBkV2";


    const value = {
        isSharedProject,
        isProjectReadOnly,
        projects, setProjects,
        currentProject, setCurrentProject,
        isSettingsModalOpen, setIsSettingsModalOpen,
        theme, setTheme
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
}
