
import { useContext, useEffect, useState } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';
import { timeToSeconds } from '../../utils';
import { ChapterDetailsModal } from '../ChapterDetailsModal';
import TimelineItem from '../TimelineItem';

function Timeline({ theme, chapters, workspaceContainer }) {

    const { isPlayerReady,
        setFromChat,
        resourceURL,
        currentResource,
        player } = useContext(MainContext);

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
    return (
        <div className="main relative m-auto w-full  max-w-[90vw] ">

            <div className="relative w-full timeline before:absolute before:rounded-lg before:top-0 before:left-1/2 before:w-1 before:h-full before:bg-primary-300">
                {
                    chapters.map((chapter, index) => {
                        const handleReadMoreClick = () => {
                            setSelectedChapter(chapter);
                            setShowChapterDetailsModal(true);
                        };
                        return <TimelineItem key={chapter.id} chapter={chapter} index={index} theme={theme} handleReadMoreClick={handleReadMoreClick} />;
                    })
                }
                {selectedChapter !== null && <ChapterDetailsModal show={showChapterDetailsModal} onHide={hideChapterDetails} chapter={selectedChapter} />}
            </div>
        </div>
    );
}
export default Timeline;