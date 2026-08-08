import { useState } from 'react';
import makeApiRequest from '../../api';
import Modal from 'react-bootstrap/Modal';
import AddIcon from '@mui/icons-material/Add';
import LoadingSpinner from '../LoadingSpinner';

import { useToast } from "../../contexts/toastContext";

const CreateProjectModal = ({ show, onHide, setProjects, setCurrentProject, hideProjectDrawer, theme }) => {

    const { notify } = useToast();

    const [newProjectName, setNewProjectName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [projectThumbnail] = useState(null);
    const isCreateDisabled = !newProjectName.trim();

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
                <div className="flex flex-col items-start justify-center gap-4">
                    <div className="flex flex-col w-full gap-2">
                        <div className="flex items-center gap-2">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-300 bg-gray-50">
                                <AddIcon className="!h-5 !w-5 text-textColor-300" />
                            </div>
                            <div>
                                <h3 className="text-base font-semibold text-textColor-300">Create a new project</h3>
                                <p className="text-sm text-textColor-200">
                                    Give your workspace a clear name and start organizing your work with structure.
                                </p>
                            </div>
                        </div>

                        <div className="w-full rounded-lg border border-gray-200 bg-gray-50/70 p-3">
                            <div className="flex items-start gap-2">
                                <div className="mt-1 h-2.5 w-2.5 p-1.5 rounded-full bg-primary-300" />
                                <div className="flex flex-col gap-1">
                                    <span className="text-sm font-medium text-textColor-300">What happens next</span>
                                    <p className="text-sm text-textColor-200">
                                        Your project becomes a focused workspace for sources, interactions, and content in one place.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col w-full gap-2">
                        <label htmlFor="indexName" className="block text-sm font-semibold text-textColor-300">
                            Project Name
                        </label>
                        <input
                            type="text"
                            name="indexName"
                            placeholder="Project name"
                            id="indexName"
                            value={newProjectName}
                            onChange={(e) => setNewProjectName(e.target.value)}
                            className="flex-1 block w-full rounded-md border border-gray-300 bg-white text-sm outline-none transition focus:border-gray-400 p-2"
                            required
                            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                        />
                        <p className="text-xs text-primary-200">
                            Choose a descriptive name so it is easy to find later.
                        </p>
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer className="flex items-center justify-between gap-3">
                <div
                    className="flex items-center justify-center gap-2 rounded-md cursor-pointer px-2 py-1 hover:bg-light-hover-100"
                    onClick={onHide}
                >
                    <span className="select-none font-medium text-textColor-300">
                        Cancel
                    </span>
                </div>

                <button
                    type="button"
                    disabled={isCreateDisabled || isLoading}
                    onClick={handleSave}
                    className={`flex items-center justify-center gap-2 rounded-md px-4 py-2 transition duration-150 ${isCreateDisabled || isLoading ? (theme === 'light' ? 'bg-gray-200 text-gray-400/50' : 'bg-textColor-100/25 text-gray-700') : 'bg-[linear-gradient(90deg,#755bea,#b76894)] text-white hover:opacity-90'} ${isCreateDisabled || isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    {isLoading ? <LoadingSpinner isSmall /> : <span className="font-medium">Create project</span>}
                </button>
            </Modal.Footer>
        </Modal>
    );
};

export default CreateProjectModal;