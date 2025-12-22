import { createContext, useEffect, useMemo, useState } from 'react';
import makeApiRequest from '../api';

export const ProjectsContext = createContext({});

export default function ProjectsProvider({ children }) {

    const [projects, setProjects] = useState([]);
    const currentProject = useMemo(() => projects.find(project => 'isCurrent' in project), [projects, JSON.stringify(projects)]);

    useEffect(() => {
        async function fetchProjects() {
            const {projects} = await makeApiRequest('/projects')
            setProjects(projects);
        }

        fetchProjects();
    }, []);

    const value = { projects, setProjects, currentProject };

  return (
    <ProjectsContext.Provider value={value}>
      {children}
    </ProjectsContext.Provider>
  );
}