import { useContext } from 'react';
import { ProjectContext } from '../contexts/projectContext';
import makeApiRequest, { axiosInstance } from '../api';

export default function useProject() {
    const { setProjects } = useContext(ProjectContext);

    // delete project
    async function deleteProject(id) {
        try {
            axiosInstance.defaults.headers.common['ProjectId'] = id;
            const { message, success } = await makeApiRequest('/projects', "DELETE");
            if (success) {
                setProjects((prevProjects) => prevProjects.filter((proj) => proj.project_id !== id));
            } else {
                throw new Error(message);
            }
        } catch (e) {
            throw new Error(e.message);
        }
    }

    return {
        deleteProject
    };
}