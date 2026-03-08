import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { ProjectContext } from '../../contexts/projectContext';
import { MainContext } from '../../contexts/mainContext';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import { formatChatHistoryByDate, formatReadableDate } from '../../utils';
import UnfoldMoreOutlinedIcon from '@mui/icons-material/UnfoldMoreOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import BaseHeading from "../BaseHeading";
import makeApiRequest from '../../api';
import ChangeCircleOutlinedIcon from '@mui/icons-material/ChangeCircleOutlined';
import LoadingSpinner from "../LoadingSpinner";
import { AuthContext } from '../../contexts/authContext';
import useAuth from '../../hooks/useAuth';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import CreateProjectModal from "../CreateProjectModal";
import RippleButton from '../RippleButton';
import AddIcon from '@mui/icons-material/Add';

const ProjectDrawer = ({ onHide, contentPanelContainerRef }) => {

    const navigate = useNavigate();

    const { logout } = useAuth();

    const { user } = useContext(AuthContext);
    const { theme, displayedSources, currentChat } = useContext(MainContext);
    const { currentProject, setCurrentProject, projects, setProjects } = useContext(ProjectContext);

    // Format and group the chats by date using the util
    const grouped = useMemo(() => {
        return formatChatHistoryByDate(projects, {
            dateKey: "updated_at",
            returnAsArray: true,
        });
    }, [projects, JSON.stringify(projects), projects.length]);

    const projectsDropdownRef = useRef(null);
    const [showProjects, setShowProjects] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);

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

    async function exitProjectEndpoint() {
        await makeApiRequest('/exit-project', 'PUT', JSON.stringify({
            sources: {
                checked: displayedSources.filter(item => item.is_checked).map(item => item.source_path),
                unchecked: displayedSources.filter(item => !item.is_checked).map(item => item.source_path),
            },
            chat: currentChat?.sessionId
        }));
    }

    const [wantedProjectId, setWantedProjectId] = useState(null);
    const [isExitPending, setIsExitPending] = useState(false);
    const [isSwitchingPending, setIsSwitchingPending] = useState(false);
    async function handleExitProject() {
        setIsExitPending(true);
        try {
            await exitProjectEndpoint();
            setCurrentProject(null);
        } catch (e) {
            console.log(e.message);
        } finally {
            setIsExitPending(false);
        }
    }

    async function handleSwitchProject(project) {
        try {
            setWantedProjectId(project.project_id);
            setIsSwitchingPending(true);
            await exitProjectEndpoint();
            setCurrentProject(project);
            setShowProjects(false);
            onHide();
            navigate(0);
        } catch (e) {
            console.log(e.message);
        } finally {
            setIsSwitchingPending(false);
        }
    }

    const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
    const { isSettingsModalOpen, setIsSettingsModalOpen } = useContext(ProjectContext);

    function handleToggleSettingsMenu() {
        setIsSettingsMenuOpen((prev) => !prev);
    }

    const settingsMenuRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
                setIsSettingsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    async function log() {
        localStorage.setItem('current_project', null);
        await logout();
    }

    return (
        <div style={{ width: contentPanelContainerRef?.current?.offsetWidth || 0 }} className={`p-4 ${theme === 'light' ? "text-textColor-300 bg-[#f0f0f0]" : "text-textColor-100 bg-textColor-300"} flex-1 flex flex-col gap-3 overflow-hidden`}>
            <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-0 top-40 -z-1 blur-[160px]"></div>
            <div className="w-56 h-56 bg-pink-300 rounded-full absolute left-1/2 top-80 -z-1 blur-[160px]"></div>

            <div className="flex items-center justify-between z-50">
                <h5 className='mb-0 '>Manage Projects</h5>
                <KeyboardDoubleArrowLeftIcon style={{ color: `${theme === 'light' ? '#333' : '#ABAEB4'}` }} className="cursor-pointer " onClick={onHide} />
            </div>

            <div className="flex flex-col flex-1 gap-7 z-10">
                <div>
                    <BaseHeading text="Select Project" className="mb-2" />
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
                                            <div key={project.id} className={`flex items-center justify-between p-2 rounded-md cursor-pointer hover:bg-${theme === 'light' ? 'gray-200' : 'textColor-400'} ${theme === 'light' ? 'hover:bg-textColor-100/10' : 'hover:bg-textColor-300/80'}`} onClick={() => {
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
                    </div>

                    <RippleButton onClick={() => setIsModalOpen(true)} cssClasses="py-2 px-3 rounded-md mt-3">
                        <AddIcon className="text-white" />
                        New project
                    </RippleButton>
                    {/* add new project */}
                    {isModalOpen && <CreateProjectModal
                        show={isModalOpen}
                        onHide={() => setIsModalOpen(false)}
                        setProjects={setProjects}
                        setCurrentProject={setCurrentProject}
                        hideProjectDrawer={onHide}
                    />}
                </div>
                <div>
                    <BaseHeading text="Projects settings" className="mb-2" />
                    <div
                        className={`source-explorer flex items-center justify-center gap-2 px-1 py-1 rounded-md cursor-pointer w-fit hover:bg-red-600/10`}
                        onClick={handleExitProject}
                    >
                        {isExitPending ? <LoadingSpinner isSmall /> : <ChangeCircleOutlinedIcon className="text-red-600" />}
                        <span className={`font-medium text-red-600`}>Exit project</span>
                    </div>
                </div>
            </div>
            {/* Profile dropdown */}
            <div className="z-30 relative" ref={settingsMenuRef}>
                <button
                    onClick={handleToggleSettingsMenu}
                    className={`flex items-center gap-2
                                        px-3 py-1.5
                                        rounded-full
                                        ${theme === 'light' ? 'bg-gray-100/70 hover:bg-gray-200/70' : 'bg-gray-800/70 hover:bg-gray-700/70 '}
                                        transition`}
                >
                    {/* Avatar */}
                    <div className="flex items-center justify-center text-sm font-semibold text-white rounded-full w-7 h-7 bg-gradient-to-br from-indigo-500 to-cyan-400">
                        {user?.firstName[0]?.toUpperCase()}{user?.lastName[0]?.toUpperCase()}
                    </div>

                    {/* Name */}
                    <span className={`text-sm font-medium ${theme === 'light' ? 'text-gray-800' : 'text-white/80'}`}>
                        {user?.firstName} {user?.lastName}
                    </span>

                    {/* Caret */}
                    <svg
                        className={`w-4 h-4 ${theme === 'light' ? 'text-gray-800' : 'text-white/80'} transition-transform ${!isSettingsMenuOpen && "rotate-180"
                            }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>

                {/* Dropdown */}
                {
                    isSettingsMenuOpen && (
                        <div
                            className={`absolute left-0 bottom-full flex flex-col py-1 rounded-md shadow-lg ${theme === "dark" ? "bg-gray-900" : "bg-white"
                                }`}
                        >
                            <div
                                className={`flex  px-3 items-center cursor-pointer gap-2 py-2 pl-1
                 ${theme === "light"
                                        ? "hover:bg-textColor-100/20"
                                        : "text-textColor-100 hover:bg-slate-800/50"
                                    }`}
                                onClick={() => {
                                    setIsSettingsModalOpen(true);
                                    setIsSettingsMenuOpen(false);
                                }}
                            >
                                <SettingsOutlinedIcon
                                    className={`cursor-pointer ${theme === "light" ? "text-[#333]" : "text-[#ABAEB4]"
                                        }`}
                                />
                                <span>Settings</span>
                            </div>

                            {/* <div
                                                    className={`flex  px-3 items-center cursor-pointer gap-2 py-2 pl-1
                                                            ${theme === "light"
                                                            ? "hover:bg-textColor-100/20"
                                                            : "text-textColor-100 hover:bg-slate-800/50"
                                                        }`}
                                                    onClick={handleExitProject}
                                                >
                                                    {isExitPending ? <LoadingSpinner isSmall /> : <CloseOutlinedIcon
                                                        className={`cursor-pointer ${theme === "light" ? "text-[#333]" : "text-[#ABAEB4]"
                                                            }`}
                                                    />}
                                                    <span>Exit project</span>
                                                </div> */}

                            <div
                                className={`flex  px-3 text-red-600 items-center cursor-pointer gap-2 py-2 pl-1
                 ${theme === "light"
                                        ? "hover:bg-textColor-100/20"
                                        : "hover:bg-slate-800/50"
                                    }`}
                                onClick={log}
                            >
                                <LogoutOutlinedIcon
                                    className="cursor-pointer"
                                />
                                <span>Log out</span>
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    );
};

export default ProjectDrawer;