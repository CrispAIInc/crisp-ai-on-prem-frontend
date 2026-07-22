import { useRef, useState } from 'react';
import makeApiRequest from '../../api';
import { extractThumbnail } from '../../utils';
import Modal from 'react-bootstrap/Modal';
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import LoadingSpinner from '../LoadingSpinner';

import { useToast } from "../../contexts/toastContext";

const CreateProjectModal = ({ show, onHide, setProjects, setCurrentProject, hideProjectDrawer, theme }) => {

    const { notify } = useToast();

    const [newProjectName, setNewProjectName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [projectThumbnail, setProjectThumbnail] = useState(null);
    const isCreateDisabled = !newProjectName.trim();

    const projectThumbnailRef = useRef(null);

    const handleSave = async () => {
        try {
            if (newProjectName === "") {
                throw new Error("Project name is required");
            }
            setIsLoading(true);
            const formData = new FormData();
            formData.append("name", newProjectName);
            formData.append("project_thumbnail", projectThumbnail);
            const { success, message, project } = await makeApiRequest(`/projects`, 'POST', formData, { 'Content-type': "multipart/form-data" });
            if (success) {
                notify({
                    variant: "success",
                    heading: "Project created successfully."
                });
                hideProjectDrawer?.();
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
            notify({
                variant: "error",
                heading: "Something went wrong.",
                subheading: error?.message,
            });
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
                <div className={`flex flex-col items-start justify-center gap-3`}>
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
                                className={`flex-1 block w-full p-2 mt-1 border border-gray-300 rounded-md outline-none`}
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

                {/* <div
                    className={`flex items-center justify-center gap-2 rounded-md cursor-pointer w-fit hover:bg-light-hover-100`}
                    onClick={handleSave}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className={`select-none font-medium text-purple-500`}>
                        Create
                    </span>}
                </div> */}
                <button
                    type="button"
                    disabled={isCreateDisabled || isLoading}
                    onClick={handleSave}
                    className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 transition duration-150 ${isCreateDisabled || isLoading ? (theme === 'light' ? 'bg-gray-200 text-gray-400/50' : 'bg-textColor-100/25 text-gray-700') : 'bg-[linear-gradient(90deg,#755bea,#b76894)] text-white hover:opacity-90'} ${theme === 'dark' && !isCreateDisabled && !isLoading ? '' : ''} ${isCreateDisabled || isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className="font-medium">Create</span>}
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateProjectModal;