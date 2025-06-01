import { useContext } from 'react';
import { MainContext } from '../contexts/mainContext';

const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
export default function useReferenceLinkClick(isFromChat = false) {

    const {
        setCurrentResource, setFromChat,
        setResourceURL,
        setSummary,
        setJumpToPage,
        setShowMetadata,
        setSummaries,
        workspaceContainer,
        setActiveView
    } = useContext(MainContext);

    const handleVideoLinkClick = (event, video) => {
        if (event) event.preventDefault();
        setFromChat(isFromChat);
        const resourceURL = `${API_ENDPOINT}/${video.file_type
            }/all/${encodeURIComponent(video.source_path)}`;
        console.log(video);
        setCurrentResource({ ...video });
        setResourceURL(resourceURL);
        setSummary(video.summary);
        setSummaries(video.topic_summaries);
        setActiveView('resource');
        // workspaceContainer.current.scrollTo({
        //     top: 0,
        //     behavior: "smooth", // Enables smooth scrolling
        // });
        setShowMetadata(true);
        // setShowNoteDetails(false);
    };

    const handlePDFLinkClick = (event, pdf) => {
        if (event) event.preventDefault();
        const resourceURL = `${API_ENDPOINT}/${pdf.file_type
            }/all/${encodeURIComponent(pdf.source_path)}`;
        setCurrentResource({ ...pdf });
        setResourceURL(resourceURL);
        setSummary(pdf.summary);
        setSummaries(pdf.topic_summaries);
        setActiveView('resource');
        setJumpToPage({ page: parseInt(pdf?.page) + 1 });
        // workspaceContainer.current.scrollTo({
        //     top: 0,
        //     behavior: "smooth", // Enables smooth scrolling
        // });
        setShowMetadata(true);
        // setShowNoteDetails(false);
    };

    return {
        handleVideoLinkClick,
        handlePDFLinkClick
    };
}