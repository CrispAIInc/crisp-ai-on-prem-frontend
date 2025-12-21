import React, { useContext, useMemo, useState } from 'react'
import ProjectCard from '../components/ProjectCard';
import { ProjectsContext } from '../contexts/projectsContext.jsx';
import { sortByDate } from '../utils.js';

const ProjectsPage = () => {
    const {projects} = useContext(ProjectsContext);

    const [sortOrder, setSortOrder] = useState('asc')
    
    const projectCount = projects.length;
    const sortedProjects = useMemo(() => {
        return sortByDate(projects, 'created_at', sortOrder);
    }, [projects, sortOrder]);

    return (
        <div className="p-4">
            {/* recent projects */}
            <h2 className="mb-4 text-2xl font-bold text-gradient-x">Recent Projects</h2>
            <div className="flex flex-wrap items-center gap-3 mb-6 overflow-x-auto">
                {
                    sortedProjects.slice(0, 3).map((project) => (
                        <ProjectCard key={project.project_id} project={project} />
                    ))
                }
            </div>

            {/* all projects */}
            <h2 className="mb-4 text-2xl font-bold text-gradient-x">All Projects</h2>
            {
                sortedProjects.map((project) => (
                    <ProjectCard key={project.project_id} project={project} />
                ))
            }
        </div>
    )
}

export default ProjectsPage