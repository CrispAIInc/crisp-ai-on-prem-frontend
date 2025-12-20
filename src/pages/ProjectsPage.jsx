import React from 'react'
import ProjectCard from '../components/ProjectCard';

const ProjectsPage = () => {
    const projects = [
        {
    id: "sfkjsdf",
    title: "project title",
    selectedSources: 3,
    created_at: new Date(),
    thumbnail: "https://img.lemde.fr/2025/10/28/0/0/4106/2737/664/0/75/0/e2426fc_ftp-import-images-1-mndx2iniwwkc-2025-10-28t050144z-141823617-rc2gyga040c0-rtrmadp-3-climate-change-cop30-gates.JPG"
}
    ]
  return (
    <div className="p-4">
        {
            projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
            ))
        }
    </div>
  )
}

export default ProjectsPage