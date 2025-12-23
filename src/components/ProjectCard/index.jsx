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
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const ProjectNameUpdaterModal = ({ show, onHide, project, currentProject, setCurrentProject, setProjects }) => {
    const [newProjectName, setNewProjectName] = useState(project.name);
    const {theme} = useContext(MainContext);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentProject) {
            setNewProjectName(currentProject.name);
        }
    }, [currentProject]);

    const handleSave = async () => {
        try {
            setIsLoading(true);
            axiosInstance.defaults.headers.common['ProjectId'] = project.project_id;
            await makeApiRequest(`/projects`, 'PUT', {
                name: newProjectName,
            });
            // setCurrentProject({
            //     ...currentProject,
            //     name: newProjectName,
            // });
            setProjects((prevProjects) => prevProjects.map((proj) => proj.project_id === project.project_id ? { ...proj, name: newProjectName, updated_at: new Date() } : proj));
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
                            placeholder='New name'
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

const ConfirmationModal = ({ show, onHide, heading, subheading, confirmedFn, isDeleting }) => {
    const {theme} = useContext(MainContext);
    const [isLoading, setIsLoading] = useState(false);

    if (!show) return null;

    return (
        <Modal
            show={show}
            onHide={onHide}
            size="md"
            aria-labelledby="contained-modal-title-vcenter"
            scrollable={true}
            centered
            dialogClassName='text-left'
        >

            <Modal.Body className={`${theme === 'light' ? '' : 'bg-textColor-300 text-white'}`}>
                <div className="flex flex-col items-center justify-center">
                    <ErrorOutlineIcon className="text-red-500 !text-[60px]" />
                    {/* <div className="flex flex-col gap-1"> */}
                    <h2 className="font-bold text-2xl">{heading}</h2>
                    <p className="text-md w-2/3 text-center mx-auto">{subheading}</p>
                    {/* </div> */}
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center gap-2 ${theme === "light" ? "" : "!bg-textColor-300 !text-white !border-t !border-t-textColor-200"}`}>
                <div
                    className={`flex items-center justify-center gap-2 rounded-full cursor-pointer w-fit py-2 px-3 ${theme === 'light' ? 'bg-textColor-100/10' : 'bg-textColor-100/20'}`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium ${theme === 'light' ? 'text-textColor-300' : 'text-textColor-100'}`}>
                        No, Keep it.
                    </span>
                </div>

                <div
                    className={`flex items-center justify-center gap-2 rounded-full cursor-pointer w-fit bg-red-500 text-white py-2 px-3`}
                    onClick={confirmedFn}
                >
                    {
                        isDeleting ? <div className="flex items-center gap-1">
                            <LoadingSpinner isSmall />
                            <span className={`select-none font-medium `}>Deleting...</span>
                        </div> : <span className={`select-none font-medium `}>Yes, Delete!</span>
                    }
                    {/* {isDeleting ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium `}>Delete</span>} */}
                </div>
            </Modal.Footer>
        </Modal>
    );
}

const ProjectCard = ({recent = false, project, setProjects, setCurrentProject}) => {
    // const {setProjects} = useContext(ProjectsContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

    const deleteProject = async (projectId) => {
        try {
            setIsDeleting(true);
            axiosInstance.defaults.headers.common['ProjectId'] = project.project_id;
            const {message, success} = await makeApiRequest('/projects', "DELETE");
            if (success) {
                setProjects((prevProjects) => prevProjects.filter((proj) => proj.project_id !== projectId));
            } else {
                throw new Error(message)
            }
        } catch(e) {
            console.log(e)
        } finally {
            setIsDeleting(false);
        }
    }

  return (
    <div style={{background: project.thumbnail ? `url('${project.thumbnail}')` : 'url("/app-logo.svg")'}} className={`!bg-cover !bg-center relative   rounded-2xl p-3 w-80 h-48 ${project.thumbnail ? `` : 'bg-[#1E1E1E]'} bg-clip-border  `}>
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
                        icon: isDeleting ? <LoadingSpinner isSmall /> : <DeleteOutlineOutlinedIcon />,
                        onClick: () => setIsDeleteConfirmationOpen(true),
                    },
                ]}
                />
                <ArrowForwardIosIcon onClick={() => setCurrentProject(project)} className="text-white cursor-pointer" />
            </div>
            {/* bottom showcase */}
            <div className="font-semibold">
                <h2 className="text-2xl font-semibold mb-2 !text-white line-clamp-2">{project.name}</h2>
                <div className="flex flex-wrap items-center gap-1">
                    <p className="text-[10px] text-white">{formatReadableDate(recent ? project.updated_at : project.created_at)} ~ </p>
                    {project.selectedSources && <p className="text-[10px] text-white">{project.selectedSources} Sources.</p>}
                </div>
            </div>
        </div>
        {
            isModalOpen && <ProjectNameUpdaterModal show={isModalOpen} onHide={() => setIsModalOpen(false)} project={project} setProjects={setProjects} />
        }

        {
            isDeleteConfirmationOpen && <ConfirmationModal
                show={isDeleteConfirmationOpen}
                onHide={() => setIsDeleteConfirmationOpen(false)}
                // heading="Are you sure you want to delete this project?"
                heading={`Delete project`}
                subheading="All your sources, reels and generated content will be permanently deleted. Are you sure?"
                confirmedFn={async () => {
                    await deleteProject(project.project_id);
                    setIsDeleteConfirmationOpen(false);
                }}
                isDeleting={isDeleting}
            />
        }
    </div>
  )
}

export default ProjectCard