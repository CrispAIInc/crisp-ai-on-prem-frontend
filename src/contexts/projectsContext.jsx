import { createContext, useEffect, useState } from 'react';
import makeApiRequest from '../api';

export const ProjectsContext = createContext({});

export default function ProjectsProvider({ children }) {

    const [projects, setProjects] = useState([]);

    useEffect(() => {
        async function fetchProjects() {
            const {projects} = await makeApiRequest('/projects')
            setProjects(projects);
        }

        fetchProjects();
    }, []);

    const value = { projects, setProjects };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}