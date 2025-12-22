import React, { useContext, useEffect, useState } from 'react';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { formatReadableDate } from '../../utils';
import ActionMenu from '../ActionMenu';
import makeApiRequest, { axiosInstance } from '../../api'

import { ProjectsContext } from "../../contexts/projectsContext";
import Modal from 'react-bootstrap/Modal';
import { MainContext } from '../../contexts/mainContext';
import LoadingSpinner from '../LoadingSpinner';



const ProjectNameUpdaterModal = ({ show, onHide, project, currentProject, setCurrentProject }) => {
    const [newProjectName, setNewProjectName] = useState(currentProject ? currentProject.name : "");
    const {theme} = useContext(MainContext);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentProject) {
            setNewProjectName(currentProject.project_name);
        }
    }, [currentProject]);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            axiosInstance.defaults.headers.common['ProjectId'] = project.project_id;
            await makeApiRequest(`/projects`, 'PUT', {
                name: newProjectName,
            });
            setCurrentProject({
                ...currentProject,
                name: newProjectName,
            });
            onHide();
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
                        Rename project
                    </label>
                    <div className="flex items-center gap-1">
                        <input
                            type="text"
                            name="indexName"
                            placeholder='Type index name here'
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
                        Save
                    </span>}
                </div>
            </Modal.Footer>
        </Modal>
    );
}

const ProjectCard = ({project, setCurrentProject}) => {
    const {setProjects} = useContext(ProjectsContext);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const deleteProject = async (projectId) => {
        try {
            const {message, success} = await makeApiRequest('/projects', "DELETE");

            if (success) {
                setProjects((prevProjects) => prevProjects.filter((proj) => proj.project_id !== projectId));
            } else {
                throw new Error(message)
            }
        } catch(e) {
            console.log(e)
        }
    }

  return (
    <div style={{background: project.thumbnail ? `url('${project.thumbnail}')` : 'url("/app-logo.svg")'}} className={`!bg-cover !bg-center relative  border rounded-2xl p-3 w-80 h-48 ${project.thumbnail ? `` : 'bg-[#1E1E1E]'}   shadow-lg transition-shadow duration-300 cursor-pointer`} onClick={() => setCurrentProject(project)}>
        {/* top to bottom gradient overlay */}
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent to-black rounded-2xl"></div>

        <div className="relative z-50 flex flex-col justify-between h-full ">
            {/* top showcase */}
            <div className="flex items-center justify-between ">
                {/* <MoreVertIcon className="text-white" /> */}
                <ActionMenu
                actions={[
                    {
                        label: "Edit title",
                        icon: <EditOutlinedIcon />,
                        onClick: (e) => {
                            e.stopPropagation();
                            setIsModalOpen(true);
                        },
                    },
                    {
                        label: "Delete",
                        icon: <DeleteOutlineOutlinedIcon />,
                        onClick: () => deleteProject(project.project_id),
                    },
                ]}
                />
                <ArrowForwardIosIcon  className="text-white" />
            </div>
            {/* bottom showcase */}
            <div className="font-semibold">
                <h2 className="text-2xl font-semibold mb-2 !text-white line-clamp-2">{project.name}</h2>
                <div className="flex flex-wrap items-center gap-1">
                    <p className="text-[10px] text-white">{formatReadableDate(project.updated_at)} ~ </p>
                    {project.selectedSources && <p className="text-[10px] text-white">{project.selectedSources} Sources.</p>}
                </div>
            </div>
        </div>
        {
                isModalOpen && <ProjectNameUpdaterModal show={isModalOpen} onHide={setIsModalOpen} project={project} />
            }
    </div>
  )
}

export default ProjectCard