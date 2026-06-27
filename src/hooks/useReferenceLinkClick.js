import { useContext } from 'react';
import { MainContext } from "../contexts/mainContext.jsx";
import { useResizableSidebar } from './useResizableSidebar';
import { useToast } from "../contexts/toastContext.jsx";
import { delay } from '../utils.js';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
export default function useReferenceLinkClick(isFromChat = false, contentPanelContainerRef) {

    const { sidebarWidth: leftWidth, handleMouseDown: handleLeftMouseDown, handleDoubleClick, setSidebarWidth, maxWidth } = useResizableSidebar(200, true);

    const {
        setCurrentResource,
        setFromChat,
        setResourceURL,
        setSummary,
        setJumpToPage,
        setShowMetadata,
        setSummaries,
        knowledgeBase,
        setActiveView,
        workspaceContainer,
    } = useContext(MainContext);

    const {
        notify
    } = useToast();

    const handleVideoLinkClick = (video) => {
        setFromChat(isFromChat);
        const resourceURL = `${API_ENDPOINT}/${video.file_type
            }/all/${encodeURIComponent(video.source_path)}`;
        setCurrentResource({ ...video });
        setResourceURL(resourceURL);
        setSummary(video.summary);
        setSummaries(video.topic_summaries);
        setActiveView('resource');
        // setSidebarWidth(prev => {
        //     if (prev !== maxWidth) return maxWidth;
        //     return window.innerWidth / 3.5;
        // });
        // setIsLeftSidebarOpen(true);
        workspaceContainer.current.scrollTo({
            top: 0,
            behavior: "smooth",
        });
        setShowMetadata(true);
        // setShowNoteDetails(false);
    };

    const handlePDFLinkClick = async (pdf) => {
        const resourceURL = `${API_ENDPOINT}/${pdf.file_type
            }/all/${encodeURIComponent(pdf.source_path)}`;
        setCurrentResource({ ...pdf });
        console.log(pdf);
        setResourceURL(resourceURL);
        setSummary(pdf.summary);
        setSummaries(pdf.topic_summaries);
        setActiveView('resource');

        // setSidebarWidth(prev => {
        //     if (prev !== maxWidth) return maxWidth;
        //     return window.innerWidth / 3.5;
        // });
        // setIsLeftSidebarOpen(true);
        workspaceContainer.current.scrollTo({
            top: 0,
            behavior: "smooth",
        });
        setShowMetadata(true);
        // set a little delay
        // await delay(3000);
        setJumpToPage({ page: parseInt(pdf?.page) });
        // setShowNoteDetails(false);
    };

    const handleSourceLinkClick = (event, source) => {
        if (!source) return;
        console.log(source);

        const sourceExist = knowledgeBase.find(item => item.source_path === source?.source_path);

        if (!sourceExist) {
            notify({
                variant: 'info',
                heading: 'The source may have been deleted',
            });
            return;
        }

        if (event) event.preventDefault();

        if (source.file_type === "video") handleVideoLinkClick(source);
        else handlePDFLinkClick(source);
    };

    return {
        handleVideoLinkClick,
        handlePDFLinkClick,
        handleSourceLinkClick
    };
}