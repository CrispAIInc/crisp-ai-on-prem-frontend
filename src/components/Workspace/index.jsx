import { useContext, useState } from "react";
import { MainContext } from "../../contexts/mainContext";
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';

import NoData from "../NoData";

import './workspace.css';

import CenterPanel from "../CenterPanel";
import CopilotSection from '../CopilotSection';
import { useResizableSidebar } from '../../hooks/useResizableSidebar';
import { Drawer } from '@mui/material';
import ReelProps from '../ReelProps';

const Workspace = () => {

    const {
        workspaceContainer,
        activeView,
        theme,
        displayedSources,
        setIsLeftSidebarOpen,
        setIsRightSidebarOpen,
        isRightSidebarOpen,
        isLeftSidebarOpen,
        chatLoaded,
        setChatLoaded

    } = useContext(MainContext);

    const { sidebarWidth } = useResizableSidebar(200, false);

    const [combinedSummary, setCombinedSummary] = useState("");
    const [isCombinedSummaryPending, setIsCombinedSummaryPending] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState("en"); // chat default language

    return (
        <main className={`relative flex-1 h-full px-10 overflow-y-auto overflow-x-hidden media-container bg-background_workspace ${theme === 'dark' ? 'bg-gradient-to-b from-gray-900 to-black text-white' : 'bg-gradient-to-b from-slate-100 to-background_workspace'}`} ref={workspaceContainer}>
            <h5 className={`select-none text-center ${theme === "light" ? "!border-b !border-b-textColor-100/50 text-textColor-200" : "text-textColor-100 !border-b !border-b-textColor-300"
                } py-[10px]`}>Interaction</h5>
            <div className="w-56 h-56 bg-blue-500 rounded-full absolute left-3/2 top-10 -z-10 blur-[160px]"></div>
            <div className="w-56 h-56 bg-purple-500 rounded-full absolute left-35 top-40 -z-10 blur-[160px]"></div>
            <div className="w-56 h-56 bg-pink-400 rounded-full absolute left-1/2 top-80 -z-10 blur-[160px]"></div>
            {/* logo */}
            <section className="flex items-center justify-center gap-1 mt-3">
                <img src="/app-logo.svg" alt="logo" className="w-16 h-16" width="64" height="46" />
                <p className={`font-sans font-extrabold text-3xl text-center user-select-none ${theme === 'dark' ? 'text-textColor-100' : 'text-textColor-300'}`}>Crisp AI</p>
            </section>

            <div
                className={`px-2 py-2 rounded-md w-fit absolute left-0 h-auto top-1/2 flex flex-col justify-center items-center`}
            >
                <SwapHorizOutlinedIcon className={`cursor-pointer ${theme === 'dark' && 'text-textColor-100'}`} onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
            </div>
            {(activeView === 'resource' || displayedSources?.length > 0) ? (
                <CenterPanel combinedSummary={combinedSummary} setCombinedSummary={setCombinedSummary} isCombinedSummaryPending={isCombinedSummaryPending} setIsCombinedSummaryPending={setIsCombinedSummaryPending} />
            ) : !activeView ? (
                <div className="mt-10">
                    <NoData />
                </div>
            ) : null}

            <div className={`mt-3 overflow-y-hidden h-[700px]`}>
                <CopilotSection selectedLanguage={selectedLanguage} setSelectedLanguage={setSelectedLanguage} setIsCombinedSummaryPending={setIsCombinedSummaryPending} combinedSummary={combinedSummary} setCombinedSummary={setCombinedSummary} chatLoaded={chatLoaded} setChatLoaded={setChatLoaded} sidebarWidth={sidebarWidth} key={0} name="genInsights" />
            </div>

            {/* right sidebar collapser */}
            <div
                className={`px-2 py-2 rounded-md w-fit absolute right-0 h-auto top-1/2 flex flex-col justify-center items-center`}
            >
                <SwapHorizOutlinedIcon className={`cursor-pointer ${theme === 'dark' && 'text-textColor-100'}`} onClick={() => { setIsRightSidebarOpen(!isRightSidebarOpen); }} />
            </div>

            {/* <Drawer anchor="right" open={true}>
                <ReelProps />
            </Drawer> */}
        </main>
    );
};

export default Workspace;
