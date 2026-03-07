import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import { useEffect, useRef, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import makeApiRequest, { axiosInstance } from '../../api';
import useFirebase from '../../hooks/useFirebase';
import { extractThumbnail } from '../../utils';
import LoadingSpinner from '../LoadingSpinner';

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
                            ? updatedProject
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
};

export default ProjectNameUpdaterModal;