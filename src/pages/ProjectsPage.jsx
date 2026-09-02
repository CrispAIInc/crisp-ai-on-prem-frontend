import AddIcon from '@mui/icons-material/Add';
import React, { useCallback, useContext, useState } from 'react';
import CreateProjectModal from "../components/CreateProjectModal";
import LayoutToggle from '../components/LayoutToggle/index.jsx';
import ProjectCard from '../components/ProjectCard';
import ProjectsHeader from '../components/ProjectsHeader/index.jsx';
import ProjectsTable from '../components/ProjectsTable/index.jsx';
import SelectDropdown from '../components/SelectDropdown/index.jsx';
import { ProjectContext } from '../contexts/projectContext.jsx';
import { sortByDate } from '../utils.js';

const ProjectsPage = ({ projects, setProjects, setCurrentProject }) => {

    const [sortOrder, setSortOrder] = useState('asc');

    const { theme } = useContext(ProjectContext);

    const getSortedProjects = useCallback(
        (key, order = sortOrder) => {
            if (projects[0]?.is_shared === true) {
                return [projects[0], ...sortByDate(projects.slice(1), key, order)];
            }
            return sortByDate(projects, key, order);
        },
        [projects, sortOrder]
    );

    const projectCount = getSortedProjects("created_at", sortOrder).length;

    const [status, setStatus] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [viewMode, setViewMode] = React.useState("grid");
    return (
        <div className="px-4 pb-4">
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
                {projectCount > 0 && (
                    <>
                        <h2 className="mb-4 text-xl font-bold text-textColor-200">Recent Projects</h2>
                        {viewMode === "grid" ? (
                            <div className={`flex items-center gap-4 pb-4 mb-16 overflow-x-auto md:gap-8 [&::-webkit-scrollbar]:h-2
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-900 [&::-webkit-scrollbar-thumb]:bg-neutral-600 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500'} touch-pan-y snap-mandatory`}>
                                {
                                    getSortedProjects("updated_at", "desc")?.filter(item => item?.is_shared !== true).slice(0, 3).map((project) => (
                                        <ProjectCard recent setProjects={setProjects} key={project.project_id} setCurrentProject={setCurrentProject} project={project} />
                                    ))
                                }
                            </div>
                        ) : (
                            <ProjectsTable projects={getSortedProjects("updated_at", "desc").slice(0, 3)} recent />
                        )}
                    </>
                )}

                {/* all projects */}
                <div className="flex items-center justify-between mt-6 mb-6">
                    <h2 className="text-xl font-bold text-textColor-200">{projectCount > 0 ? `All Projects (${projectCount})` : 'Create your first Project'}</h2>
                    <div className="flex items-center gap-2">
                        <LayoutToggle viewMode={viewMode} onChange={setViewMode} />

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

                        {viewMode === "list" && <button className="px-4 py-2 font-semibold text-white border rounded-full bg-gradient-to-br from-primary-200 to-primary-300" onClick={() => setIsModalOpen(true)}>
                            New Project
                        </button>}
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {/* new project card only if viewmode is grid */}
                    {viewMode === "grid" && (
                        <div className={`flex flex-col items-center justify-center  relative rounded-2xl p-3 w-80 h-48 shadow-lg transition-shadow duration-300 border-2 border-dashed border-purple-500/40
hover:border-purple-500
hover:shadow-purple-500/20 cursor-pointer`} onClick={() => setIsModalOpen(true)}>
                            <div className="flex items-center justify-center mb-2 rounded-full cursor-pointer bg-purple-300/40 w-14 h-14">
                                <AddIcon className="text-purple-500" fontSize="large" />
                            </div>
                            <h3 className="text-lg text-gradient-x">New Project</h3>
                            <p className="text-sm text-center text-textColor-100">Start a new workspace, ingest files and generate content.</p>
                        </div>
                    )}

                    {
                        viewMode === "grid" ? (
                            <>
                                {getSortedProjects("created_at", sortOrder).map((project) => (
                                    <ProjectCard setProjects={setProjects} key={project.project_id} setCurrentProject={setCurrentProject} project={project} />
                                ))}
                            </>
                        ) : (

                            <ProjectsTable projects={getSortedProjects("created_at", sortOrder)} />
                        )
                    }
                </div>
            </div>

            {isModalOpen && <CreateProjectModal
                show={isModalOpen}
                onHide={() => setIsModalOpen(false)}
                setProjects={setProjects}
                setCurrentProject={setCurrentProject}
            />}
        </div>
    );
};

export default ProjectsPage;