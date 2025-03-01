import { useContext } from 'react';
import { MainContext } from '../contexts/mainContext';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
export default function useReferenceLinkClick(isFromChat = false) {

    const {
        setCurrentResource, setFromChat,
        setResourceURL,
        setSummary,
        setJumpToPage,
        setSummaries,
        workspaceContainer,
        setActiveView
    } = useContext(MainContext);

    const handleVideoLinkClick = (event, video) => {
        event.preventDefault();
        setFromChat(isFromChat);
        const resourceURL = `${API_ENDPOINT}/${video.file_type
            }/all/${encodeURIComponent(video.source_path)}`;
        setCurrentResource({ ...video });
        setResourceURL(resourceURL);
        setSummary(video.summary);
        setSummaries(video.topic_summaries);
        setActiveView(prev => [...prev, 'resource']);
        workspaceContainer.current.scrollTo({
            top: 0,
            behavior: "smooth", // Enables smooth scrolling
        });
        // setShowNoteDetails(false);
    };

    const handlePDFLinkClick = (event, pdf) => {
        event.preventDefault();
        const resourceURL = `${API_ENDPOINT}/${pdf.file_type
            }/all/${encodeURIComponent(pdf.source_path)}`;
        setCurrentResource({ ...pdf });
        setResourceURL(resourceURL);
        setSummary(pdf.summary);
        setSummaries(pdf.topic_summaries);
        setActiveView(prev => [...prev, 'resource']);
        setJumpToPage({ page: parseInt(pdf.page) + 1 });
        workspaceContainer.current.scrollTo({
            top: 0,
            behavior: "smooth", // Enables smooth scrolling
        });
        // setShowNoteDetails(false);
    };

    return {
        handleVideoLinkClick,
        handlePDFLinkClick
    };
}