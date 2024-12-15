import { useState } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { MainContext } from '../../contexts/mainContext';
import { useContext } from 'react';
import { ChapterDetailsModal } from '../ChapterDetailsModal';

function TimelineHorizontal({ theme, chapters, workspaceContainer }) {

    const { setCurrentResource } = useContext(MainContext);

    const [selectedChapter, setSelectedChapter] = useState(null);
    const [showChapterDetailsModal, setShowChapterDetailsModal] = useState(false);

    const hideChapterDetails = () => {
        setShowChapterDetailsModal(false);
    };

    return (
        <div className="main overflow-x-auto overflow-y-hidden relative m-auto w-11/12 max-w-[90vw] py-10 custom-scroll">
            {/* Horizontal timeline container */}
            <div className="relative flex items-center w-max before:absolute before:top-1/2 before:left-0 before:h-1 before:rounded-full before:w-full before:bg-primary-300 before:-translate-y-1/2">
                {chapters.map((chapter, index) => (
                    <div
                        key={index}
                        className={`timeline-item  relative flex-shrink-0 w-48 p-4 ${index % 2 === 0 ? 'mt-10' : 'mb-10'
                            }`}
                    >
                        {/* Connector line for each dot */}
                        {/* <div className="absolute z-10 w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full top-1/2 left-1/2 bg-primary-300"></div> */}

                        {/* Timeline content */}
                        <div className="relative flex flex-col gap-2 p-2 rounded-md shadow-md bg-background">
                            {/* Image */}
                            <div className="w-full rounded-md">
                                <img
                                    src={chapter.thumbnail}
                                    alt="chapter"
                                    className="object-cover w-full h-20 rounded-md"
                                />
                            </div>
                            {/* Text Content */}
                            <div
                                className={`flex flex-col gap-0 ${theme === 'dark'
                                    ? 'text-textColor-100'
                                    : 'text-textColor-300'
                                    }`}
                            >
                                <h5 className="mb-0 text-[9px] cursor-pointer text-primary-300 w-fit" onClick={() => {

                                    setCurrentResource(prev => ({ ...prev, timestamp: chapter.timestamp[0] }));
                                    workspaceContainer.current.scrollTo({
                                        top: 0,
                                        behavior: "smooth", // Enables smooth scrolling
                                    });
                                }}>
                                    <AccessTimeIcon size="small" /> {chapter.timestamp[0]} -{' '}
                                    {chapter.timestamp[1]}
                                </h5>
                                <h5 className="mb-0 text-xs font-bold line-clamp-3">
                                    <abbr title={chapter.title}>{chapter.title}</abbr>
                                </h5>
                                {/* <OverlayTrigger className='tooltip' placement="bottom" overlay={(props) => renderTooltip(props, chapter.content)}> */}
                                <p className="text-xs truncate line-clamp-2 text-wrap">
                                    {chapter.description}
                                </p>
                                {/* </OverlayTrigger> */}
                                <p onClick={() => {
                                    setSelectedChapter(chapter);
                                    setShowChapterDetailsModal(true);
                                }} className="mt-2 text-sm font-semibold cursor-pointer text-primary-300">Read more</p>
                            </div>
                        </div>
                    </div>
                ))}
                {selectedChapter !== null && <ChapterDetailsModal show={showChapterDetailsModal} onHide={hideChapterDetails} chapter={selectedChapter} workspaceContainer={workspaceContainer} />}
            </div>
        </div>
    );
}

export default TimelineHorizontal;