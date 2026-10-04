import {
    Check,
    ChevronDown,
    FolderOpenDot,
    Plus
} from "lucide-react";
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import makeApiRequest from '../../api';
import { MainContext } from '../../contexts/mainContext';
import { ProjectContext } from '../../contexts/projectContext';
import { formatChatHistoryByDate, formatReadableDate } from '../../utils';
import LoadingSpinner from '../LoadingSpinner';
import CreateProjectModal from '../CreateProjectModal';
import RippleButton from '../RippleButton';

function ProjectSwitcherDropdown() {

    const navigate = useNavigate();
    const {
        currentProject,
        projects,
        setCurrentProject,
        setProjects,
    } = useContext(ProjectContext);
    const {
        currentChat,
        knowledgeBase
    } = useContext(MainContext);


    const [showProjects, setShowProjects] = useState(false);
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);

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
            <div className={`cursor-pointer flex items-center w-56 shadow-sm overflow-x-hidden gap-10 px-2 py-2 rounded-lg justify-between border border-textColor-100/20`}
                onClick={() => setShowProjects(!showProjects)}>
                <div className="flex-1 w-full flex items-center gap-2">
                    <FolderOpenDot size={16} />
                    <p className="truncate">{currentProject?.name || "Untitled Project"}</p>
                </div>
                <ChevronDown size={16} className={`transition-transform ${showProjects && 'rotate-180'}`} />
            </div>

            {isNewProjectModalOpen && <CreateProjectModal
                show={isNewProjectModalOpen}
                onHide={() => setIsNewProjectModalOpen(false)}
            />}

            {/* List of projects dropdown */}
            {showProjects && <div className={`absolute top-full left-0 w-full rounded-lg h-[30vh] z-50 flex flex-col flex-1 py-0 overflow-y-auto shadow-md bg-background_workspace p-1 mt-1`}>
                <button
                    // className="flex items-center justify-center px-1 py-2 bg-red-400 text-white font-semibold text-center text-xs m-1 rounded-md"
                    className={`select-none py-1.5 px-2 text-white text-sm rounded-lg bg-gradient-to-br from-primary-200 to-primary-300 transition duration-300 flex items-center justify-center w-full`}
                    onClick={() => setIsNewProjectModalOpen(true)}
                >
                    <Plus size={16} />
                    <span className="text-xs">New project</span>
                </button>
                {grouped.map(group => (
                    <div key={group.key} className="mb-2">
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