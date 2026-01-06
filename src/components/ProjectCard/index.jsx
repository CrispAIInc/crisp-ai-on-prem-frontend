import React, { useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { extractThumbnail, formatReadableDate } from '../../utils';
import ActionMenu from '../ActionMenu';
import makeApiRequest, { axiosInstance } from '../../api';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import Modal from 'react-bootstrap/Modal';
import LoadingSpinner from '../LoadingSpinner';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import useFirebase from '../../hooks/useFirebase';
import ProjectNameUpdaterModal from "../ProjectNameUpdatedModal";
import ConfirmationModal from '../ConfirmationModal';

const ProjectCard = ({ recent = false, project, setProjects, setCurrentProject }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const [projectThumbnail, setProjectThumbnail] = useState(null);

    const deleteProject = async (projectId) => {
        try {
            setIsDeleting(true);
            axiosInstance.defaults.headers.common['ProjectId'] = project.project_id;
            const { message, success } = await makeApiRequest('/projects', "DELETE");
            if (success) {
                setProjects((prevProjects) => prevProjects.filter((proj) => proj.project_id !== projectId));
            } else {
                throw new Error(message);
            }
        } catch (e) {
            console.log(e);
        } finally {
            setIsDeleting(false);
        }
    };

    // convert gs thumbnail url to public url
    const { getPublicUrl } = useFirebase();
    useEffect(() => {
        async function convertUrl() {
            const publicUrl = await getPublicUrl(project.thumbnail);
            setProjectThumbnail(publicUrl);
        }

        convertUrl();
    }, [project.thumbnail, getPublicUrl]);

    return (
        <div style={{ background: project.thumbnail ? `url('${projectThumbnail}')` : 'url("/app-logo.svg")' }} className={`!bg-cover !bg-center relative rounded-2xl p-3 min-w-80 h-48 bg-clip-border `}>
            {/* top to bottom gradient overlay */}
            <div className="absolute inset-0 shadow-md bg-gradient-to-b from-transparent to-black/70 rounded-2xl"></div>

            {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-600/40 rounded-2xl " /> */}

            <div className="relative z-40 flex flex-col justify-between h-full ">
                {/* top showcase */}
                <div className="flex items-center justify-between ">
                    {/* <MoreVertIcon className="text-white" /> */}
                    <ActionMenu
                        actions={[
                            {
                                label: "Edit Project",
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
                    <div className="relative flex flex-col p-2 rounded-full shadow-lg cursor-pointer hover:bg-white/20 backdrop-blur">
                        <ArrowForwardIosIcon onClick={() => {
                            const now = new Date();
                            setCurrentProject({ ...project, updated_at: now }); setProjects(prev => {
                                if (prev?.project_id === project.project_id) {
                                    return {
                                        ...prev,
                                        updated_at: now
                                    };
                                } return prev;
                            });
                        }} className="font-bold text-purple-500 cursor-pointer backdrop-blur" />
                    </div>
                </div>
                {/* bottom showcase */}
                <div className="font-semibold cursor-pointer" onClick={() => {
                    const now = new Date();
                    setCurrentProject({ ...project, updated_at: now }); setProjects(prev => {
                        if (prev?.project_id === project.project_id) {
                            return {
                                ...prev,
                                updated_at: now
                            };
                        } return prev;
                    });
                }}>
                    <h2 className="mb-0 !text-white line-clamp-2 text-lg font-semibold tracking-wide">{project.name}</h2>
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
    );
};

export default ProjectCard;