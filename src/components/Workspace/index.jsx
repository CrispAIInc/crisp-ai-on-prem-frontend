import { useContext } from "react";
import { MainContext } from "../../contexts/mainContext";
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';

import NoData from "../NoData";
import NoteDetails from "../NoteDetails";

import './workspace.css';
import StoryDetails from '../StoryDetails';

import MetadataPanel from '../MetadataPanel';

const Workspace = () => {
    const {

        activeView,
        theme,
        setIsLeftSidebarOpen,
        setIsRightSidebarOpen,
        isRightSidebarOpen,
        isLeftSidebarOpen,

    } = useContext(MainContext);
    return (
        <div className={`relative flex-1 h-full px-10 overflow-y-auto media-container bg-background_workspace`}>
            {/* logo */}
            <div className="flex items-center justify-center gap-1 mt-3">
                <img src="/app-logo.svg" alt="logo" className="w-12 h-12" />
                <p className={`font-sans font-extrabold text-4xl text-center user-select-none ${theme === 'dark' ? 'text-textColor-100' : 'text-textColor-300'}`}>Crisp AI</p>
            </div>

            <div
                className={`px-2 py-2 rounded-md w-fit absolute left-0 h-full flex flex-col justify-center items-center top-0 z-50`}
            >
                <SwapHorizOutlinedIcon className={`cursor-pointer ${theme === 'dark' && 'text-textColor-100'}`} onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
            </div>
            {!activeView ? (
                <div className="mt-10">
                    <NoData />
                </div>
            ) : activeView === 'resource' ? (
                <MetadataPanel />
            ) : activeView === 'note' ? (
                <NoteDetails />
            ) : activeView === 'story' ? (
                <StoryDetails />
            ) : null}

            {/* right sidebar collapser */}
            <div
                className={`px-2 py-2 rounded-md w-fit absolute right-0 h-full flex flex-col justify-center items-center top-0 z-50`}
            >
                <SwapHorizOutlinedIcon className={`cursor-pointer ${theme === 'dark' && 'text-textColor-100'}`} onClick={() => { setIsRightSidebarOpen(!isRightSidebarOpen); }} />
            </div>
        </div>
    );
};

export default Workspace;
