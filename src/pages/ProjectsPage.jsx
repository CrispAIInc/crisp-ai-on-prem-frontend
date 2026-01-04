import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import ProjectCard from '../components/ProjectCard';
import { extractThumbnail, sortByDate } from '../utils.js';
import ProjectsHeader from '../components/ProjectsHeader/index.jsx';
import SelectDropdown from '../components/SelectDropdown/index.jsx';
import AddIcon from '@mui/icons-material/Add';
import LoadingSpinner from '../components/LoadingSpinner/index.jsx';
import makeApiRequest, { axiosInstance } from '../api/index.js';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import Modal from 'react-bootstrap/Modal';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';

const CreateProjectModal = ({ show, onHide, setProjects, setCurrentProject }) => {
    const [newProjectName, setNewProjectName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [projectThumbnail, setProjectThumbnail] = useState(null);

    const projectThumbnailRef = useRef(null);

    const handleSave = async () => {
        try {
            if (newProjectName === "") return;
            setIsLoading(true);
            const formData = new FormData();
            formData.append("name", newProjectName);
            formData.append("project_thumbnail", projectThumbnail);
            const { success, message, project } = await makeApiRequest(`/projects`, 'POST', formData, { 'Content-type': "multipart/form-data" });
            if (success) {
                // TODO: add the newly created project to the projects list
                setProjects((prevProjects) => [project, ...prevProjects]);
                // TODO: set current project value and redirect to dashboard
                setCurrentProject(project);
                onHide();
            } else {
                throw new Error(message);
            }
        } catch (error) {
            console.log(error?.message);
            console.error("Error updating project name:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!show) return null;

    function handleThumbnailChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setProjectThumbnail(file);
        setImagePreview(extractThumbnail(file));
    }

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

            <Modal.Body>
                <div className='flex items-start justify-center gap-2'>
                    {/* project thumbnail wrapper */}
                    <div onClick={() => projectThumbnailRef.current.click()} className="relative flex flex-col items-center justify-center w-20 h-20 border rounded-md cursor-pointer border-textColor-100">
                        {imagePreview ? <img src={imagePreview} alt="Thumbnail preview"
                            className="object-cover w-full h-full " /> : <FileUploadOutlinedIcon className="!h-16 !w-16 text-textColor-100" />}

                        {/* clear preview X icon */}
                        {imagePreview && <CloseOutlinedIcon onClick={(e) => {
                            e.stopPropagation();
                            setImagePreview(null);
                        }} className="absolute p-1 !text-[17px] text-white rounded-full cursor-pointer bg-textColor-300 -top-2 -left-2" />}
                    </div>
                    {/* thumbnail input */}
                    <input accept="image/*" ref={projectThumbnailRef} type="file" className="hidden" onChange={e => handleThumbnailChange(e)} />

                    {/* project name */}
                    <div className="flex flex-col">
                        <label htmlFor="indexName" className={`block text-sm font-medium`}>
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
                                className={`flex-1 block w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
                                required
                                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                            />
                        </div>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center gap-3 `}>
                <div
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit hover:bg-light-hover-100`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium text-textColor-300`}>
                        Cancel
                    </span>
                </div>

                <div
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit hover:bg-light-hover-100`}
                    onClick={handleSave}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium text-textColor-300`}>
                        Create
                    </span>}
                </div>
            </Modal.Footer>
        </Modal>
    );
};


const ProjectsPage = ({ projects, setProjects, setCurrentProject }) => {
    // const {projects} = useContext(ProjectsContext);

    const [sortOrder, setSortOrder] = useState('asc');

    // const { theme, setTheme } = useContext(ProjectContext);

    const sortedProjects = useMemo(() => {
        return sortByDate(projects, 'created_at', sortOrder);
    }, [projects, sortOrder]);
    const projectCount = sortedProjects.length;

    const [status, setStatus] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
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
                {projectCount > 0 && <><h2 className="mb-4 text-xl font-bold text-textColor-200">Recent Projects</h2>
                    <div className="flex flex-wrap items-center gap-6 mb-16 overflow-x-auto hover:z-10 md:gap-8">
                        {
                            sortedProjects.slice(0, 2).map((project) => (
                                <ProjectCard recent setProjects={setProjects} key={project.project_id} setCurrentProject={setCurrentProject} project={project} />
                            ))
                        }
                    </div></>}

                {/* all projects */}
                <div className="flex items-center justify-between mt-6 mb-6">
                    <h2 className="text-xl font-bold text-textColor-200">{projectCount > 0 ? `All Projects (${projectCount})` : 'Create your first Project'}</h2>
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
                    <div className={`flex flex-col items-center justify-center  relative rounded-2xl p-3 w-80 h-48 shadow-lg transition-shadow duration-300 border-2 border-dashed border-purple-500/40
hover:border-purple-500
hover:shadow-purple-500/20 cursor-pointer`} onClick={() => setIsModalOpen(true)}>
                        <div className="flex items-center justify-center mb-2 rounded-full cursor-pointer bg-purple-300/40 w-14 h-14">
                            <AddIcon className="text-purple-500" fontSize="large" />
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
    );
};

export default ProjectsPage;