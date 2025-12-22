import React, { useContext, useEffect, useMemo, useState } from 'react'
import ProjectCard from '../components/ProjectCard';
import { ProjectsContext } from '../contexts/projectsContext.jsx';
import { sortByDate } from '../utils.js';
import ProjectsHeader from '../components/ProjectsHeader/index.jsx';
import AppDropdown from '../components/AppDropdown';
import AppDropdownItem from "../components/AppDropdownItem"
import SelectDropdown from '../components/SelectDropdown/index.jsx';
import AddIcon from '@mui/icons-material/Add';




const ProjectsPage = ({projects, setProjects, setCurrentProject}) => {
    // const {projects} = useContext(ProjectsContext);

    const [sortOrder, setSortOrder] = useState('asc')
    
    const sortedProjects = useMemo(() => {
        return sortByDate(projects, 'created_at', sortOrder);
    }, [projects, sortOrder]);
    const projectCount = sortedProjects.length;
    
    const [status, setStatus] = useState("");
    return (
        <div className="p-4">
            <ProjectsHeader />
            <div className="
                mx-auto px-4
                sm:max-w-[540px]
                md:max-w-[720px]
                lg:max-w-[960px]
                xl:max-w-[1140px]
                2xl:max-w-[1320px]
            ">
                {/* recent projects */}
                {projectCount > 0 && <><h2 className="text-xl font-bold text-gradient-x">Recent Projects</h2>
                <div className="flex flex-wrap items-center gap-3 mb-16 overflow-x-auto">
                    {
                        sortedProjects.slice(0, 3).map((project) => (
                            <ProjectCard recent setProjects={setProjects} key={project.project_id} setCurrentProject={setCurrentProject} project={project} />
                        ))
                    }
                </div></>}

                {/* all projects */}
                <div className="flex items-center justify-between mt-6">
                    <h2 className="text-xl font-bold text-gradient-x">{projectCount > 0 ? 'All' : 'Create your new Project'} Projects ({projectCount})</h2>
                    <div className="flex items-center gap-2">
                        {projectCount > 0 && <SelectDropdown
                            value={status}
                            onChange={(val) => {
                                setSortOrder(val);
                                setStatus(val);
                            }}
                            placeholder="Sort by date"
                            options={[
                                { label: "recent to olders", value: "asc" },
                                { label: "oldest to recent", value: "desc" },
                            ]}
                        />}

                        <button className="px-4 py-2 font-semibold text-white border rounded-full bg-gradient-to-r from-purple-500 to-indigo-600">
                            New Project
                        </button>
                    </div>  
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex flex-col items-center justify-center  relative border rounded-2xl p-3 w-80 h-48 shadow-lg transition-shadow duration-300 `}>
                            <div className="flex items-center justify-center mb-2 rounded-full cursor-pointer bg-purple-300/40 w-14 h-14">
                                <AddIcon className="text-purple-500 cursor-pointer" fontSize="large" />
                            </div>
                            <h3 className="text-lg text-gradient-x">New Project</h3>
                            <p className="text-sm text-center text-textColor-100">Start a new workspace, upload files and generate content.</p>
                    </div>
                    {
                        sortedProjects.map((project) => (
                            <ProjectCard setProjects={setProjects} key={project.project_id} setCurrentProject={setCurrentProject} project={project} />
                        ))
                    }
                </div>
            </div>

            
        </div>
    )
}

export default ProjectsPage