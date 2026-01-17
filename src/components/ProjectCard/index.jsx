import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useEffect, useMemo, useState } from 'react';
import AnimatedText from "../AnimatedText";
import useFirebase from '../../hooks/useFirebase';
import { formatReadableDate } from '../../utils';
import ActionMenu from '../ActionMenu';
import ConfirmationModal from '../ConfirmationModal';
import LoadingSpinner from '../LoadingSpinner';
import ProjectNameUpdaterModal from "../ProjectNameUpdatedModal";
import useProject from '../../hooks/useProject';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';

const PROJECT_OWNER_ID = "uCWw2cICQzb2qyqWkwSPqPTzBkV2";

const ProjectCard = ({ recent = false, project, setProjects, setCurrentProject }) => {

    const { deleteProject } = useProject();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const [projectThumbnail, setProjectThumbnail] = useState(null);

    const handleDeleteProject = async (projectId) => {
        setIsDeleting(true);
        setIsDeleteConfirmationOpen(false);
        try {
            await deleteProject(projectId);
        } catch (error) {
            console.log(error);
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

    const projectSourcesTotal = useMemo(() => project?.checked_sources?.length + project?.unchecked_sources?.length, [project.checked_sources?.length, project.unchecked_sources?.length]);

    return (
        <>
            <div style={{ background: project.thumbnail ? `url('${projectThumbnail}')` : 'url("/app-logo.svg")' }} className={`${project.thumbnail ? '!bg-cover' : '!bg-contain'} !bg-no-repeat !bg-center relative rounded-2xl p-3 min-w-80 h-48 bg-clip-border cursor-pointer ${project?.is_shared && 'animate-glow-multiple'}`} onClick={() => {
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
                {/* delete overlap */}
                {isDeleting && <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full bg-white/80">
                    <AnimatedText text='Deleting...' cssClasses='!text-lg !text-black' />
                </div>}

                {/* top to bottom gradient overlay */}
                <div className="absolute inset-0 shadow-md bg-gradient-to-b from-transparent to-black/70 rounded-2xl"></div>

                {/* <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-600/40 rounded-2xl " /> */}

                <div className="relative z-40 flex flex-col justify-between h-full ">
                    {/* top showcase */}
                    <div className="flex items-center justify-between ">
                        {(project?.is_shared && project.user_id !== PROJECT_OWNER_ID) ? (
                            <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-md text-black/70 font-semibolt">
                                <AutoAwesomeOutlinedIcon />
                                <p>Example Project</p>
                            </div>
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                    {/* bottom showcase */}
                    <div className="font-semibold">
                        <h2 className="mb-0 !text-white line-clamp-2 text-lg font-semibold tracking-wide">{project.name}</h2>
                        <div className="flex flex-wrap items-center gap-1">
                            <p className="text-[10px] text-white">{formatReadableDate(recent ? project.updated_at : project.created_at)} ~ </p>
                            <p className="text-[10px] text-white">
                                {projectSourcesTotal} Source{`${projectSourcesTotal > 1 ? "s" : ""}`}.
                            </p>
                        </div>
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
                        await handleDeleteProject(project.project_id);
                        setIsDeleteConfirmationOpen(false);
                    }}
                    isDeleting={isDeleting}
                />
            }
        </>
    );
};

export default ProjectCard;