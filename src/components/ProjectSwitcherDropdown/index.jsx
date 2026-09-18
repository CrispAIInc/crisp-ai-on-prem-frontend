import {
    Check,
    ChevronDown,
    FolderOpenDot
} from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext';
import { ProjectContext } from '../../contexts/projectContext';
import { formatChatHistoryByDate, formatReadableDate } from '../../utils';
import LoadingSpinner from '../LoadingSpinner';

function ProjectSwitcherDropdown() {

    const navigate = useNavigate();
    const {
        currentProject,
        projects,
        setCurrentProject
    } = useContext(ProjectContext);
    const {
        currentChat,
        knowledgeBase
    } = useContext(MainContext);
    const [showProjects, setShowProjects] = useState(false);

    const projectsDropdownRef = useRef(null);

    useEffect(() => {
        if (!showProjects) return;

        function handlePointerDown(e) {
            if (projectsDropdownRef.current && !projectsDropdownRef.current.contains(e.target)) {
                setShowProjects(false);
            }
        }
        function handleKeyDown(e) {
            if (e.key === "Escape") setShowProjects(false);
        }

        document.addEventListener("mousedown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showProjects]);

    // useEffect(() => {
    //     const handleClickOutside = (event) => {
    //         if (projectsDropdownRef.current && !projectsDropdownRef.current.contains(event.target)) {
    //             setShowProjects(false);
    //         }
    //     };

    //     document.addEventListener("mousedown", handleClickOutside);
    //     return () => {
    //         document.removeEventListener("mousedown", handleClickOutside);
    //     };
    // }, []);
    const [wantedProjectId, setWantedProjectId] = useState(null);
    const [isSwitchingPending, setIsSwitchingPending] = useState(false);

    async function exitProjectEndpoint() {
        await makeApiRequest('/exit-project', 'PUT', JSON.stringify({
            sources: {
                checked: knowledgeBase.filter(item => item.is_checked).map(item => item.source_path),
                unchecked: knowledgeBase.filter(item => !item.is_checked).map(item => item.source_path),
            },
            chat: currentChat?.sessionId
        }));
    }

    // Format and group the chats by date using the util
    const grouped = useMemo(() => {
        return formatChatHistoryByDate(projects, {
            dateKey: "updated_at",
            returnAsArray: true,
        });
    }, [projects, JSON.stringify(projects)]);

    async function handleSwitchProject(project) {
        try {
            setWantedProjectId(project.project_id);
            setIsSwitchingPending(true);
            await exitProjectEndpoint();
            setCurrentProject(project);
            setShowProjects(false);
            navigate(0);
        } catch (e) {
            console.log(e.message);
        } finally {
            setIsSwitchingPending(false);
        }
    }

    return (
        <div className="relative select-none" ref={projectsDropdownRef}>
            {/* dropdown header */}
            <div className={`cursor-pointer flex items-center w-56 shadow-sm gap-10 px-2 py-2 rounded-lg justify-between border border-textColor-100/20`}
                onClick={() => setShowProjects(!showProjects)}>
                <div className="flex items-center gap-1">
                    <FolderOpenDot size={16} />
                    <p>{currentProject?.name || "Untitled Project"}</p>
                </div>
                <ChevronDown size={16} className={`transition-transform ${showProjects && 'rotate-180'}`} />
            </div>

            {/* List of projects dropdown */}
            {showProjects && <div className={`absolute top-full left-0 w-full h-[40vh] z-50 flex flex-col flex-1 px-3 py-0 gap-3 overflow-y-auto shadow-sm bg-background_workspace`}>
                {grouped.map(group => (
                    <div key={group.key} className="">
                        <div className={`sticky top-0 px-1 py-1 z-10 bg-gray-100`}>
                            <h6 className="text-xs font-semibold text-gradient-x  mb-0">{group.label} {group.items.length > 0 && <span className="text-xs text-textColor-400">({group.items.length})</span>}</h6>
                        </div>

                        {group.items.length === 0 ? (
                            <div className="px-2 text-xs text-textColor-400">No project</div>
                        ) : (
                            group.items.map(project => (
                                <div key={project.id} className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-gray-200 hover:bg-textColor-100/10`} onClick={() => {
                                    handleSwitchProject(project);
                                }}>
                                    <div>
                                        <div className="text-sm font-semibold">{project.name || "Untitled Project"}</div>
                                        <div className="text-xs">Last updated: {formatReadableDate(project.updated_at)}</div>
                                    </div>
                                    {
                                        isSwitchingPending && wantedProjectId === project.project_id ? <LoadingSpinner isSmall /> : null
                                    }
                                    {
                                        currentProject?.project_id === project.project_id && (
                                            <Check size={16} />
                                        )
                                    }
                                </div>
                            ))
                        )}
                    </div>
                ))
                }
            </div >}
        </div>
    );
}

export default ProjectSwitcherDropdown;