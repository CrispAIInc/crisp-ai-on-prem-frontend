import React, { useContext } from 'react';
import { ProjectContext } from '../../contexts/projectContext';
import { MainContext } from '../../contexts/mainContext';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';

const ProjectDrawer = ({ onHide, contentPanelContainerRef }) => {

    const { theme } = useContext(MainContext);
    const { currentProject, projects } = useContext(ProjectContext);

    function closeProjectDrawer() {
        onHide();
    }

    return (
        <div style={{ width: contentPanelContainerRef?.current?.offsetWidth || 0 }} className={`z-50 p-4 ${theme === 'light' ? "text-textColor-300 bg-[#f0f0f0]" : "text-textColor-100 bg-textColor-300"} flex-1 flex flex-col gap-3 overflow-hidden`}>
            <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-0 top-40 -z-1 blur-[160px]"></div>
            <div className="w-56 h-56 bg-pink-300 rounded-full absolute left-1/2 top-80 -z-1 blur-[160px]"></div>

            <div className="flex items-center justify-between">
                <h5 className='mb-0 '>Manage Projects</h5>
                <KeyboardDoubleArrowLeftIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} className="cursor-pointer " onClick={onHide} />
            </div>
        </div>
    );
};

export default ProjectDrawer;