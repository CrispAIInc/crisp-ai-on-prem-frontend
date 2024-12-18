import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { useContext, useEffect, useState } from 'react';
// import OverlayTrigger from "react-bootstrap/OverlayTrigger";
// import Tooltip from "react-bootstrap/Tooltip";
import { MainContext } from '../../contexts/mainContext';
import { timeToSeconds } from '../../utils';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { ChapterDetailsModal } from '../ChapterDetailsModal';

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

    return (
        <div className="main relative m-auto w-full  max-w-[90vw] ">
            {/* <div className="sticky top-0 left-0 right-0 z-20 h-8 pointer-events-none bg-gradient-to-b from-background to-transparent"></div> */}

            <div className="relative w-full timeline before:absolute before:rounded-lg before:top-0 before:left-1/2 before:w-1 before:h-full before:bg-primary-300">
                {
                    chapters.map((chapter, index) => (
                        <div key={chapter.id} className={`flex gap-4 p-2 h-36 ${index % 2 !== 0 && 'flex-row-reverse'}`}>
                            {/* chapter card */}
                            <div className={`timeline-item relative w-1/2 !px-5 ${index % 2 === 0 ? 'left-0 before:right-[0px] before:border-r-blue-500  before:border-r-8' : 'text-left before:left-[4px] ml-[9px] before:border-l-8 before:border-l-blue-500'} before:absolute before:top-1/2 before:-translate-y-1/2  before:w-0 before:h-0  before:border before:border-t-8 before:border-b-8  before:border-transparent before:z-10`}>
                                <div className={`relative grid md:grid-cols-[30%,1fr] items-center gap-3 p-3 bg-background rounded-md shadow-md content`}>
                                    {/* <div className="absolute right-0 w-0 h-0 mr-4 border-t-8 border-b-8 border-r-8 border-transparent border-r-blue-500"></div> */}
                                    <div className="w-full rounded-md h-fit">
                                        <img src={chapter.thumbnail} alt="chapter" className="object-cover w-full h-full rounded-md" />
                                    </div>
                                    <div className={`flex flex-col gap-0 ${theme === 'dark' ? 'text-textColor-100' : " text-textColor-300"}`}>
                                        {
                                            chapter.timestamp ? <h5 className='mb-0 text-[9px] cursor-pointer font-bold text-primary-300 w-fit' onClick={() => {

                                                setCurrentResource(prev => ({ ...prev, timestamp: chapter.timestamp[0] }));
                                                workspaceContainer.current.scrollTo({
                                                    top: 0,
                                                    behavior: "smooth", // Enables smooth scrolling
                                                });
                                            }}>
                                                <AccessTimeIcon size="small" /> {chapter.timestamp[0]} - {chapter.timestamp[1]}
                                            </h5> : <div className='flex items-center gap-2 mb-0 text-[9px] cursor-pointer font-bold text-primary-300 w-fit' onClick={() => {

                                                setJumpToPage({ page: parseInt(chapter.page) });
                                                workspaceContainer.current.scrollTo({
                                                    top: 0,
                                                    behavior: "smooth", // Enables smooth scrolling
                                                });
                                            }}>
                                                <MenuBookIcon /> <span className="text-md">{chapter.page}</span>
                                            </div>
                                        }
                                        <h5 className="mb-0 text-lg font-semibold line-clamp-1">{chapter.title}</h5>
                                        {/* <OverlayTrigger className='tooltip' placement={index % 2 === 0 ? 'bottom' : "bottom"} overlay={(props) => renderTooltip(props, chapter.description)}> */}
                                        <p className="text-xs truncate line-clamp-2 text-wrap" onMouseEnter={() => setHoveredChapterId(chapter.id)} onMouseOver={() => setHoveredChapterId(-1)}>{chapter.description}</p>
                                        {/* </OverlayTrigger> */}
                                        <p onClick={() => {
                                            setSelectedChapter(chapter);
                                            setShowChapterDetailsModal(true);
                                        }} className="mt-2 text-sm font-semibold cursor-pointer text-primary-300">Read more</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                }
                {selectedChapter !== null && <ChapterDetailsModal show={showChapterDetailsModal} onHide={hideChapterDetails} chapter={selectedChapter} workspaceContainer={workspaceContainer} />}
            </div>

            {/* <div className="sticky bottom-0 left-0 right-0 z-20 h-8 pointer-events-none bg-gradient-to-t from-background to-transparent"></div> */}
        </div>
    );
}
export default Timeline;