import { useContext, useEffect, useState } from 'react';
import useFirebase from '../../../hooks/useFirebase';
import ActionMenu from '../../ActionMenu';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LoadingSpinner from '../../LoadingSpinner';
import ProjectNameUpdaterModal from '../../ProjectNameUpdatedModal';
import ConfirmationModal from '../../ConfirmationModal';
import { ProjectContext } from '../../../contexts/projectContext';
import useProject from '../../../hooks/useProject';
import { formatReadableDate } from '../../../utils';

export default function ProjectRow({ project, recent }) {

    // Context APIs
    const { setProjects, setCurrentProject } = useContext(ProjectContext);

    // Custom Hooks
    const { getPublicUrl } = useFirebase();
    const { deleteProject } = useProject();

    const [publicThumbnailUrl, setPublicThumbnailUrl] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);

    // convert project thumbnail to public url
    useEffect(() => {
        async function convert() {
            let publicUrl = await getPublicUrl(project.thumbnail);
            setPublicThumbnailUrl(publicUrl);
        }

        convert();
    }, [project, getPublicUrl]);

    // delete project
    async function handleDeleteProject(id) {
        setIsDeleting(true);
        try {
            deleteProject(id);
            setIsDeleteConfirmationOpen(false);
        } catch (error) {
            console.log(error);
        } finally {
            setIsDeleting(false);
        }
    }

    const projectSourcesTotal = project?.checked_sources?.length + project?.unchecked_sources?.length;

    return (
        <>
            <tr
                className="transition border-b cursor-pointer border-textColor-100/50 hover:bg-textColor-100/20"
                onClick={() => {
                    const now = new Date();
                    setCurrentProject({ ...project, updated_at: now }); setProjects(prev => {
                        if (prev?.project_id === project.project_id) {
                            return {
                                ...prev,
                                updated_at: now
                            };
                        } return prev;
                    });
                }}
            >
                {/* Actions */}
                <td className="px-4 py-2">
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
                </td>

                {/* Title and Thumbnail */}
                <td className="px-4 py-2">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 overflow-hidden border rounded-full">
                            <img src={publicThumbnailUrl} alt={project.name} className='object-cover w-full h-full' />
                        </div>

                        <div>
                            <p className="font-medium">{project.name}</p>

                            {/* Mobile meta */}
                            <div className="flex gap-3 mt-1 text-xs md:hidden text-muted-foreground">
                                {/* <span>{project.sources} Sources</span> */}
                                <span>{recent ? formatReadableDate(project.updated_at) : formatReadableDate(project.created_at)}</span>
                            </div>
                        </div>
                    </div>
                </td>

                {/* Sources */}
                <td className="hidden px-4 py-2 text-sm md:table-cell">
                    {projectSourcesTotal} Source{`${projectSourcesTotal > 1 && "s"}`}.
                </td>

                {/* Created */}
                <td className="hidden px-4 py-2 text-sm md:table-cell">
                    {recent ? formatReadableDate(project.updated_at) : formatReadableDate(project.created_at)}
                </td>
            </tr>

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
                    confirmedFn={() => handleDeleteProject(project.project_id)}
                    isDeleting={isDeleting}
                />
            }
        </>
    );

}