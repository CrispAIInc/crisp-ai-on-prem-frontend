import React, { useContext } from 'react'
import ProjectCard from '../components/ProjectCard';
import { ProjectsContext } from '../contexts/projectsContext.jsx';

const ProjectsPage = () => {
    const {projects} = useContext(ProjectsContext);
    console.log(projects)

    return (
        <div className="p-4">
            {
                projects.map((project) => (
                    <ProjectCard key={project.project_id} project={project} />
                ))
            }
        </div>
    )
}

export default ProjectsPage