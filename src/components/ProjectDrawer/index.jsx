import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ProjectContext } from '../../contexts/projectContext';
import { MainContext } from '../../contexts/mainContext';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { formatChatHistoryByDate, formatReadableDate } from '../../utils';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';

const ProjectDrawer = ({ onHide, contentPanelContainerRef }) => {

    const { theme } = useContext(MainContext);
    const { currentProject, projects } = useContext(ProjectContext);

    // Format and group the chats by date using the util
    const grouped = useMemo(() => {
        return formatChatHistoryByDate(projects, {
            dateKey: "updated_at",
            returnAsArray: true,
        });
    }, [projects, JSON.stringify(projects), projects.length]);

    const projectsDropdownRef = useRef(null);
    const [showProjects, setShowProjects] = useState(false);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (projectsDropdownRef.current && !projectsDropdownRef.current.contains(event.target)) {
                setShowProjects(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div style={{ width: contentPanelContainerRef?.current?.offsetWidth || 0 }} className={`z-50 p-4 ${theme === 'light' ? "text-textColor-300 bg-[#f0f0f0]" : "text-textColor-100 bg-textColor-300"} flex-1 flex flex-col gap-3 overflow-hidden`}>
            <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-0 top-40 -z-1 blur-[160px]"></div>
            <div className="w-56 h-56 bg-pink-300 rounded-full absolute left-1/2 top-80 -z-1 blur-[160px]"></div>

            <div className="flex items-center justify-between">
                <h5 className='mb-0 '>Manage Projects</h5>
                <KeyboardDoubleArrowLeftIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} className="cursor-pointer " onClick={onHide} />
            </div>

            {/* switch project */}
            <div className="relative">
                {/* dropdown header */}
                <div className={`cursor-pointer flex items-center shadow-sm gap-10 px-3 py-2 rounded-md justify-between ${theme === 'light' ? '!border !border-textColor-100/20' : '!border !border-zinc-600'}`}
                    onClick={() => setShowProjects(!showProjects)}>
                    <p>{currentProject?.name || "Untitled Project"}</p>
                    <UnfoldMoreOutlinedIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} />
                </div>

                {/* List of projects dropdown */}
                {showProjects && <div ref={projectsDropdownRef} className={`absolute top-full left-0 w-full h-[40vh] z-50 flex flex-col flex-1 px-3 py-0 gap-3 overflow-y-auto shadow-sm bg-background_workspace`}>
                    {grouped.map(group => (
                        <div key={group.key} className="">
                            <div className={`sticky top-0 px-1 py-1 z-10 ${theme === 'light' ? 'bg-gray-100' : 'bg-textColor-300'} `}>
                                <h6 className="text-xs font-semibold text-gradient-x  mb-0">{group.label} {group.items.length > 0 && <span className="text-xs text-textColor-400">({group.items.length})</span>}</h6>
                            </div>

                            {group.items.length === 0 ? (
                                <div className="px-2 text-xs text-textColor-400">No project</div>
                            ) : (
                                group.items.map(project => (
                                    <div key={project.id} className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-${theme === 'light' ? 'gray-200' : 'textColor-400'} ${theme === 'light' ? 'hover:bg-textColor-100/10' : 'hover:bg-textColor-300/80'}`} onClick={() => console.log("hello")}>
                                        <div>
                                            <div className="text-sm font-semibold">{project.name || "Untitled Project"}</div>
                                            <div className="text-xs">Last updated: {formatReadableDate(project.updated_at)}</div>
                                        </div>
                                        {
                                            currentProject?.project_id === project.project_id && (
                                                <CheckOutlinedIcon />
                                            )
                                        }
                                    </div>
                                ))
                            )}
                        </div>
                    ))
                    }
                </div >}
            </div >
        </div >
    );
};

export default ProjectDrawer;