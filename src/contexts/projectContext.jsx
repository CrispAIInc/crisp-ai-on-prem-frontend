import { createContext, useLayoutEffect, useState } from "react";
import { axiosInstance } from '../api';

export const ProjectContext = createContext();

export default function ProjectProvider({ children }) {

    const [projects, setProjects] = useState([]);
    const [currentProject, setCurrentProject] = useState(JSON.parse(localStorage.getItem('current_project')));
    useLayoutEffect(() => {
        localStorage.setItem('current_project', JSON.stringify(currentProject));

        if (!currentProject) return;

        axiosInstance.defaults.headers.common['ProjectId'] =
            currentProject.project_id;

        return () => {
            delete axiosInstance.defaults.headers.common['ProjectId'];
        };
    }, [currentProject]);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);


    const value = {
        projects, setProjects,
        currentProject, setCurrentProject,
        isSettingsModalOpen, setIsSettingsModalOpen,
    };

    return (
        <ProjectContext.Provider value={value}>
            {children}
        </ProjectContext.Provider>
    );
}
