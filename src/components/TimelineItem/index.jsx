import { useContext, useState } from 'react';
import { MainContext } from '../../contexts/mainContext.jsx';
import PreviewModal from '../PreviewModal';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MenuBookIcon from '@mui/icons-material/MenuBook';

function TimelineItem({ chapter, index, theme, workspaceContainer, handleReadMoreClick }) {

    const thumbnail = import.meta.env.VITE_API_ENDPOINT + (chapter.keyframe_url ?? chapter.thumbnail_url);
    const { setJumpToPage,
        setCurrentResource, contentPanelContainerRef } = useContext(MainContext);

    const [isLightboxOpen, setLightboxOpen] = useState(false);
    function closeLightbox() {
        setLightboxOpen(false);
    }

    return <div key={chapter.id} className={`flex gap-4 p-2 h-auto ${index % 2 !== 0 && 'flex-row-reverse'}`}>
        {/* chapter card */}
        <div className={`timeline-item relative w-1/2 !px-5 ${index % 2 === 0 ? 'left-0 before:right-[0px] before:border-r-blue-500  before:border-r-8' : 'text-left before:left-[4px] ml-[9px] before:border-l-8 before:border-l-blue-500'} before:absolute before:top-1/2 before:-translate-y-1/2  before:w-0 before:h-0  before:border before:border-t-8 before:border-b-8  before:border-transparent before:z-10`}>
            <div className={`relative grid md:grid-cols-[30%,1fr] gap-3 p-3 bg-background rounded-md shadow-md content`}>
                <div className="w-full rounded-md cursor-pointer min-w-2/6" onClick={() => setLightboxOpen(true)}>
                    <img src={thumbnail} alt="chapter" className="object-cover w-full h-full rounded-md" />
                </div>
                {isLightboxOpen && (
                    <PreviewModal closeLightbox={closeLightbox} content={thumbnail} classNames={`h-full ${chapter.timestamp ? '!w-[55vw] !h-[65vh]' : '!w-1/3 !h-full'}`} />
                )}
                <div className={`flex flex-col gap-0 ${theme === 'dark' ? 'text-textColor-100' : " text-textColor-300"}`}>
                    {
                        chapter.timestamp ? <h5 className='mb-0 text-[9px] cursor-pointer font-bold text-primary-300 w-fit' onClick={() => {

                            setCurrentResource(prev => ({ ...prev, timestamp: chapter.timestamp[0] }));
                            contentPanelContainerRef.current.scrollTo({
                                top: 0,
                                behavior: "smooth", // Enables smooth scrolling
                            });
                        }}>
                            <AccessTimeIcon size="small" /> {chapter.timestamp[0]} - {chapter.timestamp[1]}
                        </h5> : <div className='flex items-center gap-2 mb-0 text-[9px] cursor-pointer font-bold text-primary-300 w-fit' onClick={() => {

                            setJumpToPage({ page: parseInt(chapter.page) });
                            contentPanelContainerRef.current.scrollTo({
                                top: 0,
                                behavior: "smooth", // Enables smooth scrolling
                            });
                        }}>
                            <MenuBookIcon /> <span className="text-md">{chapter.page}</span>
                        </div>
                    }
                    <h5 className="mb-0 text-lg font-semibold line-clamp-1">{chapter.title}</h5>
                    <p className="text-xs truncate line-clamp-2 text-wrap">{chapter.description}</p>
                    {/* </OverlayTrigger> */}
                    <p onClick={handleReadMoreClick} className="mt-2 text-sm font-semibold cursor-pointer text-primary-300">Read more</p>
                </div>
            </div>
        </div>
    </div>;
}

export default TimelineItem;