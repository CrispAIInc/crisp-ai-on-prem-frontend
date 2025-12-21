import { createContext, useEffect, useState } from 'react';
import makeApiRequest from '../api';

const ProjectsContext = createContext({});

export default function ProjectsProvider({ children }) {

    const [projects, setProjects] = useState([]);

    useEffect(() => {
        async function fetchProjects() {
            const projects = await makeApiRequest('/projects')
            console.log(projects);
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