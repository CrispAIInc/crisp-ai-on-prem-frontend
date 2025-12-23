import React, { useContext, useEffect, useMemo, useState } from 'react'
import ProjectCard from '../components/ProjectCard';
import { ProjectsContext } from '../contexts/projectsContext.jsx';
import { sortByDate } from '../utils.js';
import ProjectsHeader from '../components/ProjectsHeader/index.jsx';
import AppDropdown from '../components/AppDropdown';
import AppDropdownItem from "../components/AppDropdownItem"
import SelectDropdown from '../components/SelectDropdown/index.jsx';
import AddIcon from '@mui/icons-material/Add';
import LoadingSpinner from '../components/LoadingSpinner/index.jsx';
import makeApiRequest, { axiosInstance } from '../api/index.js';
import { MainContext } from '../contexts/mainContext.jsx';
import Modal from 'react-bootstrap/Modal';


const CreateProjectModal = ({ show, onHide, setProjects, setCurrentProject }) => {
    const [newProjectName, setNewProjectName] = useState("");
    const {theme} = useContext(MainContext);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            const {success, message, project } = await makeApiRequest(`/projects`, 'POST', {
                name: newProjectName,
            });
            if (success) {
                // TODO: add the newly created project to the projects list
                setProjects((prevProjects) => [project, ...prevProjects]);
                // TODO: set current project value and redirect to dashboard
                setCurrentProject(project);
                onHide();
            }
        } catch (error) {
            console.error("Error updating project name:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!show) return null;

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="sm"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
        >

            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className="flex flex-col">
                    <label htmlFor="indexName" className={`block text-sm font-medium ${theme === 'dark' && 'text-gray-300'}`}>
                        New project
                    </label>
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            name="indexName"
                            placeholder='Project name'
                            id='indexName'
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className={`flex-1 block w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 ${theme === 'dark' && 'bg-textColor-300'}`}
                            required
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center gap-3 ${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Cancel
                    </span>
                </div>

                <div
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit ${theme === 'light' ? 'hover:bg-light-hover-100' : 'hover:bg-background_workspace'}`}
                    onClick={handleSave}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        Create
                    </span>}
                </div>
            </Modal.Footer>
        </Modal>
    );
}


const ProjectsPage = ({projects, setProjects, setCurrentProject}) => {
    // const {projects} = useContext(ProjectsContext);

    const [sortOrder, setSortOrder] = useState('asc')
    
    const sortedProjects = useMemo(() => {
        return sortByDate(projects, 'created_at', sortOrder);
    }, [projects, sortOrder]);
    const projectCount = sortedProjects.length;
    
    const [status, setStatus] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
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
                {projectCount > 0 && <><h2 className="text-xl font-bold text-gradient-x mb-4">Recent Projects</h2>
                <div className="flex flex-wrap items-center gap-4 mb-16 overflow-x-auto">
                    {
                        sortedProjects.slice(0, 3).map((project) => (
                            <ProjectCard recent setProjects={setProjects} key={project.project_id} setCurrentProject={setCurrentProject} project={project} />
                        ))
                    }
                </div></>}

                {/* all projects */}
                <div className="flex items-center justify-between mt-6 mb-6">
                    <h2 className="text-xl font-bold text-gradient-x">{projectCount > 0 ? 'All Projects' + projectCount : 'Create your new Project'}</h2>
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

                        <button className="px-4 py-2 font-semibold text-white border rounded-full bg-gradient-to-r from-purple-500 to-indigo-600" onClick={() => setIsModalOpen(true)}>
                            New Project
                        </button>
                    </div>  
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    {/* new project */}
                    <div className={`flex flex-col items-center justify-center  relative border rounded-2xl p-3 w-80 h-48 shadow-lg transition-shadow duration-300 `}>
                            <div className="flex items-center justify-center mb-2 rounded-full cursor-pointer bg-purple-300/40 w-14 h-14" onClick={() => setIsModalOpen(true)}>
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

        {isModalOpen && <CreateProjectModal
            show={isModalOpen}
            onHide={() => setIsModalOpen(false)}
            setProjects={setProjects}
            setCurrentProject={setCurrentProject}
        />}
        </div>
    )
}

export default ProjectsPage