import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useContext, useEffect, useState } from 'react';
// import OverlayTrigger from "react-bootstrap/OverlayTrigger";
// import Tooltip from "react-bootstrap/Tooltip";
import { MainContext } from '../../contexts/mainContext';
import { timeToSeconds } from '../../utils';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { ChapterDetailsModal } from '../ChapterDetailsModal';
import PreviewModal from '../PreviewModal';
import TimelineItem from '../TimelineItem';

function Timeline({ theme, chapters, workspaceContainer }) {

    // const { handleVideoLinkClick } = useReferenceLinkClick();

    const { setJumpToPage,
        isPlayerReady,
        setCurrentResource,
        setFromChat,
        resourceURL,
        currentResource,
        player } = useContext(MainContext);

    const [hoveredChapterId, setHoveredChapterId] = useState(-1);

    useEffect(() => {
        if (
            isPlayerReady &&
            resourceURL &&
            currentResource.file_type === "video"
        ) {
            const timestamp = currentResource?.timestamp; // Make sure you have the timestamp here
            if (timestamp !== undefined && timestamp !== null) {
                player.current.seekTo(typeof timestamp === "number" ? timestamp : timeToSeconds(timestamp));
            }
            setFromChat(false);
        }
    }, [isPlayerReady, currentResource, currentResource?.timestamp]);

    // const renderTooltip = (props, content) => (
    //     <Tooltip className='h-auto truncate tooltip' {...props}>{content}</Tooltip>
    // );

    const [selectedChapter, setSelectedChapter] = useState(null);
    const [showChapterDetailsModal, setShowChapterDetailsModal] = useState(false);

    const hideChapterDetails = () => {
        setShowChapterDetailsModal(false);
    };

    const [isLightboxOpen, setLightboxOpen] = useState(false);
    function closeLightbox() {
        setLightboxOpen(false);
    }


    return (
        <div className="main relative m-auto w-full  max-w-[90vw] ">
            {/* <div className="sticky top-0 left-0 right-0 z-20 h-8 pointer-events-none bg-gradient-to-b from-background to-transparent"></div> */}

            <div className="relative w-full timeline before:absolute before:rounded-lg before:top-0 before:left-1/2 before:w-1 before:h-full before:bg-primary-300">
                {
                    chapters.map((chapter, index) => {
                        const handleReadMoreClick = () => {
                            console.log("hello");
                            setSelectedChapter(chapter);
                            setShowChapterDetailsModal(true);
                        };
                        return <TimelineItem key={chapter.id} chapter={chapter} index={index} theme={theme} workspaceContainer={workspaceContainer} handleReadMoreClick={handleReadMoreClick} />;
                    })
                }
                {selectedChapter !== null && <ChapterDetailsModal show={showChapterDetailsModal} onHide={hideChapterDetails} chapter={selectedChapter} workspaceContainer={workspaceContainer} />}
            </div>

            {/* <div className="sticky bottom-0 left-0 right-0 z-20 h-8 pointer-events-none bg-gradient-to-t from-background to-transparent"></div> */}
        </div>
    );
}
export default Timeline;