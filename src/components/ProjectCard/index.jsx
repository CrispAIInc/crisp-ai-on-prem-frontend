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

const ProjectNameUpdaterModal = ({ show, onHide, project, setProjects }) => {
    const [newProjectName, setNewProjectName] = useState(project.name);
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [projectThumbnail, setProjectThumbnail] = useState(null);

    const projectThumbnailRef = useRef(null);

    // convert gs thumbnail url to public url
    const { getPublicUrl } = useFirebase();
    useEffect(() => {
        async function convertUrl() {
            const publicUrl = await getPublicUrl(project.thumbnail);
            setImagePreview(publicUrl);
        }

        convertUrl();
    }, [project.thumbnail]);


    function handleThumbnailChange(e) {
        const file = e.target.files[0];
        if (!file) return;
        setProjectThumbnail(file);
        setImagePreview(extractThumbnail(file));
    }

    const handleSave = async () => {
        try {
            setIsLoading(true);
            axiosInstance.defaults.headers.common['ProjectId'] = project.project_id;
            const formData = new FormData();
            formData.append("name", newProjectName);
            if (projectThumbnail) {
                formData.append("project_thumbnail", projectThumbnail);
            }
            const { success, message, project: updatedProject } = await makeApiRequest(`/projects`, 'PUT', formData, { 'Content-type': "multipart/form-data" });

            if (success) {
                setProjects(prev =>
                    prev.map(proj =>
                        proj.project_id === updatedProject.project_id
                            ? {
                                ...proj,
                                name: updatedProject.name,
                                thumbnail: updatedProject.thumbnail,
                                updated_at: new Date(),
                            }
                            : proj
                    )
                );
                onHide();
            }
            else {
                throw new Error(message);
            }
        } catch (error) {
            console.error("Error updating project name:", error.message);
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

            <Modal.Body>
                <div className='flex flex-col items-start justify-center gap-3'>
                    <div className="flex flex-col w-full gap-1">
                        {/* project thumbnail wrapper */}
                        <label className={`block text-sm font-medium`}>
                            Project Thumbnail (optional)
                        </label>
                        <div onClick={() => projectThumbnailRef.current.click()} className="relative flex flex-col items-center justify-center w-full border-2 border-dashed rounded-md cursor-pointer h-36 border-purple-500/40">
                            {imagePreview ? <img src={imagePreview} alt="Thumbnail preview"
                                className="object-cover w-full h-full rounded-md" /> : <FileUploadOutlinedIcon className="!h-16 !w-16 text-purple-500" />}

                            {/* clear preview X icon */}
                            {imagePreview && <DeleteOutlinedIcon onClick={(e) => {
                                e.stopPropagation();
                                setImagePreview(null);
                            }} className="absolute p-1 !text-[23px] text-white rounded-full cursor-pointer bg-purple-500 -top-2 -left-2" />}
                        </div>
                        {/* thumbnail input */}
                        <input accept="image/*" ref={projectThumbnailRef} type="file" className="hidden" onChange={e => handleThumbnailChange(e)} />
                    </div>

                    {/* project name */}
                    <div className="flex flex-col w-full">
                        <label htmlFor="indexName" className={`block text-sm font-medium`}>
                            Project Name
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
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium text-purple-500`}>
                        Update
                    </span>}
                </div>
            </Modal.Footer>
        </Modal>
    );

    // return (
    //     <Modal
    //         show={show}
    //         onHide={onHide}
    //         size="sm"
    //         aria-labelledby="contained-modal-title-vcenter"
    //         scrollable={true}
    //         centered
    //         dialogClassName='text-left'
    //     >

    //         <Modal.Body>
    //             <div className="flex flex-col">
    //                 <label htmlFor="indexName" className={`block text-sm font-medium `}>
    //                     Rename project
    //                 </label>
    //                 <div className="flex items-center gap-1">
    //                     <input
    //                         type="text"
    //                         name="indexName"
    //                         placeholder='New name'
    //                         id='indexName'
    //                         value={newProjectName}
    //                         onChange={(e) => setNewProjectName(e.target.value)}
    //                         className={`flex-1 block w-full p-2 mt-1 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500`}
    //                         required
    //                         onKeyDown={(e) => e.key === 'Enter' && handleSave()}
    //                     />
    //                 </div>
    //             </div>
    //         </Modal.Body>
    //         <Modal.Footer className={`flex items-center gap-3 `}>
    //             <div
    //                 className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit hover:bg-light-hover-100`}
    //                 onClick={onHide}
    //             >
    //                 <span className={`select-none font-medium text-textColor-300`}>
    //                     Cancel
    //                 </span>
    //             </div>

    //             <div
    //                 className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit hover:bg-light-hover-100`}
    //                 onClick={handleSave}
    //             >
    //                 {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium text-textColor-300`}>
    //                     Save
    //                 </span>}
    //             </div>
    //         </Modal.Footer>
    //     </Modal>
    // );
};

const ConfirmationModal = ({ show, onHide, heading, subheading, confirmedFn, isDeleting }) => {
    // const { theme } = useContext(MainContext);

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

            <Modal.Body>
                <div className="flex flex-col items-center justify-center">
                    <ErrorOutlineIcon className="text-red-500 !text-[60px]" />
                    {/* <div className="flex flex-col gap-1"> */}
                    <h2 className="text-2xl font-bold">{heading}</h2>
                    <p className="w-2/3 mx-auto text-center text-md">{subheading}</p>
                    {/* </div> */}
                </div>
            </Modal.Body>
            <Modal.Footer className={`flex items-center gap-2`}>
                <div
                    className={`flex items-center justify-center gap-2 rounded-full cursor-pointer w-fit py-2 px-3 bg-textColor-100/10`}
                    onClick={onHide}
                >
                    <span className={`select-none font-medium text-textColor-300`}>
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
                </div>
            </Modal.Footer>
        </Modal>
    );
};

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
        <div style={{ background: project.thumbnail ? `url('${projectThumbnail}')` : 'url("/app-logo.svg")' }} className={`!bg-cover !bg-center relative   rounded-2xl p-3 w-80 h-48 bg-clip-border `}>
            {/* top to bottom gradient overlay */}
            <div className="absolute inset-0 shadow-md bg-gradient-to-tr from-indigo-500/30 via-transparent to-cyan-400/20 rounded-2xl"></div>

            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-600/40 rounded-2xl " />

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
                    <ArrowForwardIosIcon onClick={() => setCurrentProject(project)} className="cursor-pointer text-textColor-200" />
                </div>
                {/* bottom showcase */}
                <div className="font-semibold">
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