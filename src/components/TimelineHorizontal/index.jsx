import { useState } from 'react';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { MainContext } from '../../contexts/mainContext.jsx';
import { useContext } from 'react';
import { ChapterDetailsModal } from '../ChapterDetailsModal';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PreviewModal from '../PreviewModal';
import GsFile from '../GsFile/index.jsx';

function TimelineHorizontal({ theme, chapters, workspaceContainer }) {

    const { setCurrentResource, setJumpToPage, contentPanelContainerRef } = useContext(MainContext);

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
        <div className={`main overflow-x-auto overflow-y-hidden relative m-auto w-11/12 max-w-[90vw] py-10 custom-scroll [&::-webkit-scrollbar]:h-1
        [&::-webkit-scrollbar-thumb]:rounded-full ${theme === "light" ? '[&::-webkit-scrollbar-track]:bg-gray-200 [&::-webkit-scrollbar-thumb]:bg-neutral-400 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-500' : '[&::-webkit-scrollbar-track]:bg-neutral-600 [&::-webkit-scrollbar-thumb]:bg-neutral-800 hover:[&::-webkit-scrollbar-thumb]:bg-neutral-900'}`}>
            {/* Horizontal timeline container */}
            <div className="relative flex items-center w-max before:absolute before:top-1/2 before:left-0 before:h-1 before:rounded-full before:w-full before:bg-primary-300 before:-translate-y-1/2">
                {chapters.map((chapter, index) => (
                    <div
                        key={index}
                        className={`timeline-item  relative flex-shrink-0 w-48 p-4 ${index % 2 === 0 ? 'mt-10' : 'mb-10'
                            }`}
                    >

                        {/* Timeline content */}
                        <div className={`relative flex flex-col gap-2 p-2 rounded-md shadow-md ${theme === 'light' ? 'bg-white' : 'bg-[radial-gradient(circle_at_20%_20%,rgba(171,95,199,0.10),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(119,83,237,0.08),transparent_45%),radial-gradient(circle_at_50%_80%,rgba(99,102,241,0.06),transparent_50%)] backdrop-blur-sm'}`}>
                            {/* Image */}
                            <div className="w-full rounded-md cursor-pointer" onClick={() => { setSelectedChapter(chapter); setLightboxOpen(true); }}>
                                <GsFile
                                    gsUrl={chapter.keyframe_url ?? chapter.thumbnail_url}
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
                                {
                                    chapter.timestamp ? <h5 className="mb-0 text-[9px] cursor-pointer text-primary-300 w-fit" onClick={() => {

                                        setCurrentResource(prev => ({ ...prev, timestamp: chapter.timestamp[0] }));
                                        workspaceContainer.current.scrollTo({
                                            top: 0,
                                            behavior: "smooth", // Enables smooth scrolling
                                        });
                                    }}>
                                        <AccessTimeIcon size="small" /> {chapter.timestamp[0]} -{' '}
                                        {chapter.timestamp[1]}
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
                                <h5 className="mb-0 text-xs font-bold line-clamp-3">
                                    <abbr title={chapter.title}>{chapter.title}</abbr>
                                </h5>
                                {/* <OverlayTrigger className='tooltip' placement="bottom" overlay={(props) => renderTooltip(props, chapter.content)}> */}
                                <p className="text-xs truncate line-clamp-2 text-wrap">
                                    {chapter.content}
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
                {(selectedChapter !== null && isLightboxOpen) && (
                    <PreviewModal closeLightbox={closeLightbox} content={selectedChapter.keyframe_url ?? selectedChapter.thumbnail_url} classNames="w-full sm:w-2/3 md:w-1/2 lg:w-1/3 h-full" />
                )}
                {selectedChapter !== null && <ChapterDetailsModal show={showChapterDetailsModal} onHide={hideChapterDetails} chapter={selectedChapter} />}
            </div>
        </div>
    );
}

export default TimelineHorizontal;