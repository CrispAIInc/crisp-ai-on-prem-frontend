
import { useState } from 'react';
import { ChapterDetailsModal } from '../ChapterDetailsModal';
import TimelineItem from '../TimelineItem';

function Timeline({ theme, chapters }) {

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