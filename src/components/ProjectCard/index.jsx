import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import { useContext, useEffect, useMemo, useState } from 'react';
import AnimatedText from "../AnimatedText";
import useFirebase from '../../hooks/useFirebase';
import { formatReadableDate } from '../../utils';
import ActionMenu from '../ActionMenu';
import ConfirmationModal from '../ConfirmationModal';
import LoadingSpinner from '../LoadingSpinner';
import ProjectNameUpdaterModal from "../ProjectNameUpdatedModal";
import useProject from '../../hooks/useProject';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { AuthContext } from '../../contexts/authContext';
import Modal from 'react-bootstrap/Modal';

import { Sparkles } from "lucide-react";

const PROJECT_OWNER_ID = "uCWw2cICQzb2qyqWkwSPqPTzBkV2";

const ProjectCard = ({ recent = false, project, setProjects, setCurrentProject }) => {

    const { user: { userId } } = useContext(AuthContext);

    const { deleteProject } = useProject();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
    const [isExampleDisclaimerOpen, setIsExampleDisclaimerOpen] = useState(false);
    const [projectThumbnail, setProjectThumbnail] = useState(null);

    const isExampleProject = project?.is_shared && userId !== PROJECT_OWNER_ID;

    const enterProject = () => {
        const now = new Date();
        setCurrentProject({ ...project, updated_at: now }); setProjects(prev => {
            if (prev?.project_id === project.project_id) {
                return {
                    ...prev,
                    updated_at: now
                };
            } return prev;
        });
    };

    const handleProjectClick = () => {
        if (isExampleProject) {
            setIsExampleDisclaimerOpen(true);
            return;
        }
        enterProject();
    };

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
            <div
                style={{
                    backgroundImage: project.thumbnail
                        ? `url('${projectThumbnail}')`
                        : 'url("/new-crisp-logo-resized.png")',
                    backgroundSize: project.thumbnail ? 'cover' : '185px auto',
                }}
                className={`bg-no-repeat bg-center relative rounded-2xl p-3 min-w-80 h-48 cursor-pointer ${project?.is_shared && 'animate-glow-multiple'
                    }`}
                onClick={handleProjectClick}
            >
                {/* delete overlap */}
                {isDeleting && <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full bg-white/80">
                    <AnimatedText text='Deleting...' cssClasses='!text-lg !text-black' />
                </div>}

                {/* top to bottom gradient overlay */}
                <div className="absolute inset-0 shadow-md bg-gradient-to-b from-transparent to-black/70 rounded-2xl"></div>

                <div className="relative z-40 flex flex-col justify-between h-full ">
                    {/* top showcase */}
                    <div className="flex items-center justify-between ">
                        {(project?.is_shared && userId !== PROJECT_OWNER_ID) ? (
                            <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-md text-black/70 font-semibolt">
                                <AutoAwesomeOutlinedIcon className="text-purple-600" />
                                <p className="font-bold text-gradient-x">Example Project</p>
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
                                    <ArrowForwardIosIcon onClick={handleProjectClick} className="font-bold text-purple-500 cursor-pointer backdrop-blur" />
                                </div>
                            </>
                        )}
                    </div>
                    {/* bottom showcase */}
                    <div className="font-semibold">
                        <h2 className="mb-0 !text-white line-clamp-2 text-lg font-semibold tracking-wide">{project.name}</h2>
                        <div className="flex flex-wrap items-center gap-1">
                            <p className="text-[10px] text-white">{formatReadableDate(recent ? project.updated_at : project.created_at)} </p>
                            {
                                (typeof projectSourcesTotal === "number" && !Number.isNaN(projectSourcesTotal)) && (
                                    <p className="text-[10px] text-white">
                                        ~ {projectSourcesTotal} Source{`${projectSourcesTotal > 1 ? "s" : ""}`}.
                                    </p>
                                )
                            }
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
            {isExampleDisclaimerOpen && <Modal
                show={isExampleDisclaimerOpen}
                onHide={() => setIsExampleDisclaimerOpen(false)}
                size="md"
                centered
                aria-labelledby="example-project-disclaimer-title"
            >
                <Modal.Body>
                    <div className="flex flex-col gap-3 text-textColor-300">
                        <div className="flex items-center gap-2">
                            <Sparkles size={18} />
                            <h2 id="example-project-disclaimer-title" className="mb-0 text-xl font-semibold">Example Project</h2>
                        </div>
                        <p className="mb-0 text-sm">
                            This project is provided as an example. It is read-only and cannot be edited.
                        </p>
                    </div>
                </Modal.Body>
                <Modal.Footer className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setIsExampleDisclaimerOpen(false)}
                        className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-textColor-300 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setIsExampleDisclaimerOpen(false);
                            enterProject();
                        }}
                        className="rounded-md bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700"
                    >
                        Continue
                    </button>
                </Modal.Footer>
            </Modal>}
        </>
    );
};

export default ProjectCard;